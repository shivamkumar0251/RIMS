const VendorsList = require('../models/vendorListModel');
const fs = require('fs');
let xlsx;
try { xlsx = require('xlsx'); } catch (e) { xlsx = null; }


const safeEnum = (value, allowed, defaultValue) => allowed.includes(value) ? value : defaultValue;
const PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque"];
const GST_TYPES = ["Cgst Sgst", "Igst", "Non Gst", "Exempt"];
const REGISTRATION_TYPES = ["Composition", "Registered", "UnRegistered"];

// GET: return list of vendor names with ids
exports.getVendorNames = async (req, res) => {
    try {
        const franchiseId = req.user?.franchiseId;
        const query = {};
        if (franchiseId) query.franchiseId = franchiseId;
        const data = await VendorsList.find(query).select('vendor_name');
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('getVendorNames error:', err);
        return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// GET: list vendors with filters, search, pagination
exports.getVendors = async (req, res) => {
    try {
        const franchiseId = req.user?.franchiseId;
        const { search, fromDate, toDate, page = 1, limit = 50, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
        const query = {};
        if (franchiseId) query.franchiseId = franchiseId;

        if (search) {
            const s = String(search);
            query.$or = [
                { vendor_name: { $regex: s, $options: 'i' } },
                { vendor_mobileNo: { $regex: s, $options: 'i' } },
                { vendor_gstNumber: { $regex: s, $options: 'i' } }
            ];
        }

        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const d = new Date(toDate); d.setHours(23, 59, 59, 999); query.createdAt.$lte = d;
            }
        }

        const p = Math.max(1, parseInt(page));
        const l = Math.max(1, Math.min(1000, parseInt(limit)));
        const skip = (p - 1) * l;
        const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

        const [data, total] = await Promise.all([
            VendorsList.find(query).skip(skip).limit(l).sort(sort),
            VendorsList.countDocuments(query)
        ]);

        return res.status(200).json({ success: true, data, total, page: p, limit: l });
    } catch (err) {
        console.error('getVendors error:', err);
        return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// POST: create single vendor
exports.createVendor = async (req, res) => {
    try {
        const franchiseId = req.user?.franchiseId;
        if (!franchiseId) return res.status(400).json({ success: false, message: 'Franchise ID missing' });
        const {
            vendor_name,
            vendor_mobileNo,
            vendor_address,
            vendor_state,
            vendor_country,
            vendor_email,
            vendor_pinCode,
            vendor_bankName,
            vendor_accountNumber,
            vendor_ifscCode,
            vendor_paymentTerms,
            vendor_preferredPaymentMode,
            vendor_creditLimit,
            vendor_outstandingBalance,
            vendor_gstType,
            vendor_registrationType,
            vendor_gstNumber,
            vendor_openingBalance,
        } = req.body;
        const preferredPaymentMode = safeEnum(vendor_preferredPaymentMode, PAYMENT_MODES, "Bank Transfer");
        const gstType = safeEnum(vendor_gstType, GST_TYPES, "Non Gst");
        const registrationType = safeEnum(vendor_registrationType, REGISTRATION_TYPES, "Registered");
        const payload = {
            franchiseId,
            vendor_name,
            vendor_mobileNo,
            vendor_address,
            vendor_state,
            vendor_country: vendor_country || "India",
            vendor_pinCode,
            vendor_email,
            vendor_bankName,
            vendor_accountNumber,
            vendor_ifscCode,
            vendor_paymentTerms,
            vendor_preferredPaymentMode: preferredPaymentMode,
            vendor_creditLimit: Number(vendor_creditLimit) || 0,
            vendor_outstandingBalance: Number(vendor_outstandingBalance) || 0,
            vendor_gstType: gstType,
            vendor_registrationType: registrationType,
            vendor_gstNumber,
            vendor_openingBalance: Number(vendor_openingBalance) || 0,
        };
        const created = await VendorsList.create(payload);
        return res.status(201).json({ success: true, data: created });
    } catch (err) {
        console.error('createVendor error:', err);
        return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// POST: bulk create from Excel
exports.bulkCreateFromExcel = async (req, res) => {
    try {
        if (!xlsx) return res.status(500).json({ success: false, message: 'Dependency missing: install "xlsx" to use bulk upload' });
        const franchiseId = req.user?.franchiseId;
        if (!franchiseId) return res.status(400).json({ success: false, message: 'Franchise ID missing' });

        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: 'Excel file is required in req.file' });

        let workbook;
        if (file.buffer) workbook = xlsx.read(file.buffer, { type: 'buffer' });
        else workbook = xlsx.readFile(file.path);

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows || rows.length === 0) {
            if (file.path && fs.existsSync(file.path)) try { fs.unlinkSync(file.path); } catch (e) { }
            return res.status(400).json({ success: false, message: 'No rows found in Excel' });
        }


        const docs = rows
            .map((r) => {
                const vendor_preferredPaymentMode = safeEnum(r.vendor_preferredPaymentMode || r.preferredPaymentMode, PAYMENT_MODES, "Bank Transfer");
                const vendor_gstType = safeEnum(r.vendor_gstType || r.gstType, GST_TYPES, "Non Gst");
                const vendor_registrationType = safeEnum(r.vendor_registrationType || r.registrationType, REGISTRATION_TYPES, "Registered");
                return {
                    franchiseId,
                    vendor_name: r.vendor_name || r.vendorName || r["Vendor Name"] || r["vendor Name"] || "",
                    vendor_mobileNo: r.vendor_mobileNo || r.mobile || r["Mobile"] || "",
                    vendor_address: r.vendor_address || r.address || "",
                    vendor_state: r.vendor_state || r.state || "",
                    vendor_country: r.vendor_country || r.country || "India",
                    vendor_pinCode: r.vendor_pinCode || r.pincode || r.pin || "",
                    vendor_email: r.vendor_email || r.email || r.Email || r.EmailId || r.emailId || "",
                    vendor_bankName: r.vendor_bankName || r.bankName || "",
                    vendor_accountNumber: r.vendor_accountNumber || r.accountNumber || "",
                    vendor_ifscCode: r.vendor_ifscCode || r.ifsc || "",
                    vendor_paymentTerms: r.vendor_paymentTerms || "",
                    vendor_preferredPaymentMode,
                    vendor_creditLimit: Number(r.vendor_creditLimit || r.creditLimit || 0) || 0,
                    vendor_outstandingBalance: Number(r.vendor_outstandingBalance || r.outstanding || 0) || 0,
                    vendor_gstType,
                    vendor_registrationType,
                    vendor_gstNumber: r.vendor_gstNumber || r.gstNumber || "",
                    vendor_openingBalance: Number(r.vendor_openingBalance || r.openingBalance || 0) || 0,
                };
            })
            .filter((d) => d.vendor_name && d.vendor_name.trim().length > 0);


        if (docs.length === 0) {
            if (file.path && fs.existsSync(file.path)) try { fs.unlinkSync(file.path); } catch (e) { }
            return res.status(400).json({ success: false, message: 'No valid vendor rows found in Excel' });
        }

        try {
            const inserted = await VendorsList.insertMany(docs, { ordered: false });
            if (file.path && fs.existsSync(file.path)) try { fs.unlinkSync(file.path); } catch (e) { }
            return res.status(201).json({ success: true, insertedCount: inserted.length, data: inserted });
        } catch (insErr) {
            console.error('bulk insert error:', insErr);
            const inserted = insErr.insertedDocs || [];
            if (file.path && fs.existsSync(file.path)) try { fs.unlinkSync(file.path); } catch (e) { }
            return res.status(207).json({ success: false, message: 'Partial insert', insertedCount: inserted.length, error: insErr.message });
        }
    } catch (err) {
        console.error('bulkCreateFromExcel error:', err);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
        }
        return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// PUT: update vendor
exports.updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const franchiseId = req.user?.franchiseId;
        if (!id) return res.status(400).json({ success: false, message: 'id param required' });
        const existing = await VendorsList.findOne({ _id: id, franchiseId });
        if (!existing) return res.status(404).json({ success: false, message: 'Vendor not found' });
        const {
            vendor_name,
            vendor_mobileNo,
            vendor_address,
            vendor_state,
            vendor_country,
            vendor_email,
            vendor_pinCode,
            vendor_bankName,
            vendor_accountNumber,
            vendor_ifscCode,
            vendor_paymentTerms,
            vendor_preferredPaymentMode,
            vendor_creditLimit,
            vendor_outstandingBalance,
            vendor_gstType,
            vendor_registrationType,
            vendor_gstNumber,
            vendor_openingBalance,
        } = req.body;
        const preferredPaymentMode = safeEnum(vendor_preferredPaymentMode, PAYMENT_MODES, "Bank Transfer");
        const gstType = safeEnum(vendor_gstType, GST_TYPES, "Non Gst");
        const registrationType = safeEnum(vendor_registrationType, REGISTRATION_TYPES, "Registered");
        const payload = {
            franchiseId,
            vendor_name,
            vendor_mobileNo,
            vendor_address,
            vendor_state,
            vendor_country: vendor_country || "India",
            vendor_pinCode,
            vendor_email,
            vendor_bankName,
            vendor_accountNumber,
            vendor_ifscCode,
            vendor_paymentTerms,
            vendor_preferredPaymentMode: preferredPaymentMode,
            vendor_creditLimit: Number(vendor_creditLimit) || 0,
            vendor_outstandingBalance: Number(vendor_outstandingBalance) || 0,
            vendor_gstType: gstType,
            vendor_registrationType: registrationType,
            vendor_gstNumber,
            vendor_openingBalance: Number(vendor_openingBalance) || 0,
        };
        const updated = await VendorsList.findOneAndUpdate({ _id: id, franchiseId }, payload, { new: true, runValidators: true });
        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error('updateVendor error:', err);
        return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};

// DELETE: delete vendor by id
exports.deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const franchiseId = req.user?.franchiseId;
        if (!id) return res.status(400).json({ success: false, message: 'id param required' });
        const deleted = await VendorsList.findOneAndDelete({ _id: id, franchiseId });
        if (!deleted) return res.status(404).json({ success: false, message: 'Vendor not found' });
        return res.status(200).json({ success: true, data: deleted });
    } catch (err) {
        console.error('deleteVendor error:', err);
        return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};
