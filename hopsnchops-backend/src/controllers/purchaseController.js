const mongoose = require('mongoose');
const Purchase = require('../models/purchaseModel');
const StoreStocks = require('../models/storeStockModel');
const Products = require('../models/productsModel');

// Helper: normalize a date to midnight (00:00:00)
const normalizeDate = (d) => {
  const dt = new Date(d || Date.now());
  dt.setHours(0,0,0,0);
  return dt;
};

// Helper: Rollover if record is from a previous day
const rolloverIfNeeded = (doc) => {
  if (!doc) return;
  const today = normalizeDate(Date.now());
  const lastUpdate = normalizeDate(doc.updatedAt);
  
  if (lastUpdate < today) {
    doc.openingStock = doc.closingStock;
    doc.rcvdStoreQty = 0;
    doc.transfersToKitchenStore = 0;
  }
};

// Create a new purchase (here: deduct from an existing purchase and push to StoreStocks)
exports.createPurchase = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { productId: rawProductId, sendToStoreQty } = req.body;

    // Accept productId or nested productId._id
    const productId = rawProductId?._id || rawProductId;

    // Validation: ensure productId and sendToStoreQty are provided
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }
    if (typeof sendToStoreQty === 'undefined' || sendToStoreQty === null) {
      return res.status(400).json({ success: false, message: 'sendToStoreQty is required' });
    }

    // Basic validation: ensure product exists
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(400).json({ success: false, message: 'Invalid productId' });
    }

    const sendQty = Number(sendToStoreQty) || 0;

    // Find the latest purchase for this product/franchise to deduct from currentPurchaseQty
    const purchase = await Purchase.findOne({ franchiseId, productId }).sort({ createdAt: -1 });
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'No purchase found for this product' });
    }

    // Update purchase: subtract from currentPurchaseQty and add to sendToStoreQty
    purchase.currentPurchaseQty = Math.max(0, (purchase.currentPurchaseQty || 0) - sendQty);
    purchase.sendToStoreQty = (purchase.sendToStoreQty || 0) + sendQty;
    await purchase.save();

    // Update StoreStocks: add sendToStoreQty to rcvdStoreQty and openingStock
    const stockFilter = { franchiseId, productId };
    let stockDoc = await StoreStocks.findOne(stockFilter).sort({ createdAt: -1 });
    
    if (!stockDoc) {
      // Create new StoreStocks record
      stockDoc = await StoreStocks.create({
        franchiseId,
        productId,
        openingStock: 0,
        rcvdStoreQty: sendQty,
        closingStock: sendQty
      });
    } else {
      // Rollover if it's a new day before updating
      rolloverIfNeeded(stockDoc);
      // Update existing StoreStocks record
      stockDoc.rcvdStoreQty = (stockDoc.rcvdStoreQty || 0) + sendQty;
      stockDoc.closingStock = Math.max(0, (stockDoc.openingStock || 0) + (stockDoc.rcvdStoreQty || 0) - (stockDoc.transfersToKitchenStore || 0));
      await stockDoc.save();
    }

    return res.status(201).json({ success: true, data: purchase });
  } catch (err) {
    console.error('createPurchase error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Create multiple purchases at once (bulk operation)
exports.createMultiplePurchases = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const purchases = req.body.purchases || req.body;

    // Validation: ensure purchases is an array
    if (!Array.isArray(purchases)) {
      return res.status(400).json({ success: false, message: 'purchases must be an array' });
    }

    if (purchases.length === 0) {
      return res.status(400).json({ success: false, message: 'purchases array cannot be empty' });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each purchase
    for (let i = 0; i < purchases.length; i++) {
      try {
        const { 
          productId: rawProductId, 
          sendToStoreQty,
          price,
          tax,
          rcvdPurchaseQty,
          currentPurchaseQty 
        } = purchases[i];

        // Accept productId or nested productId._id
        const productId = rawProductId?._id || rawProductId;

        // Validation: ensure productId and sendToStoreQty are provided
        if (!productId) {
          results.failed.push({
            index: i,
            error: 'productId is required'
          });
          continue;
        }

        if (typeof sendToStoreQty === 'undefined' || sendToStoreQty === null) {
          results.failed.push({
            index: i,
            productId,
            error: 'sendToStoreQty is required'
          });
          continue;
        }

        // Basic validation: ensure product exists
        const product = await Products.findById(productId);
        if (!product) {
          results.failed.push({
            index: i,
            productId,
            error: 'Invalid productId'
          });
          continue;
        }

        const sendQty = Number(sendToStoreQty) || 0;

        // Find the latest purchase for this product/franchise to deduct from currentPurchaseQty
        const purchase = await Purchase.findOne({ franchiseId, productId }).sort({ createdAt: -1 });
        if (!purchase) {
          results.failed.push({
            index: i,
            productId,
            error: 'No purchase found for this product'
          });
          continue;
        }

        // Update purchase with new values if provided (Editable fields)
        if (typeof price !== 'undefined') purchase.price = Number(price);
        if (typeof tax !== 'undefined') purchase.tax = Number(tax);
        if (typeof rcvdPurchaseQty !== 'undefined') purchase.rcvdPurchaseQty = Number(rcvdPurchaseQty);
        if (typeof currentPurchaseQty !== 'undefined') purchase.currentPurchaseQty = Number(currentPurchaseQty);

        // Update purchase: subtract from currentPurchaseQty and add to sendToStoreQty
        purchase.currentPurchaseQty = Math.max(0, (purchase.currentPurchaseQty || 0) - sendQty);
        purchase.sendToStoreQty = (purchase.sendToStoreQty || 0) + sendQty;
        await purchase.save();

        // Update StoreStocks: add sendToStoreQty to rcvdStoreQty and openingStock
        const stockFilter = { franchiseId, productId };
        let stockDoc = await StoreStocks.findOne(stockFilter).sort({ createdAt: -1 });
        
        if (!stockDoc) {
          // Create new StoreStocks record
          stockDoc = await StoreStocks.create({
            franchiseId,
            productId,
            openingStock: 0,
            rcvdStoreQty: sendQty,
            closingStock: sendQty
          });
        } else {
          // Rollover if it's a new day before updating
          rolloverIfNeeded(stockDoc);
          // Update existing StoreStocks record
          stockDoc.rcvdStoreQty = (stockDoc.rcvdStoreQty || 0) + sendQty;
          stockDoc.closingStock = Math.max(0, (stockDoc.openingStock || 0) + (stockDoc.rcvdStoreQty || 0) - (stockDoc.transfersToKitchenStore || 0));
          await stockDoc.save();
        }

        results.successful.push({
          index: i,
          productId,
          data: purchase
        });
      } catch (itemErr) {
        results.failed.push({
          index: i,
          error: itemErr.message
        });
      }
    }

    const httpStatus = results.failed.length === 0 ? 201 : results.successful.length === 0 ? 400 : 207;
    return res.status(httpStatus).json({ success: results.failed.length === 0, data: results });
  } catch (err) {
    console.error('createMultiplePurchases error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Get purchases (list, with optional filters)
exports.getPurchases = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { 
      search, 
      categoryId, 
      vendorId, 
      companyId, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortDir = 'desc'
    } = req.query;

    // Build product filter query
    const productQuery = { franchiseId };
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      productQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      productQuery.vendorsId = new mongoose.Types.ObjectId(vendorId);
    }
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      productQuery.companyId = new mongoose.Types.ObjectId(companyId);
    }
    if (search) productQuery.productName = { $regex: search, $options: 'i' };

    // Find matching product IDs
    const matchingProducts = await Products.find(productQuery).select('_id').lean();
    const productIds = matchingProducts.map(p => p._id);

    // Build purchase query
    const purchaseQuery = { franchiseId };
    if (productIds.length > 0) {
      purchaseQuery.productId = { $in: productIds };
    } else if (categoryId || vendorId || companyId || search) {
      // If we have filters but no matching products, return empty result
      return res.status(200).json({ 
        success: true, 
        data: [],
        pagination: {
          page: Math.max(1, parseInt(page)),
          limit: Math.max(1, Math.min(500, parseInt(limit))),
          total: 0,
          pages: 0
        }
      });
    }

    // Date range filter
    if (fromDate || toDate) {
      purchaseQuery.createdAt = {};
      if (fromDate) {
        const from = normalizeDate(fromDate);
        purchaseQuery.createdAt.$gte = from;
      }
      if (toDate) {
        const to = normalizeDate(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        purchaseQuery.createdAt.$lte = to;
      }
    }

    // Pagination
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(500, parseInt(limit)));
    const skip = (p - 1) * l;

    // Sorting
    const sortOrder = sortDir === 'asc' ? 1 : -1;
    let sortField = 'createdAt';
    if (sortBy === 'productName') {
      // For productName sorting, we'll need to sort after population
      sortField = 'createdAt';
    } else if (sortBy === 'sendToStoreQty') {
      sortField = 'sendToStoreQty';
    } else {
      sortField = 'createdAt';
    }

    // Count total matching documents
    const total = await Purchase.countDocuments(purchaseQuery);

    // Find purchases with pagination and sorting
    let purchases = await Purchase.find(purchaseQuery)
      .populate({
        path: 'productId',
        select: 'productName unit packSize taxableValue perUnitRate stockAlert categoryId vendorsId companyId',
        populate: [
          { path: 'categoryId', select: '_id categoryName' },
          { path: 'vendorsId', select: '_id vendor_name' },
          { path: 'companyId', select: '_id brandName' }
        ]
      })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(l)
      .lean();

    // Sort by productName if requested (after population)
    if (sortBy === 'productName') {
      purchases.sort((a, b) => {
        const nameA = a.productId?.productName || '';
        const nameB = b.productId?.productName || '';
        return sortOrder === 1 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: purchases,
      pagination: {
        page: p,
        limit: l,
        total,
        pages: Math.ceil(total / l)
      }
    });
  } catch (err) {
    console.error('getPurchases error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Update a purchase
exports.updatePurchase = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    const { sendToStoreQty } = req.body;

    // Validation
    if (typeof sendToStoreQty === 'undefined' || sendToStoreQty === null) {
      return res.status(400).json({ success: false, message: 'sendToStoreQty is required' });
    }

    // Find existing purchase
    const existing = await Purchase.findOne({ _id: id, franchiseId });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    const oldSendQty = existing.sendToStoreQty || 0;
    const newSendQty = Number(sendToStoreQty) || 0;
    const delta = newSendQty - oldSendQty;

    // Update purchase
    existing.sendToStoreQty = newSendQty;
    existing.rcvdPurchaseQty = newSendQty; // Update rcvdPurchaseQty to match sendToStoreQty
    existing.currentPurchaseQty = existing.rcvdPurchaseQty - existing.sendToStoreQty; // Should be 0
    await existing.save();

    // Update StoreStocks if there's a delta
    if (delta !== 0) {
      const stockFilter = { franchiseId, productId: existing.productId };
      let stockDoc = await StoreStocks.findOne(stockFilter).sort({ createdAt: -1 });
      
      if (!stockDoc) {
        // Create new StoreStocks record if it doesn't exist
        stockDoc = await StoreStocks.create({
          franchiseId,
          productId: existing.productId,
          openingStock: 0,
          rcvdStoreQty: newSendQty,
          closingStock: newSendQty
        });
      } else {
        // Rollover if it's a new day before updating
        rolloverIfNeeded(stockDoc);
        // Update existing StoreStocks record
        stockDoc.rcvdStoreQty = (stockDoc.rcvdStoreQty || 0) + delta;
        stockDoc.closingStock = Math.max(0, (stockDoc.openingStock || 0) + (stockDoc.rcvdStoreQty || 0) - (stockDoc.transfersToKitchenStore || 0));
        await stockDoc.save();
      }
    }

    return res.status(200).json({ success: true, data: existing });
  } catch (err) {
    console.error('updatePurchase error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Delete a purchase and rollback its effect on StoreStocks
exports.deletePurchase = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    // Find and delete purchase (ensuring franchise ownership)
    const deleted = await Purchase.findOneAndDelete({ _id: id, franchiseId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    // Rollback on StoreStocks
    const sendQty = deleted.sendToStoreQty || 0;
    if (sendQty > 0) {
      const stockFilter = { franchiseId, productId: deleted.productId };
      const stockDoc = await StoreStocks.findOne(stockFilter).sort({ updatedAt: -1 });
      
      if (stockDoc) {
        rolloverIfNeeded(stockDoc);
        stockDoc.rcvdStoreQty = Math.max(0, (stockDoc.rcvdStoreQty || 0) - sendQty);
        stockDoc.closingStock = Math.max(0, (stockDoc.openingStock || 0) + (stockDoc.rcvdStoreQty || 0) - (stockDoc.transfersToKitchenStore || 0));
        await stockDoc.save();
      }
    }

    return res.status(200).json({ success: true, message: 'Purchase deleted', data: deleted });
  } catch (err) {
    console.error('deletePurchase error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};
