const nodemailer = require('nodemailer')
const { EMAIL_USERNAME, EMAIL_PASSWORD } = require('../config/env')
const { getForgotPasswordTemplate } = require('../templates/getForgotPasswordTemplate')
const { userCredentialTemplate } = require('../templates/userCredentialTemplate')
const franchiseEnquiryTemplate = require('../templates/franchiseEnquiryTemplate')
let transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
})

const getMailOptions = (receiver, subject, text) => {
  return {
    from: EMAIL_USERNAME,
    to: receiver,
    subject: subject,
    html: text,
  }
}

const sendEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transport.sendMail(mailOptions, function (err, info) {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

exports.passwordSetMail = async (email, url, message) => {
  try {
    const mailOptions = getMailOptions(
      email,
      "Password Reset Request",
      getForgotPasswordTemplate(url, message)
    );

    const info = await sendEmail(mailOptions);
    console.log("Password reset email sent successfully:", info);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

exports.franchiseEnquiry = async (data) => {
  try {
    const mailOptions = getMailOptions(
      "developer6.gladhand@gmail.com",
      "Franchise Enquiry",
      franchiseEnquiryTemplate(data)
    );

    const info = await sendEmail(mailOptions);
    console.log("Franchise enquiry email sent successfully:", info);
  } catch (error) {
    console.error("Error sending franchise enquiry email:", error);
    throw error;
  }
};

exports.userCredential = async (email, password) => {
  try {
    const mailOptions = getMailOptions(
      email,
      "Your Account Credentials",
      userCredentialTemplate(email, password)
    );

    const info = await sendEmail(mailOptions);
    console.log("User Credential email sent successfully:", info);
  } catch (error) {
    console.error("Error sending User Credential email:", error);
    throw error;
  }
};
