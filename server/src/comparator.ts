import { chromium, Browser, Page } from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { v4 as uuidv4 } from 'uuid';

export interface Viewport {
  name: string;
  width: number;
  height: number;
}

export interface ComparisonConfig {
  reportId: string;
  reportDir: string;
  sourceA: string | null;
  sourceB: string | null;
  authHeadersA?: any;
  authHeadersB?: any;
  viewports: Viewport[];
}

export interface ComparisonResult {
  reportId: string;
  status: 'completed' | 'failed';
  message?: string;
  viewports: ViewportResult[];
}

export interface ViewportResult {
  name: string;
  resolution: string;
  diffPercentage: number;
  pixelsDifferent: number;
  matchPercentage: number;
  screenshotA: string;
  screenshotB: string;
  screenshotDiff: string;
  domDiff: any;
  performanceA: any;
  performanceB: any;
}

export const runComparison = async (config: ComparisonConfig): Promise<ComparisonResult> => {
  const browser = await chromium.launch({ headless: true });
  const results: ViewportResult[] = [];

  try {
    for (const viewport of config.viewports) {
      const viewportResult = await compareViewport(browser, viewport, config);
      results.push(viewportResult);
    }

    return {
      reportId: config.reportId,
      status: 'completed',
      viewports: results,
    };
  } catch (error: any) {
    console.error('Error running comparison:', error);
    return {
      reportId: config.reportId,
      status: 'failed',
      message: error.message,
      viewports: [],
    };
  } finally {
    await browser.close();
  }
};

async function compareViewport(browser: Browser, viewport: Viewport, config: ComparisonConfig): Promise<ViewportResult> {
  const pageA = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const pageB = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });

  try {
    // Set Auth Headers if provided
    if (config.authHeadersA) await pageA.setExtraHTTPHeaders(config.authHeadersA);
    if (config.authHeadersB) await pageB.setExtraHTTPHeaders(config.authHeadersB);

    // Load Sources
    const loadSource = async (page: Page, source: string) => {
      const waitOptions = { waitUntil: 'load' as const, timeout: 120000 };
      if (source.startsWith('http')) {
        await page.goto(source, waitOptions);
      } else {
        const html = await fs.readFile(source, 'utf-8');
        await page.setContent(html, waitOptions);
      }

      // 1. Wait for standard load states
      await page.waitForLoadState('load');
      await page.waitForLoadState('domcontentloaded');

      // 2. Scroll to bottom and back to top to trigger lazy loading / animations
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          let distance = 100;
          let timer = setInterval(() => {
            let scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve(null);
            }
          }, 100);
        });
        window.scrollTo(0, 0);
      });

      // 3. Final settle time for videos/animations/dynamic JS
      await page.waitForTimeout(3000); 
    };

    await Promise.all([
      loadSource(pageA, config.sourceA!),
      loadSource(pageB, config.sourceB!),
    ]);

    // Capture Performance
    const performanceA = await pageA.evaluate(() => {
      const [performanceNav] = performance.getEntriesByType('navigation') as any[];
      return {
        loadTime: performanceNav?.duration || 0,
        resources: performance.getEntriesByType('resource').map(r => ({ name: r.name, duration: r.duration, size: (r as any).transferSize })),
      };
    });

    const performanceB = await pageB.evaluate(() => {
      const [performanceNav] = performance.getEntriesByType('navigation') as any[];
      return {
        loadTime: performanceNav?.duration || 0,
        resources: performance.getEntriesByType('resource').map(r => ({ name: r.name, duration: r.duration, size: (r as any).transferSize })),
      };
    });

    // Take Screenshots
    const screenshotAPath = path.join(config.reportDir, `${viewport.name}-a.png`);
    const screenshotBPath = path.join(config.reportDir, `${viewport.name}-b.png`);
    const screenshotDiffPath = path.join(config.reportDir, `${viewport.name}-diff.png`);

    await pageA.screenshot({ 
      path: screenshotAPath, 
      fullPage: true, 
      timeout: 120000,
      animations: 'disabled'
    });
    await pageB.screenshot({ 
      path: screenshotBPath, 
      fullPage: true, 
      timeout: 120000,
      animations: 'disabled'
    });

    // Pixel Diff
    const imgA = PNG.sync.read(await fs.readFile(screenshotAPath));
    const imgB = PNG.sync.read(await fs.readFile(screenshotBPath));

    const width = Math.max(imgA.width, imgB.width);
    const height = Math.max(imgA.height, imgB.height);

    const padImage = (img: PNG, w: number, h: number) => {
      if (img.width === w && img.height === h) return img;
      const newImg = new PNG({ width: w, height: h });
      // PNG.bitblt(src, dst, srcX, srcY, width, height, dstX, dstY)
      PNG.bitblt(img, newImg, 0, 0, img.width, img.height, 0, 0);
      return newImg;
    };

    const paddedA = padImage(imgA, width, height);
    const paddedB = padImage(imgB, width, height);
    const diff = new PNG({ width, height });

    // Pixelmatch
    const pixelsDifferent = pixelmatch(paddedA.data, paddedB.data, diff.data, width, height, { threshold: 0.1 });
    await fs.writeFile(screenshotDiffPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const diffPercentage = (pixelsDifferent / totalPixels) * 100;
    const matchPercentage = 100 - diffPercentage;

    // DOM Diff - Simplifying: just extract elements and structural info
    const domA = await extractDOM(pageA);
    const domB = await extractDOM(pageB);

    return {
      name: viewport.name,
      resolution: `${viewport.width}x${viewport.height}`,
      diffPercentage: parseFloat(diffPercentage.toFixed(2)),
      pixelsDifferent,
      matchPercentage: parseFloat(matchPercentage.toFixed(2)),
      screenshotA: `${viewport.name}-a.png`,
      screenshotB: `${viewport.name}-b.png`,
      screenshotDiff: `${viewport.name}-diff.png`,
      performanceA,
      performanceB,
      domDiff: { domA, domB }, // Let frontend handle the diffing logic to show tree
    };

  } finally {
    await pageA.close();
    await pageB.close();
  }
}

async function extractDOM(page: Page) {
  return await page.evaluate(() => {
    function getElementInfo(el: Element): any {
      const styles = window.getComputedStyle(el);
      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        classList: Array.from(el.classList),
        styles: {
          display: styles.display,
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          margin: styles.margin,
          padding: styles.padding,
          textAlign: styles.textAlign,
        },
        rect: el.getBoundingClientRect(),
        children: Array.from(el.children).map(child => getElementInfo(child)),
      };
    }
    return getElementInfo(document.body);
  });
}
