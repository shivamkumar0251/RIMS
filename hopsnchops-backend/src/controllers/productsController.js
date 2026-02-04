const mongoose = require('mongoose');
const Products = require('../models/productsModel');
const Categorys = require('../models/categoryModel');
const Vendors = require('../models/vendorListModel');
const CompanyBrands = require('../models/companyModel');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
let xlsx;
try { xlsx = require('xlsx'); } catch (e) { xlsx = null; }


const toObjectId = (id) => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : undefined;
const safeEnum = (value, allowed, defaultValue) => allowed.includes(value) ? value : defaultValue;
const PRODUCT_TYPE = ["Inventory Item", "Packaging Item", "Equipment", "Crockery", "Furniture"]

const taxVal = (r, t) => {
  const rate = Number(r) || 0;
  const gst = Number(t) || 0;
  const tax = (rate * gst) / 100;
  return Number((rate + tax).toFixed(2));
};

// Helper: parse JSON fields when clients send form-data with JSON strings
const parseIfString = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (e) { return value; }
  }
  return value;
};

// Helper: detect if value is a valid ObjectId
const isObjectId = (val) => mongoose.Types.ObjectId.isValid(String(val));

// Helper: optional Cloudinary upload
const uploadFile = async (file, publicIdBase) => {
  if (!file) return null;
  if (cloudinary && typeof cloudinary.cloudinaryImageUpload === 'function') {
    try {
      const uploaded = await cloudinary.cloudinaryImageUpload(file.path, `${publicIdBase}_${Date.now()}`);
      return uploaded.secure_url || uploaded.original || uploaded.url || file.path || null;
    } catch (err) {
      console.error('cloudinary upload failed:', err.message || err);
      return file.path || null;
    }
  }
  return file.path || null;
};

// -------------------- Create Single Product --------------------
exports.createSingleProduct = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const imageFile = req.file || null;

    // Parse body: can be JSON or form fields
    let productData = parseIfString(req.body);
    if (Array.isArray(productData)) productData = productData[0]; // take first if array

    productData.franchiseId = franchiseId;

    // // CHECK DUPLICATE PRODUCT (name + franchise)
    // const existingProduct = await Products.findOne({
    //   franchiseId,
    //   productName: new RegExp(`^${productData.productName.trim()}$`, "i"),
    // }).select("_id");

    // if (existingProduct) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Product already exists with this name",
    //   });
    // }
    // Upload image if provided
    if (imageFile) {
      const img = await uploadFile(imageFile, `product`);
      if (img) productData.productImage = img;
    }

    const created = await Products.create({
      franchiseId,
      categoryId: toObjectId(productData.categoryId?._id || productData.categoryId),
      vendorsId: toObjectId(productData.vendorsId?._id || productData.vendorsId),
      companyId: toObjectId(productData.companyId?._id || productData.companyId),
      productName: productData.productName,
      productDescription: productData.productDescription,
      packSize: productData.packSize,
      unit: productData.unit,
      quantity: productData.quantity,
      shape: productData.shape,
      colour: productData.colour,
      printStatus: productData.printStatus,
      productImage: productData.productImage,
      gstPct: productData.gstPct,
      taxableValue: taxVal(productData.perUnitRate, productData.gstPct),
      perUnitRate: productData.perUnitRate,
      productType: safeEnum(productData.productType, PRODUCT_TYPE, "Inventory Item"),
      isActive: productData.isActive,
      expiryDate: productData.expiryDate,
      warrantyStart: productData.warrantyStart,
      warrantyEnd: productData.warrantyEnd,
      stockAlert: productData.stockAlert,
    });
    const populated = await Products.findById(created._id)
      .populate('categoryId', 'categoryName')
      .populate('vendorsId', 'vendor_name')
      .populate('companyId', 'brandName');

    return res.status(201).json({ success: true, message: 'Product added', data: populated });
  } catch (err) {
    console.error('createSingleProduct error:', err);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// -------------------- Create Bulk from Excel --------------------
exports.createBulkFromExcel = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    if (!req.file) return res.status(400).json({ success: false, message: 'No Excel file provided' });
    if (!req.file.originalname.endsWith('.xlsx') && !req.file.originalname.endsWith('.xls')) {
      return res.status(400).json({ success: false, message: 'File must be .xlsx or .xls' });
    }

    if (!xlsx) return res.status(500).json({ success: false, message: 'Dependency missing: install "xlsx" for Excel bulk upload' });

    let workbook;
    if (req.file.buffer) workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    else workbook = xlsx.readFile(req.file.path);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    if (!rows || rows.length === 0) return res.status(400).json({ success: false, message: 'No rows found in Excel' });

    // Build initial doc objects from rows
    const rawDocs = await Promise.all(
      rows.map(async (r) => {
        let productImage = "";
        if (r.ProductImage) {
          const img = await uploadFile(r.ProductImage, "product");
          if (img) productImage = img;
        }
        return {
          franchiseId,
          categoryId: r.CategoryName || "",
          vendorsId: r.VendorsName || "",
          companyId: r.CompanyName || "",
          productName: r.ProductName || "",
          productDescription: r.ProductDescription || "",
          packSize: r.PackSize || "",
          unit: r.Unit || "",
          quantity: Number(r.Quantity) || 0,
          shape: r.Shape || "",
          colour: r.Colour || "",
          productImage,
          printStatus: r.PrintStatus,
          gstPct: Number(r.GstPercentage) || 0,
          taxableValue: taxVal(r.PerUnitRate, r.GstPercentage) || 0,
          perUnitRate: Number(r.PerUnitRate) || 0,
          productType: safeEnum(r.ProductType, PRODUCT_TYPE, "Inventory Item"),
          isActive: r.IsActive !== undefined ? (String(r.IsActive).toLowerCase() === 'true') : true,
          expiryDate: r.ExpiryDate || "",
          warrantyStart: r.WarrantyStart || "",
          warrantyEnd: r.WarrantyEnd || "",
          stockAlert: Number(r.StockAlert) || 0,
        };
      })
    );

    // Resolve names (category/company/vendor) to ObjectIds if required
    const resolveToId = async (val, model, nameField) => {
      if (!val) return null;
      const s = String(val).trim();
      if (isObjectId(s)) return s;
      try {
        const found = await model.findOne({
          [nameField]: { $regex: new RegExp(`^${s}$`, "i") },
          franchiseId
        });
        return found ? String(found._id) : null;
      } catch (e) {
        return null;
      }
    };
    // // Get existing product names for this franchise
    // const existingProducts = await Products.find(
    //   { franchiseId },
    //   { productName: 1 }
    // ).lean();

    // const existingNameSet = new Set(
    //   existingProducts.map(p => p.productName.toLowerCase().trim())
    // );

    const docs = [];
    let skippedDuplicateCount = 0;
    for (const rd of rawDocs) {
      if (!rd.productName || String(rd.productName).trim().length === 0) continue;
      // const normalizedName = String(rd.productName).trim().toLowerCase();
      // //  Skip if product already exists
      // if (existingNameSet.has(normalizedName)) {
      //   skippedDuplicateCount++;
      //   continue;
      // }
      const doc = { ...rd };
      // category
      const catId = await resolveToId(doc.categoryId, Categorys, 'categoryName');
      if (catId) doc.categoryId = catId; else delete doc.categoryId;
      // vendor
      const vendId = await resolveToId(doc.vendorsId, Vendors, 'vendor_name');
      if (vendId) doc.vendorsId = vendId; else delete doc.vendorsId;
      // company/brand
      const compId = await resolveToId(doc.companyId, CompanyBrands, 'brandName');
      if (compId) doc.companyId = compId; else delete doc.companyId;

      docs.push(doc);
      // existingNameSet.add(normalizedName);
    }

    if (docs.length === 0) return res.status(400).json({ success: false, message: 'No valid product rows found in Excel' });

    try {
      const inserted = await Products.insertMany(docs, { ordered: false });
      return res.status(201).json({ success: true, insertedCount: inserted.length, data: inserted, skippedDuplicateCount });
    } catch (insErr) {
      console.error('bulk insert error:', insErr);
      const inserted = insErr.insertedDocs || [];
      return res.status(207).json({ success: false, message: 'Partial insert', insertedCount: inserted.length, skippedDuplicateCount, error: insErr.message });
    }
  } catch (err) {
    console.error('createBulkFromExcel error:', err);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// -------------------- Read (search/filter/pagination) --------------------
exports.getProducts = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { category, vendor, company, search, fromDate, toDate, productType, page = 1, limit = 50, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

    const query = { franchiseId };
    // const body = req.body
    const body = req.baseUrl

    // category: accept id(s) or name(s)
    if (category) {
      const catParts = String(category).split(',').map(v => v.trim()).filter(Boolean);
      const catIds = [];
      const catNames = [];
      catParts.forEach(p => {
        if (isObjectId(p)) catIds.push(new mongoose.Types.ObjectId(p));
        else catNames.push(p);
      });

      if (catNames.length > 0) {
        const found = await Categorys.find({ categoryName: { $in: catNames }, franchiseId }).select('_id');
        found.forEach(f => catIds.push(f._id));
      }

      if (catIds.length > 0) query.categoryId = { $in: catIds };
      else return res.status(200).json({ success: true, data: [], total: 0 });
    }

    // vendor: accept id(s) or name(s)
    if (vendor) {
      const venParts = String(vendor).split(',').map(v => v.trim()).filter(Boolean);
      const venIds = [];
      const venNames = [];
      venParts.forEach(p => {
        if (isObjectId(p)) venIds.push(new mongoose.Types.ObjectId(p));
        else venNames.push(p);
      });

      if (venNames.length > 0) {
        const found = await Vendors.find({ vendor_name: { $in: venNames }, franchiseId }).select('_id');
        found.forEach(f => venIds.push(f._id));
      }

      if (venIds.length > 0) query.vendorsId = { $in: venIds };
      else return res.status(200).json({ success: true, data: [], total: 0 });
    }

    // company: accept id(s) or name(s)
    if (company) {
      const compParts = String(company).split(',').map(v => v.trim()).filter(Boolean);
      const compIds = [];
      const compNames = [];
      compParts.forEach(p => {
        if (isObjectId(p)) compIds.push(new mongoose.Types.ObjectId(p));
        else compNames.push(p);
      });

      if (compNames.length > 0) {
        const found = await CompanyBrands.find({ brandName: { $in: compNames }, franchiseId }).select('_id');
        found.forEach(f => compIds.push(f._id));
      }

      if (compIds.length > 0) query.companyId = { $in: compIds };
      else return res.status(200).json({ success: true, data: [], total: 0 });
    }

    // search on productName
    if (search) {
      query.productName = { $regex: String(search), $options: 'i' };
    }

    if (productType) {
      const types = productType.split(',').map(t => t.trim());
      const validTypes = types.filter(t => PRODUCT_TYPE.includes(t));
      if (validTypes.length > 0) {
        query.productType = { $in: validTypes };
      }
    }

    // date range filtering on createdAt
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
    const l = Math.max(1, Math.min(500, parseInt(limit)));
    const skip = (p - 1) * l;

    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Products.find(query).skip(skip).limit(l).sort(sort)
        .populate('categoryId', 'categoryName')
        .populate('vendorsId', 'vendor_name')
        .populate('companyId', 'brandName'),
      Products.countDocuments(query)
    ]);

    return res.status(200).json({ success: true, data, total, page: p, limit: l });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// -------------------- Update (single) --------------------
exports.updateProducts = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const files = req?.files && req?.files?.length ? req?.files : [];
    // Single update: /products/:id
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'No ids provided' });
    }
    const existing = await Products.findOne({ _id: id, franchiseId });
    if (!existing) return res.status(404).json({ success: false, message: `Product not found` });
    const productData = req.body;
    // Upload image if provided
    if (files) {
      const img = await uploadFile(files, `product`);
      if (img) productData.productImage = img;
    }

    const payload = {
      franchiseId,
      categoryId: toObjectId(productData.categoryId?._id || productData.categoryId),
      vendorsId: toObjectId(productData.vendorsId?._id || productData.vendorsId),
      companyId: toObjectId(productData.companyId?._id || productData.companyId),
      productName: productData.productName,
      productDescription: productData.productDescription,
      packSize: productData.packSize,
      unit: productData.unit,
      quantity: productData.quantity,
      shape: productData.shape,
      colour: productData.colour,
      printStatus: productData.printStatus,
      productImage: productData.productImage,
      gstPct: productData.gstPct,
      taxableValue: taxVal(productData.perUnitRate, productData.gstPct),
      perUnitRate: productData.perUnitRate,
      productType: safeEnum(productData.productType, PRODUCT_TYPE, "Inventory Item"),
      isActive: productData.isActive,
      expiryDate: productData.expiryDate,
      warrantyStart: productData.warrantyStart,
      warrantyEnd: productData.warrantyEnd,
      stockAlert: productData.stockAlert,
    }

    const updated = await Products.findOneAndUpdate({ _id: id, franchiseId }, payload, { new: true, runValidators: true })
      .populate('categoryId', 'categoryName')
      .populate('vendorsId', 'vendor_name')
      .populate('companyId', 'brandName');

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('updateProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// -------------------- Delete (single or bulk) --------------------
exports.deleteProducts = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    const getPublicIdFromUrl = (url) => {
      if (!url || typeof url !== 'string') return null;
      try { const parts = url.split('/'); const last = parts[parts.length - 1]; return last.split('.')[0]; } catch (e) { return null }
    };

    // --- SINGLE DELETE ---
    if (id) {
      const product = await Products.findOne({ _id: id, franchiseId });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // 1. Delete Image from Cloudinary (async, don't block critical DB delete if this fails)
      const imageUrl = product.productImage || product.image || null;
      const publicId = getPublicIdFromUrl(imageUrl);
      if (publicId && cloudinary && typeof cloudinary.cloudinaryImageDelete === 'function') {
        // We catch error so image deletion failure doesn't prevent product deletion
        try { await cloudinary.cloudinaryImageDelete(publicId); } catch (e) { console.error('cloudinary delete warn:', e.message) }
      }

      // 2. Delete from DB
      const result = await Products.deleteOne({ _id: id, franchiseId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Product could not be deleted (not found or permission issue)' });
      }

      return res.status(200).json({ success: true, message: 'Product deleted successfully', data: { _id: id } });
    }

    // --- BULK DELETE ---
    const ids = Array.isArray(req.body.ids) ? req.body.ids : null;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No ids provided' });
    }

    // Optional: Delete images for bulk items
    try {
      const productsToDelete = await Products.find({ _id: { $in: ids }, franchiseId });
      for (const prod of productsToDelete) {
        const imageUrl = prod.productImage || prod.image || null;
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId && cloudinary && typeof cloudinary.cloudinaryImageDelete === 'function') {
          try { await cloudinary.cloudinaryImageDelete(publicId); } catch (e) { console.error('cloudinary delete warn:', e.message) }
        }
      }
    } catch (e) { console.error("Bulk image cleanup error", e); }

    const result = await Products.deleteMany({ _id: { $in: ids }, franchiseId });
    return res.status(200).json({ success: true, message: 'Bulk delete finished', deletedCount: result.deletedCount });

  } catch (err) {
    console.error('deleteProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};