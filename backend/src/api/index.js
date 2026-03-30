const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/contracts', require('./contracts'));
router.use('/parties', require('./parties'));
router.use('/payments', require('./payments'));
router.use('/upload', require('./upload'));
router.use('/users', require('./users')); 

router.get('/test', (req, res) => {
  res.json({ code: 0, message: 'API is working' });
});

module.exports = router;