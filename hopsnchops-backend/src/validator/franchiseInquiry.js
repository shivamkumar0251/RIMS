const { validationResult, body } = require("express-validator");

const fullNameValidator = body("fullName")
  .isString()
  .withMessage("Full name must be a string")
  .isLength({ min: 2 })
  .withMessage("Full name must be at least 2 characters long");

const emailValidator = body("email")
  .isEmail()
  .withMessage("Email is not valid");

const phoneValidator = body("phone")
  .isString()
  .withMessage("Phone must be a string")
  .matches(/^\d{10}$/)
  .withMessage("Phone must be exactly 10 digits");

const addressValidator = body("address")
  .isString()
  .withMessage("Address must be a string")
  .notEmpty()
  .withMessage("Address is required");

const pincodeValidator = body("pincode")
  .isNumeric()
  .withMessage("Pincode must be a number")
  .isLength({ min: 6, max: 6 })
  .withMessage("Pincode must be exactly 6 digits");

exports.validateFranchiseInquiry = [
  fullNameValidator,
  emailValidator,
  phoneValidator,
  addressValidator,
  pincodeValidator,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() }).end();
    }
    next();
  },
];
