import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Document from './models/Document.js';
import authRoutes from './routes/auth.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: "Too many requests, please try again later." }
});
app.use(apiLimiter);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge_repo')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/search', async (req, res) => {
  try {
    const { query, mode = 'OR', department } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let searchCriteria = {};

    if (query && query.trim()) {
      const trimmedQuery = query.trim();
      const tokens = trimmedQuery.split(/\s+/);
      const tokenClauses = tokens.map(token => ({
        $or: [
          { filename: { $regex: token, $options: 'i' } },
          { extracted_text: { $regex: token, $options: 'i' } }
        ]
      }));

      if (mode === 'AND') {
        searchCriteria = { $and: tokenClauses };
      } else {
        searchCriteria = { $or: tokenClauses };
      }
    }

    if (department && department !== 'All') {
      if (Object.keys(searchCriteria).length > 0) {
        searchCriteria = { 
          $and: [
            { 'metadata.department': department },
            searchCriteria
          ] 
        };
      } else {
        searchCriteria = { 'metadata.department': department };
      }
    }

    const [documents, totalResults] = await Promise.all([
      Document.find(searchCriteria).skip(skip).limit(limit),
      Document.countDocuments(searchCriteria)
    ]);

    const totalPages = Math.ceil(totalResults / limit) || 1;

    res.json({
      data: documents,
      totalPages,
      currentPage: page,
      totalResults
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'An error occurred while performing the search.' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const department = req.body.department || 'General';

    let extracted_text = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      extracted_text = data.text;
    }

    const newDoc = new Document({
      filename: req.file.originalname,
      file_type: 'PDF',
      fileUrl: `/uploads/${req.file.filename}`,
      extracted_text: extracted_text,
      metadata: { 
        department: department, 
        year: currentYear, 
        month: currentMonth, 
        uploadDate: now 
      }
    });

    await newDoc.save();
    
    res.status(201).json({ message: 'File categorized and uploaded successfully', document: newDoc });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'An error occurred while processing the upload.' });
  }
});

app.get('/api/documents/history', async (req, res) => {
  try {
    const history = await Document.find({})
      .sort({ 'metadata.uploadDate': -1 })
      .select('filename file_type metadata');
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the upload history.' });
  }
});

app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ error: err.message || 'An unexpected error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
