const { body, validationResult } = require('express-validator');

const rules = {
  contract: [
    body('name').notEmpty().withMessage('合同名称不能为空').isLength({ max: 100 }),
    body('amount').isFloat({ min: 0.01 }).withMessage('金额必须大于0'),
    body('custId').isInt().withMessage('请选择客户'),
    body('type').isIn(['purchase', 'sales', 'service', 'lease']).withMessage('合同类型无效'),
    body('signDate').isISO8601().withMessage('签订日期无效'),
    body('startDate').isISO8601().withMessage('开始日期无效'),
    body('endDate').isISO8601().withMessage('结束日期无效')
  ],
  customer: [
    body('name').notEmpty().withMessage('客户名称不能为空').isLength({ max: 100 }),
    body('code').notEmpty().withMessage('客户编码不能为空').isLength({ max: 50 }),
    body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式错误'),
    body('email').optional().isEmail().withMessage('邮箱格式错误')
  ],
  payment: [
    body('stage').notEmpty().withMessage('付款阶段不能为空'),
    body('amount').isFloat({ min: 0.01 }).withMessage('金额必须大于0'),
    body('dueDate').isISO8601().withMessage('到期日期无效'),
    body('type').isIn(['payment', 'receipt']).withMessage('类型无效')
  ]
};

function validate(type) {
  return [
    ...rules[type],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const msg = errors.array().map(e => e.msg).join('；');
        return res.status(400).json({ code: -1, msg });
      }
      next();
    }
  ];
}

module.exports = { validate };