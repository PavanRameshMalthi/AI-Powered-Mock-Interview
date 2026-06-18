const { body } = require("express-validator");

const passwordRule =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";

const strongPassword = () =>
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(passwordRule);

const registerRules = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
  body("email").trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  strongPassword(),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Password is required"),
];

const changePasswordRules = [
  body("currentPassword").isString().notEmpty().withMessage("Current password is required"),
  strongPassword(),
];

const forgotPasswordRules = [
  body("email").trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
];

const resetPasswordRules = [
  body("token").isString().isLength({ min: 20 }).withMessage("Reset token is invalid"),
  strongPassword(),
];

const verifyEmailRules = [
  body("token").isString().isLength({ min: 20 }).withMessage("Verification token is invalid"),
];

module.exports = {
  passwordRule,
  registerRules,
  loginRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
};
