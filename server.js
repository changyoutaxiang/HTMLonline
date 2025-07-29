const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 只允许HTML文件
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// 文件信息存储
let files = [];

// 获取所有文件列表
app.get('/api/files', (req, res) => {
  res.json(files);
});

// 上传HTML文件
app.post('/api/upload', upload.single('htmlFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileInfo = {
    id: crypto.randomBytes(8).toString('hex'),
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    uploadDate: new Date().toISOString(),
    url: `/view/${req.file.filename}`
  };

  files.push(fileInfo);
  
  res.json({
    success: true,
    file: fileInfo
  });
});

// 查看HTML文件
app.get('/view/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// 删除文件
app.delete('/api/files/:id', (req, res) => {
  const fileId = req.params.id;
  const fileIndex = files.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const file = files[fileIndex];
  const filePath = path.join(uploadsDir, file.filename);
  
  // 删除物理文件
  fs.unlinkSync(filePath);
  
  // 从数组中移除
  files.splice(fileIndex, 1);
  
  res.json({ success: true });
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});