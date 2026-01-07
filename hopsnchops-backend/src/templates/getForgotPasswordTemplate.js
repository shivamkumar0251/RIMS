const getForgotPasswordTemplate = (url, message) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Forgot Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #4e8484; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">Gladhand Technologies Private Limited</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
            <p>Dear User,</p>

            <p>${message}</p>

            <div style="text-align:center; margin:30px 0;">
                <a href="${url}" 
                   style="display:inline-block; padding:12px 20px; background-color:#4e8484; color:#ffffff; text-decoration:none; border-radius:4px; font-weight:bold;">
                   Reset Password
                </a>
            </div>

            <p>If you did not request a password reset, please ignore this email or contact our support team immediately.</p>

            <p style="margin-top:20px;">Stay safe and secure!</p>

            <p style="margin-top:40px;">Warm regards,<br>
            <strong>Gladhand Technologies Private Limited</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 14px; color: #555;">
            <p>Ground Floor, ward no - 16, Sidhpur, Dharamshala, Distt: Kangra, Himachal Pradesh 176057</p>
            <p>📞 083508 76901 | 📧 info@gladhandtechnologies.com</p>
            <p style="font-size: 12px; color: #888;">This email was sent automatically. Please do not reply.</p>
        </div>

    </div>
</body>
</html>
`;
};

module.exports = {
  getForgotPasswordTemplate,
};
