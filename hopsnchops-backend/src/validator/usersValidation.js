const { validationResult, body } = require('express-validator');

const emailValidator = body('email')
  .isEmail()
  .withMessage('Email is not valid');

const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one digit')
  .matches(/[\W_]/)
  .withMessage('Password must contain at least one special character');


exports.validateLoginBody = [
    emailValidator,
    passwordValidator,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() }).end();
      }
      next();
    }
  ];