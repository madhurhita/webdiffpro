import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { runComparison } from './comparator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Explicitly allow all for CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
app.use('/reports', express.static(path.join(__dirname, '../public/reports')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post('/api/compare', upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), async (req: any, res: any) => {
  try {
    const { urlA, urlB, authHeadersA, authHeadersB } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const reportId = uuidv4();
    const reportDir = path.join(__dirname, `../public/reports/${reportId}`);
    await fs.ensureDir(reportDir);

    const config = {
      reportId,
      reportDir,
      sourceA: urlA || (files['fileA'] ? files['fileA'][0].path : null),
      sourceB: urlB || (files['fileB'] ? files['fileB'][0].path : null),
      authHeadersA: authHeadersA ? JSON.parse(authHeadersA) : {},
      authHeadersB: authHeadersB ? JSON.parse(authHeadersB) : {},
      viewports: [
        { name: 'desktop', width: 1920, height: 1080 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'mobile', width: 375, height: 667 },
      ],
    };

    if (!config.sourceA || !config.sourceB) {
      return res.status(400).json({ error: 'Missing source A or B (URL or File)' });
    }

    const result = await runComparison(config);
    
    res.json({ reportId, result });
  } catch (error: any) {
    console.error('Error during comparison:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
