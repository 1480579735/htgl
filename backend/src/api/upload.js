const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads/contracts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 使用时间戳+随机数作为文件名，避免中文乱码
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    // 保存原始文件名（使用 Buffer 处理中文）
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    req.fileOriginalName = originalName;
    cb(null, `${timestamp}-${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型，仅支持 PDF、JPG、PNG'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 上传文件
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: -1, msg: '请选择文件' });
    }
    
    // 获取原始文件名
    const originalName = req.fileOriginalName || req.file.originalname;
    
    const fileInfo = {
      id: Date.now(),
      originalName: originalName,
      fileName: req.file.filename,
      filePath: `/uploads/contracts/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadTime: new Date().toISOString()
    };
    
    console.log('文件上传成功:', fileInfo.originalName);
    
    res.json({ code: 0, data: fileInfo, msg: '上传成功' });
  } catch (err) {
    console.error('上传失败:', err);
    res.status(500).json({ code: -1, msg: err.message });
  }
});

module.exports = router;