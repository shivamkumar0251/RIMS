const mongoose = require("mongoose");
const ConsumableStocks = require("../models/consumableModel");
const KitchenStocks = require("../models/kitchenStockModel");
const Products = require("../models/productsModel");

const normalizeDate = (d) => {
  const dt = new Date(d || Date.now());
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const rolloverKitchenIfNeeded = (doc) => {
  if (!doc) return;
  const today = normalizeDate(Date.now());
  const lastUpdate = normalizeDate(doc.updatedAt);
  if (lastUpdate < today) {
    doc.openingStock = doc.closingStock;
    doc.rcvdKitchenQty = 0;
    doc.transfersToConsumable = 0;
  }
};

const rolloverConsumableIfNeeded = (doc) => {
  if (!doc) return;
  const today = normalizeDate(Date.now());
  const lastUpdate = normalizeDate(doc.updatedAt);
  if (lastUpdate < today) {
    doc.openingStock = doc.closingStock;
    doc.rcvdKitchenQty = 0;
    doc.transfersToUsage = 0;
    doc.transfersToWastage = 0;
  }
};

/* ---------------------------------------------------------
   POST → TRANSFER (USAGE / WASTAGE) FROM CONSUMABLE
--------------------------------------------------------- */
exports.addConsumableStock = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;

    const {
      productId: rawProductId,
      qty, // not used but keeping for safety
      transfersToUsage = 0,
      transfersToWastage = 0
    } = req.body;

    const productId = rawProductId?._id || rawProductId;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required"
      });
    }

    const usageQty = Number(transfersToUsage) || 0;
    const wastageQty = Number(transfersToWastage) || 0;

    const totalTransfer = usageQty + wastageQty;

    if (totalTransfer <= 0) {
      return res.status(400).json({
        success: false,
        message: "At least one qty field must be > 0"
      });
    }

    const product = await Products.findById(productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId"
      });
    }

    // --- Deduct from KitchenStock first (Transfer to Consumable) ---
    let kitchenStock = await KitchenStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
    if (kitchenStock) {
      rolloverKitchenIfNeeded(kitchenStock);
      kitchenStock.transfersToConsumable = (kitchenStock.transfersToConsumable || 0) + totalTransfer;
      kitchenStock.closingStock = Math.max(0, (kitchenStock.openingStock || 0) + (kitchenStock.rcvdKitchenQty || 0) - (kitchenStock.transfersToConsumable || 0));
      await kitchenStock.save();
    }

    // --- Update/Create Consumable record ---
    let consumable = await ConsumableStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });

    if (!consumable) {
      // Create new record if it doesn't exist
      // We assume it's being received from kitchen store at this moment
      consumable = await ConsumableStocks.create({
        franchiseId,
        productId,
        openingStock: 0,
        rcvdKitchenQty: totalTransfer,
        transfersToUsage: usageQty,
        transfersToWastage: wastageQty,
        closingStock: 0 // Will be handled by formula below
      });
    } else {
      // Rollover if new day
      rolloverConsumableIfNeeded(consumable);
      // Add usage & wastage
      consumable.transfersToUsage = (consumable.transfersToUsage || 0) + usageQty;
      consumable.transfersToWastage = (consumable.transfersToWastage || 0) + wastageQty;
    }

    // Recalculate closing stock
    consumable.closingStock = Math.max(
      0,
      (consumable.openingStock || 0) +
      (consumable.rcvdKitchenQty || 0) -
      (consumable.transfersToUsage || 0) -
      (consumable.transfersToWastage || 0)
    );

    await consumable.save();

    return res.status(201).json({
      success: true,
      message: "Consumable usage/wastage updated successfully",
      data: consumable
    });

  } catch (error) {
    console.error("Error updating consumable stock:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Add multiple consumable usage/wastage updates at once (bulk operation)
exports.addBulkConsumableStock = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const items = req.body.items || req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items must be an array' });
    }
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array cannot be empty' });
    }

    const results = { successful: [], failed: [] };

    for (let i = 0; i < items.length; i++) {
      try {
        const {
          productId: rawProductId,
          transfersToUsage = 0,
          transfersToWastage = 0
        } = items[i];

        const productId = rawProductId?._id || rawProductId;

        if (!productId) {
          results.failed.push({ index: i, error: 'productId is required' });
          continue;
        }

        const usageQty = Number(transfersToUsage) || 0;
        const wastageQty = Number(transfersToWastage) || 0;
        const totalTransfer = usageQty + wastageQty;

        if (totalTransfer <= 0) {
          results.failed.push({ index: i, productId, error: 'At least one qty field must be > 0' });
          continue;
        }

        const product = await Products.findById(productId);
        if (!product) {
          results.failed.push({ index: i, productId, error: 'Invalid productId' });
          continue;
        }

        // --- Deduct from KitchenStock first ---
        let kitchenStock = await KitchenStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
        if (kitchenStock) {
          rolloverKitchenIfNeeded(kitchenStock);
          kitchenStock.transfersToConsumable = (kitchenStock.transfersToConsumable || 0) + totalTransfer;
          kitchenStock.closingStock = Math.max(0, (kitchenStock.openingStock || 0) + (kitchenStock.rcvdKitchenQty || 0) - (kitchenStock.transfersToConsumable || 0));
          await kitchenStock.save();
        }

        // --- Update/Create Consumable record ---
        let consumable = await ConsumableStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });

        if (!consumable) {
          consumable = await ConsumableStocks.create({
            franchiseId,
            productId,
            openingStock: 0,
            rcvdKitchenQty: totalTransfer,
            transfersToUsage: usageQty,
            transfersToWastage: wastageQty,
            closingStock: 0
          });
        } else {
          // Rollover if new day
          rolloverConsumableIfNeeded(consumable);
          // Apply transfers
          consumable.transfersToUsage = (consumable.transfersToUsage || 0) + usageQty;
          consumable.transfersToWastage = (consumable.transfersToWastage || 0) + wastageQty;
        }

        consumable.closingStock = Math.max(
          0,
          (consumable.openingStock || 0) + (consumable.rcvdKitchenQty || 0) - (consumable.transfersToUsage || 0) - (consumable.transfersToWastage || 0)
        );

        await consumable.save();

        results.successful.push({ index: i, productId, data: consumable });
      } catch (itemErr) {
        results.failed.push({ index: i, error: itemErr.message });
      }
    }

    const httpStatus = results.failed.length === 0 ? 201 : results.successful.length === 0 ? 400 : 207;
    return res.status(httpStatus).json({ success: results.failed.length === 0, data: results });
  } catch (err) {
    console.error('addBulkConsumableStock error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

/* ---------------------------------------------------------
   GET → SEARCH + FILTER + PAGINATION + SORT
--------------------------------------------------------- */
exports.getConsumableStocks = async (req, res) => {
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
      sortBy = "createdAt",
      sortDir = "desc",
    } = req.query;

    const productQuery = { franchiseId };

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId))
      productQuery.categoryId = new mongoose.Types.ObjectId(categoryId);

    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId))
      productQuery.vendorsId = new mongoose.Types.ObjectId(vendorId);

    if (companyId && mongoose.Types.ObjectId.isValid(companyId))
      productQuery.companyId = new mongoose.Types.ObjectId(companyId);

    if (search)
      productQuery.productName = { $regex: search, $options: "i" };

    const products = await Products.find(productQuery).select("_id").lean();
    const productIds = products.map(p => p._id);

    const query = { franchiseId };

    if (productIds.length > 0) query.productId = { $in: productIds };
    else if (categoryId || vendorId || companyId || search) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 }
      });
    }

    // Date range
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = normalizeDate(fromDate);
      if (toDate) {
        const t = normalizeDate(toDate);
        t.setHours(23, 59, 59, 999);
        query.createdAt.$lte = t;
      }
    }

    // Auto update daily opening
    const today = normalizeDate(Date.now());

    // Sanity Fix: Correct any negative closingStock or double-counting on creation day
    await ConsumableStocks.updateMany(
      { 
        franchiseId, 
        $or: [
          { closingStock: { $lt: 0 } },
          { 
            $and: [
              { createdAt: { $gte: today } },
              { openingStock: { $gt: 0 } }
            ]
          }
        ]
      },
      [
        {
          $set: {
            openingStock: { $cond: [{ $gte: ["$createdAt", today] }, 0, "$openingStock"] },
            closingStock: { $max: [0, { $subtract: [{ $add: [{ $cond: [{ $gte: ["$createdAt", today] }, 0, "$openingStock"] }, "$rcvdKitchenQty"] }, { $add: ["$transfersToUsage", "$transfersToWastage"] }] }] }
          }
        }
      ]
    );

    await ConsumableStocks.updateMany(
      { franchiseId, updatedAt: { $lt: today } },
      [
        { 
          $set: { 
            openingStock: "$closingStock",
            rcvdKitchenQty: 0,
            transfersToUsage: 0,
            transfersToWastage: 0,
            closingStock: "$closingStock"
          } 
        }
      ]
    );

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(500, parseInt(limit)));
    const sortOrder = sortDir === "asc" ? 1 : -1;

    const sortable = [
      "createdAt",
      "openingStock",
      "closingStock",
      "rcvdConsumableQty",
      "transfersInUse",
      "transfersToWastage"
    ];

    const sortField = sortable.includes(sortBy) ? sortBy : "createdAt";

    const total = await ConsumableStocks.countDocuments(query);

    const stocks = await ConsumableStocks.find(query)
      .populate({
        path: "productId",
        select: "productName unit categoryId vendorsId companyId packSize stockAlert",
        populate: [
          { path: "categoryId", select: "_id categoryName" },
          { path: "vendorsId", select: "_id vendor_name" },
          { path: "companyId", select: "_id brandName" }
        ]
      })
      .sort({ [sortField]: sortOrder })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    return res.status(200).json({
      success: true,
      data: stocks,
      pagination: {
        page: p,
        limit: l,
        total,
        pages: Math.ceil(total / l)
      }
    });

  } catch (error) {
    console.error("Error fetching consumable stock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* ---------------------------------------------------------
   UPDATE CONSUMABLE STOCK
--------------------------------------------------------- */
exports.updateConsumableStock = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const updated = await ConsumableStocks.findOneAndUpdate(
      { _id: id, franchiseId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "ConsumableStock not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "ConsumableStock updated successfully",
      data: updated
    });

  } catch (error) {
    console.error("Error updating ConsumableStock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* ---------------------------------------------------------
   DELETE CONSUMABLE STOCK
--------------------------------------------------------- */
exports.deleteConsumableStock = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const deleted = await ConsumableStocks.findOneAndDelete({
      _id: id,
      franchiseId
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "ConsumableStock not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "ConsumableStock deleted successfully",
      data: deleted
    });

  } catch (error) {
    console.error("Error deleting ConsumableStock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
