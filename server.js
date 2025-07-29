const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

const { sequelize, File, initializeDatabase } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 确保上传目录存在 - 支持挂载硬盘
const uploadsDir = process.env.ZEABUR_MOUNT_PATH ? 
    path.join(process.env.ZEABUR_MOUNT_PATH, 'uploads') :
    path.join(__dirname, 'uploads');
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

// 获取所有文件列表
app.get('/api/files', async (req, res) => {
  try {
    const files = await File.findAll({
      order: [['uploadDate', 'DESC']]
    });
    
    const fileList = files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      filename: file.filename,
      size: file.size,
      uploadDate: file.uploadDate.toISOString(),
      url: `/view/${file.filename}`,
      accessCount: file.accessCount,
      lastAccessed: file.lastAccessed.toISOString()
    }));
    
    res.json(fileList);
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

// 上传HTML文件
app.post('/api/upload', upload.single('htmlFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileId = crypto.randomBytes(8).toString('hex');
    
    const fileRecord = await File.create({
      id: fileId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    
    res.json({
      success: true,
      file: {
        id: fileRecord.id,
        originalName: fileRecord.originalName,
        filename: fileRecord.filename,
        size: fileRecord.size,
        uploadDate: fileRecord.uploadDate.toISOString(),
        url: `/view/${fileRecord.filename}`,
        accessCount: fileRecord.accessCount,
        lastAccessed: fileRecord.lastAccessed.toISOString()
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 查看HTML文件
app.get('/view/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  try {
    // 更新访问计数
    await File.update({
      accessCount: sequelize.literal('accessCount + 1'),
      lastAccessed: new Date()
    }, {
      where: { filename: filename }
    });
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('访问文件失败:', error);
    res.status(404).send('File not found');
  }
});

// 删除文件
app.delete('/api/files/:id', async (req, res) => {
  const fileId = req.params.id;
  
  try {
    const file = await File.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, file.filename);
    
    // 删除物理文件
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // 从数据库中删除
    await file.destroy();
    
    res.json({ success: true });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
});

// 获取文件统计信息
app.get('/api/stats', async (req, res) => {
  try {
    const totalFiles = await File.count();
    const totalSize = await File.sum('size') || 0;
    const totalViews = await File.sum('accessCount') || 0;
    
    res.json({
      totalFiles,
      totalSize,
      totalViews,
      lastUpload: await File.findOne({
        order: [['uploadDate', 'DESC']]
      })
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    await initializeDatabase();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Uploads directory: ${uploadsDir}`);
      console.log(`Database: ${sequelize.config.storage}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();