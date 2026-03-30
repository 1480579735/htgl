const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

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
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // 处理中文文件名
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    req.fileOriginalName = originalName;
    
    // 如果有合同编号，添加到文件名中
    const contractCode = req.body.contractCode;
    if (contractCode) {
      cb(null, `${contractCode}_${timestamp}_${random}${ext}`);
    } else {
      cb(null, `${timestamp}_${random}${ext}`);
    }
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
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 上传合同附件
router.post('/contract', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: -1, message: '请选择文件' });
    }
    
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
    
    console.log(`文件上传成功: ${originalName} -> ${req.file.filename}`);
    
    res.json({
      code: 0,
      data: fileInfo,
      message: '上传成功'
    });
  } catch (err) {
    console.error('上传错误:', err);
    res.status(500).json({ code: -1, message: err.message });
  }
});

// 上传错误处理
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ code: -1, message: '文件大小不能超过10MB' });
    }
    return res.status(400).json({ code: -1, message: err.message });
  }
  next(err);
});

module.exports = router;