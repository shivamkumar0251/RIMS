const franchiseEnquiryTemplate = (data) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Franchise Enquiry</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background-color: #4e8484; padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">Franchise Enquiry</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
            <p>Hello Team,</p>

            <p>You have received a new franchise enquiry. Below are the details submitted by the interested party:</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Full Name:</td>
                    <td style="padding: 8px;">${data.fullName}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                    <td style="padding: 8px; font-weight: bold;">Email:</td>
                    <td style="padding: 8px;">${data.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Phone:</td>
                    <td style="padding: 8px;">${data.phone}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                    <td style="padding: 8px; font-weight: bold;">Address:</td>
                    <td style="padding: 8px;">${data.address}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Pincode:</td>
                    <td style="padding: 8px;">${data.pincode}</td>
                </tr>
                <tr style="background-color: #f9f9f9;">
                    <td style="padding: 8px; font-weight: bold;">Message:</td>
                    <td style="padding: 8px;">${data.message}</td>
                </tr>
            </table>

            <p style="margin-top: 20px;">Please follow up with the enquirer at the earliest opportunity.</p>

            <p style="margin-top: 30px;">Best regards,<br>
            <strong>Gladhand Technologies Private Limited</strong></p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 14px; color: #555;">
            <p>Ground Floor, ward no - 16, Sidhpur, Dharamshala, Distt: Kangra, Himachal Pradesh 176057</p>
            <p>📞 083508 76901 | 📧 info@gladhandtechnologies.com</p>
            <p style="font-size: 12px; color: #888;">This message was generated automatically. Please do not reply to this email.</p>
        </div>

    </div>
</body>
</html>
`;
};

module.exports = franchiseEnquiryTemplate;
