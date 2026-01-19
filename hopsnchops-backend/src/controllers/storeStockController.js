const mongoose = require("mongoose");
const StoreStock = require("../models/storeStockModel");
const KitchenStocks = require("../models/kitchenStockModel");
const Products = require("../models/productsModel");

const normalizeDate = (d) => {
  const dt = new Date(d || Date.now());
  dt.setHours(0, 0, 0, 0);
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

exports.addStoreStock = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { productId: rawProductId, qty } = req.body;

    const productId = rawProductId?._id || rawProductId;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }
    const transferQty = Number(qty) || 0;
    if (transferQty <= 0) {
      return res.status(400).json({ success: false, message: "qty must be > 0" });
    }

    // Ensure product exists
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(400).json({ success: false, message: "Invalid productId" });
    }

    // Find latest store stock
    let storeStock = await StoreStock.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
    if (!storeStock) {
      // initialize if missing
      storeStock = await StoreStock.create({
        franchiseId,
        productId,
        openingStock: 0,
        rcvdStoreQty: 0,
        transfersToKitchenStore: 0,
        closingStock: 0,
        expiryDate: req.body.expiryDate
      });
    } else {
      rolloverIfNeeded(storeStock);
    }

    // Subtract from closingStock and record transfer out
    storeStock.transfersToKitchenStore = (storeStock.transfersToKitchenStore || 0) + transferQty;
    storeStock.closingStock = Math.max(0, (storeStock.openingStock || 0) + (storeStock.rcvdStoreQty || 0) - (storeStock.transfersToKitchenStore || 0));
    await storeStock.save();

    // Update or create kitchen stock (add to rcvdKitchenQty)
    let kitchenStock = await KitchenStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
    if (!kitchenStock) {
      kitchenStock = await KitchenStocks.create({
        franchiseId,
        productId,
        openingStock: 0,
        rcvdKitchenQty: transferQty,
        closingStock: transferQty,
      });
    } else {
      rolloverKitchenIfNeeded(kitchenStock);
      kitchenStock.rcvdKitchenQty = (kitchenStock.rcvdKitchenQty || 0) + transferQty;
      kitchenStock.closingStock = Math.max(0, (kitchenStock.openingStock || 0) + (kitchenStock.rcvdKitchenQty || 0) - (kitchenStock.transfersToConsumable || 0));
      await kitchenStock.save();
    }

    return res.status(201).json({
      success: true,
      message: "Transfer to kitchen recorded",
      data: { storeStock, kitchenStock }
    });

  } catch (error) {
    console.error("Error adding StoreStock:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Add multiple store stock entries at once (bulk operation)
exports.addBulkStoreStock = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const transfers = req.body.transfers || req.body;

    // Validation: ensure transfers is an array
    if (!Array.isArray(transfers)) {
      return res.status(400).json({ success: false, message: "transfers must be an array" });
    }

    if (transfers.length === 0) {
      return res.status(400).json({ success: false, message: "transfers array cannot be empty" });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each transfer
    for (let i = 0; i < transfers.length; i++) {
      try {
        const { productId: rawProductId, qty } = transfers[i];

        const productId = rawProductId?._id || rawProductId;
        if (!productId) {
          results.failed.push({
            index: i,
            error: "productId is required"
          });
          continue;
        }

        const transferQty = Number(qty) || 0;
        if (transferQty <= 0) {
          results.failed.push({
            index: i,
            productId,
            error: "qty must be > 0"
          });
          continue;
        }

        // Ensure product exists
        const product = await Products.findById(productId);
        if (!product) {
          results.failed.push({
            index: i,
            productId,
            error: "Invalid productId"
          });
          continue;
        }

        // Find latest store stock
        let storeStock = await StoreStock.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
        if (!storeStock) {
          // initialize if missing
          storeStock = await StoreStock.create({
            franchiseId,
            productId,
            openingStock: 0,
            rcvdStoreQty: 0,
            transfersToKitchenStore: 0,
            closingStock: 0,
            expiryDate: transfers[i].expiryDate
          });
        } else {
          rolloverIfNeeded(storeStock);
        }

        // Subtract from closingStock and record transfer out
        storeStock.transfersToKitchenStore = (storeStock.transfersToKitchenStore || 0) + transferQty;
        storeStock.closingStock = Math.max(0, (storeStock.openingStock || 0) + (storeStock.rcvdStoreQty || 0) - (storeStock.transfersToKitchenStore || 0));
        await storeStock.save();

        // Update or create kitchen stock (add to openingStock and rcvdKitchenQty)
        let kitchenStock = await KitchenStocks.findOne({ franchiseId, productId }).sort({ createdAt: -1 });
        if (!kitchenStock) {
          kitchenStock = await KitchenStocks.create({
            franchiseId,
            productId,
            openingStock: transferQty,
            rcvdKitchenQty: transferQty,
            closingStock: transferQty,
          });
        } else {
          kitchenStock.rcvdKitchenQty = (kitchenStock.rcvdKitchenQty || 0) + transferQty;
          kitchenStock.closingStock = Math.max(0, (kitchenStock.openingStock || 0) + (kitchenStock.rcvdKitchenQty || 0) - (kitchenStock.transfersToConsumable || 0));
          await kitchenStock.save();
        }

        results.successful.push({
          index: i,
          productId,
          data: { storeStock, kitchenStock }
        });
      } catch (itemErr) {
        results.failed.push({
          index: i,
          error: itemErr.message
        });
      }
    }

    const httpStatus = results.failed.length === 0 ? 201 : results.successful.length === 0 ? 400 : 207;
    return res.status(httpStatus).json({
      success: results.failed.length === 0,
      message: "Bulk transfer completed",
      data: results
    });

  } catch (error) {
    console.error("Error adding bulk StoreStock:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

exports.getStoreStock = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { search, categoryId, vendorId, companyId, fromDate, toDate, page = 1, limit = 50, sortBy = "createdAt", sortDir = "desc" } = req.query;

    const productQuery = { franchiseId };
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) productQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) productQuery.vendorsId = new mongoose.Types.ObjectId(vendorId);
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) productQuery.companyId = new mongoose.Types.ObjectId(companyId);
    if (search) productQuery.productName = { $regex: search, $options: "i" };

    const products = await Products.find(productQuery).select("_id").lean();
    const productIds = products.map(p => p._id);

    const query = { franchiseId };
    if (productIds.length > 0) query.productId = { $in: productIds };
    else if (categoryId || vendorId || companyId || search) {
      return res.status(200).json({ success: true, data: [], pagination: { page: 1, limit: Number(limit) || 50, total: 0, pages: 0 } });
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = normalizeDate(fromDate);
      if (toDate) {
        const t = normalizeDate(toDate);
        t.setHours(23, 59, 59, 999);
        query.createdAt.$lte = t;
      }
    }

    // Sanity Fix: Correct any negative closingStock or double-counting on creation day
    const today = normalizeDate(Date.now());
    await StoreStock.updateMany(
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
            closingStock: { $max: [0, { $subtract: [{ $add: [{ $cond: [{ $gte: ["$createdAt", today] }, 0, "$openingStock"] }, "$rcvdStoreQty"] }, "$transfersToKitchenStore"] }] }
          }
        }
      ]
    );

    // auto rollover: if last update before today, set openingStock = closingStock
    await StoreStock.updateMany({ franchiseId, updatedAt: { $lt: today } }, [
      {
        $set: {
          openingStock: "$closingStock",
          rcvdStoreQty: 0,
          transfersToKitchenStore: 0,
          closingStock: "$closingStock"
        }
      }
    ]);

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(500, parseInt(limit)));
    const sortOrder = sortDir === "asc" ? 1 : -1;
    const sortable = ["createdAt", "openingStock", "closingStock", "rcvdStoreQty", "transfersToKitchenStore"];
    const sortField = sortable.includes(sortBy) ? sortBy : "createdAt";

    const total = await StoreStock.countDocuments(query);
    let stocks = await StoreStock.find(query)
      .populate({
        path: "productId",
        select: "productName unit packSize taxableValue perUnitRate stockAlert categoryId vendorsId companyId expiryDate",
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
      pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) }
    });

  } catch (error) {
    console.error("Error fetching StoreStock:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

exports.updateStoreStock = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const updatedStoreStock = await StoreStock.findByIdAndUpdate(
      { _id: id, franchiseId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStoreStock) {
      return res.status(404).json({
        success: false,
        message: "StoreStock not found"
      });
    }

    const populated = await StoreStock.findById(updatedStoreStock._id)
      .populate({
        path: "productId",
        select: "productName unit packSize taxableValue perUnitRate stockAlert categoryId vendorsId companyId expiryDate",
        populate: [
          { path: "categoryId", select: "_id categoryName" },
          { path: "vendorsId", select: "_id vendor_name" },
          { path: "companyId", select: "_id brandName" }
        ]
      });

    return res.status(200).json({
      success: true,
      message: "StoreStock updated successfully",
      data: populated
    });

  } catch (error) {
    console.error("Error updating StoreStock:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

exports.deleteStoreStock = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;
    const deletedStoreStock = await StoreStock.findOneAndDelete({
      _id: id, franchiseId
    });

    if (!deletedStoreStock) {
      return res.status(404).json({
        success: false,
        message: "StoreStock not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "StoreStock deleted successfully",
      data: deletedStoreStock
    });

  } catch (error) {
    console.error("Error deleting StoreStock:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};
