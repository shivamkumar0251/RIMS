const { franchiseEnquiry } = require("../utils/nodeMailer");

exports.franchiseInquiry = async (req, res) => {
    try {
        // ✅ Call the franchise enquiry email function with the request data
        await franchiseEnquiry(req.body);

        return res.status(201).json({
            success: true,
            message: "Franchise inquiry submitted successfully"
        });

   } catch (error) {
        console.error("Franchise Inquiry Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


