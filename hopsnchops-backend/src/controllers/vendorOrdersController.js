const Vendors = require('../models/vendorListModel');
const Products = require('../models/productsModel');
const Categorys = require('../models/categoryModel');
const CompanyBrands = require('../models/companyModel');
const OrderRequired = require('../models/orderModel');
const Purchase = require('../models/purchaseModel');
const fs = require('fs');
let xlsx;
try { xlsx = require('xlsx'); } catch(e) { xlsx = null; }
const mongoose = require('mongoose');

const parseIfString = (v) => {
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch(e) { return v; }
  }
  return v;
};

const isObjectId = (val) => mongoose.Types.ObjectId.isValid(String(val));

// Create single vendor
exports.createVendor = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const body = parseIfString(req.body);
    if (!body.vendor_name || !String(body.vendor_name).trim()) return res.status(400).json({ success:false, message:'vendor_name required' });

    const payload = { franchiseId, ...body };
    const created = await Vendors.create(payload);
    return res.status(201).json({ success:true, data: created });
  } catch (err) {
    console.error('createVendor error:', err);
    return res.status(500).json({ success:false, message:'Server Error', error: err.message });
  }
};

// Bulk create from Excel file (multer single file -> req.file)
exports.bulkCreateFromExcel = async (req, res) => {
  try {
    if (!xlsx) return res.status(500).json({ success:false, message:'Dependency missing: install "xlsx" for bulk upload' });
    const franchiseId = req.user.franchiseId;
    const file = req.file;
    if (!file) return res.status(400).json({ success:false, message:'Excel file required in req.file' });

    let workbook;
    if (file.buffer) workbook = xlsx.read(file.buffer, { type: 'buffer' });
    else workbook = xlsx.readFile(file.path);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    if (!rows || rows.length === 0) return res.status(400).json({ success:false, message:'No rows found in Excel' });

    // Map sheet columns to vendor fields. Accept common column names.
    const docs = rows.map(r => {
      const vendor_name = r.vendor_name || r['Vendor Name'] || r.vendor || r.Name || '';
      const vendor_mobileNo = r.vendor_mobileNo || r.Mobile || r.mobile || r.phone || '';
      const vendor_address = r.vendor_address || r.Address || '';
      const vendor_gstNumber = r.vendor_gstNumber || r.GST || r.gst || '';
      return { franchiseId, vendor_name: String(vendor_name).trim(), vendor_mobileNo, vendor_address, vendor_gstNumber };
    }).filter(d => d.vendor_name && d.vendor_name.length > 0);

    if (docs.length === 0) return res.status(400).json({ success:false, message:'No valid vendor rows found' });

    try {
      const inserted = await Vendors.insertMany(docs, { ordered: false });
      return res.status(201).json({ success:true, insertedCount: inserted.length, data: inserted });
    } catch (insErr) {
      console.error('bulk insert vendors error:', insErr);
      const inserted = insErr.insertedDocs || [];
      return res.status(207).json({ success:false, message:'Partial insert', insertedCount: inserted.length, error: insErr.message });
    }
  } catch (err) {
    console.error('bulkCreateFromExcel error:', err);
    return res.status(500).json({ success:false, message:'Server Error', error: err.message });
  } finally {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch(e) { /* ignore */ }
    }
  }
};

// Get vendors with search, brand/category filters, date range and pagination
exports.getVendors = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { search, brand, category, fromDate, toDate, page = 1, limit = 50, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

    const query = { franchiseId };

    if (search) {
      query.$or = [
        { vendor_name: { $regex: String(search), $options: 'i' } },
        { vendor_mobileNo: { $regex: String(search), $options: 'i' } }
      ];
    }

    // Date range
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) { const d = new Date(toDate); d.setHours(23,59,59,999); query.createdAt.$lte = d; }
    }

    // Brand / Category filters: find product ids matching brand/category then filter vendors whose products array intersects
    let productFilter = {};
    if (brand) {
      if (isObjectId(brand)) productFilter.companyId = brand;
      else {
        const comp = await CompanyBrands.findOne({ brandName: brand, franchiseId });
        if (comp) productFilter.companyId = comp._id; else return res.status(200).json({ success:true, data: [], total: 0 });
      }
    }
    if (category) {
      if (isObjectId(category)) productFilter.categoryId = category;
      else {
        const cat = await Categorys.findOne({ categoryName: category, franchiseId });
        if (cat) productFilter.categoryId = cat._id; else return res.status(200).json({ success:true, data: [], total: 0 });
      }
    }

    if (Object.keys(productFilter).length > 0) {
      productFilter.franchiseId = franchiseId;
      const products = await Products.find(productFilter).select('_id');
      const pids = products.map(p => p._id);
      if (pids.length === 0) return res.status(200).json({ success:true, data: [], total: 0 });
      query.products = { $in: pids };
    }

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(1000, parseInt(limit)));
    const skip = (p-1)*l;
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      Vendors.find(query).skip(skip).limit(l).sort(sort),
      Vendors.countDocuments(query)
    ]);

    return res.status(200).json({ success:true, data, total, page: p, limit: l });
  } catch (err) {
    console.error('getVendors error:', err);
    return res.status(500).json({ success:false, message:'Server Error', error: err.message });
  }
};

// Update vendor by id
exports.updateVendor = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    if (!id) return res.status(400).json({ success:false, message:'id param required' });

    const existing = await Vendors.findOne({ _id: id, franchiseId });
    if (!existing) return res.status(404).json({ success:false, message:'Vendor not found' });

    const body = parseIfString(req.body);
    const update = { ...body };
    const updated = await Vendors.findOneAndUpdate({ _id: id, franchiseId }, update, { new: true, runValidators: true });
    return res.status(200).json({ success:true, data: updated });
  } catch (err) {
    console.error('updateVendor error:', err);
    return res.status(500).json({ success:false, message:'Server Error', error: err.message });
  }
};

// Delete vendor single or bulk
exports.deleteVendor = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    if (id) {
      const deleted = await Vendors.findOneAndDelete({ _id: id, franchiseId });
      if (!deleted) return res.status(404).json({ success:false, message:'Vendor not found' });
      return res.status(200).json({ success:true, data: deleted });
    }

    const ids = Array.isArray(req.body.ids) ? req.body.ids : null;
    if (!ids) return res.status(400).json({ success:false, message:'No ids provided' });
    const result = await Vendors.deleteMany({ _id: { $in: ids }, franchiseId });
    return res.status(200).json({ success:true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error('deleteVendor error:', err);
    return res.status(500).json({ success:false, message:'Server Error', error: err.message });
  }
};

// Update order product and create purchase record
exports.updateOrderProduct = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const body = parseIfString(req.body);
    const { orderId, productId, sendToPurchaseQty, remarks } = body;

    // Validation
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });
    if (sendToPurchaseQty === undefined || sendToPurchaseQty === null) {
      return res.status(400).json({ success: false, message: 'sendToPurchaseQty is required' });
    }
    if (typeof sendToPurchaseQty !== 'number' || sendToPurchaseQty < 0) {
      return res.status(400).json({ success: false, message: 'sendToPurchaseQty must be a non-negative number' });
    }

    // Find the order
    const order = await OrderRequired.findOne({ _id: orderId, franchiseId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Find the product in the order
    const productIndex = order.products.findIndex(
      p => p.productId && p.productId.toString() === productId.toString()
    );

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in order' });
    }

    // Get product details to fetch
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update the product in the order
    order.products[productIndex].sendToPurchaseQty = sendToPurchaseQty;
    if (remarks !== undefined) {
      order.products[productIndex].remarks = remarks;
    }

    // Calculate totalClosingAmount: sum of (sendToPurchaseQty * taxableValue) for all products
    // Fetch all product details at once for efficiency
    const productIds = order.products.map(p => p.productId).filter(Boolean);
    const productDetailsMap = {};
    if (productIds.length > 0) {
      const products = await Products.find({ _id: { $in: productIds } });
      products.forEach(p => {
        productDetailsMap[p._id.toString()] = p;
      });
    }

    let totalClosingAmount = 0;
    for (const prod of order.products) {
      const prodDetails = productDetailsMap[prod.productId?.toString()];
      if (prodDetails && prod.sendToPurchaseQty) {
        totalClosingAmount += (prod.sendToPurchaseQty * prodDetails.taxableValue);
      }
    }

    // Update paymentStatus based on comparison
    let paymentStatus = 'Pending';
    if (order.totalAmount === totalClosingAmount) {
      paymentStatus = 'Paid';
    } else if (totalClosingAmount > 0 && totalClosingAmount !== order.totalAmount) {
      paymentStatus = 'Partial';
    }

    // Update order
    order.totalClosingAmount = totalClosingAmount;
    order.paymentStatus = paymentStatus;
    await order.save();

    // Create or update Purchase record
    const existingPurchase = await Purchase.findOne({ 
      franchiseId, 
      productId 
    });

    if (existingPurchase) {
      // Update existing purchase: add sendToPurchaseQty to currentPurchaseQty
      existingPurchase.rcvdPurchaseQty = sendToPurchaseQty;
      existingPurchase.currentPurchaseQty = (existingPurchase.currentPurchaseQty || 0) + sendToPurchaseQty;
      await existingPurchase.save();
    } else {
      // Create new purchase record
      await Purchase.create({
        franchiseId,
        productId,
        rcvdPurchaseQty: sendToPurchaseQty,
        sendToStoreQty: 0,
        currentPurchaseQty: sendToPurchaseQty
      });
    }

    // Fetch updated order with populated products
    const updatedOrder = await OrderRequired.findById(orderId).populate('products.productId');

    return res.status(200).json({ 
      success: true, 
      message: 'Order product updated and purchase record created/updated',
      data: updatedOrder 
    });
  } catch (err) {
    console.error('updateOrderProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};
