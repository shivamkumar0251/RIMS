const CompanyBrands = require('../models/companyModel');
const fs = require('fs');
let xlsx;
try { xlsx = require('xlsx'); } catch (e) { xlsx = null; }

// Create single company/brand
exports.createCompany = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { brandName } = req.body;
    if (!brandName || !String(brandName).trim()) return res.status(400).json({ success: false, message: 'brandName is required' });

    const payload = { franchiseId, brandName: String(brandName).trim() };
    const created = await CompanyBrands.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('createCompany error:', err);
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Duplicate brandName' });
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Bulk create from Excel file (expects multer single file at req.file)
exports.bulkCreateFromExcel = async (req, res) => {
  try {
    if (!xlsx) return res.status(500).json({ success: false, message: 'Dependency missing: install "xlsx" to use bulk upload' });
    const franchiseId = req.user.franchiseId;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'Excel file is required in req.file' });

    let workbook;
    if (file.buffer) workbook = xlsx.read(file.buffer, { type: 'buffer' });
    else workbook = xlsx.readFile(file.path);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) return res.status(400).json({ success: false, message: 'No rows found in Excel' });

    const docs = rows.map((r) => {
      const brandName = r.brandName || r.Brand || r.brand || r['brand Name'] || r['Brand Name'] || '';
      return { franchiseId, brandName: String(brandName).trim() };
    }).filter(d => d.brandName && d.brandName.length > 0);

    if (docs.length === 0) return res.status(400).json({ success: false, message: 'No valid brandName columns found in Excel' });

    try {
      const inserted = await CompanyBrands.insertMany(docs, { ordered: false });
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      }
      return res.status(201).json({ success: true, insertedCount: inserted.length, data: inserted });
    } catch (insertErr) {
      console.error('bulk insert error:', insertErr);
      const inserted = insertErr.insertedDocs || [];
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      }
      return res.status(207).json({ success: false, message: 'Partial insert', insertedCount: inserted.length, error: insertErr.message });
    }
  } catch (err) {
    console.error('bulkCreateFromExcel error:', err);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Get with search, pagination and date filter
exports.getCompanies = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { search, fromDate, toDate, page = 1, limit = 50, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
    const query = { franchiseId };

    if (search) query.brandName = { $regex: String(search), $options: 'i' };
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const d = new Date(toDate);
        d.setHours(23, 59, 59, 999);
        query.createdAt.$lte = d;
      }
    }

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(1000, parseInt(limit)));
    const skip = (p - 1) * l;
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      CompanyBrands.find(query).skip(skip).limit(l).sort(sort),
      CompanyBrands.countDocuments(query)
    ]);

    return res.status(200).json({ success: true, data, total, page: p, limit: l });
  } catch (err) {
    console.error('getCompanies error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Update single company
exports.updateCompany = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'id param required' });

    const existing = await CompanyBrands.findOne({ _id: id, franchiseId });
    if (!existing) return res.status(404).json({ success: false, message: 'Company not found' });

    const update = {};
    if (req.body.brandName) update.brandName = String(req.body.brandName).trim();

    const updated = await CompanyBrands.findOneAndUpdate({ _id: id, franchiseId }, update, { new: true, runValidators: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('updateCompany error:', err);
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Duplicate brandName' });
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Delete single or bulk
exports.deleteCompany = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    if (id) {
      const deleted = await CompanyBrands.findOneAndDelete({ _id: id, franchiseId });
      if (!deleted) return res.status(404).json({ success: false, message: 'Company not found' });
      return res.status(200).json({ success: true, data: deleted });
    }

    const ids = Array.isArray(req.body.ids) ? req.body.ids : null;
    if (!ids) return res.status(400).json({ success: false, message: 'No ids provided' });
    const result = await CompanyBrands.deleteMany({ _id: { $in: ids }, franchiseId });
    return res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('deleteCompany error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};
