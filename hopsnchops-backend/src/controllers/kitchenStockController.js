const mongoose = require("mongoose");
const KitchenStocks = require("../models/kitchenStockModel");
const ConsumableStocks = require("../models/consumableModel");
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
   POST → TRANSFER FROM KITCHEN -> CONSUMABLE
--------------------------------------------------------- */
exports.addKitchenStock = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { productId: rawProductId, qty, type } = req.body;

    const productId = rawProductId?._id || rawProductId;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });

    const transferQty = Number(qty);
    if (!transferQty || transferQty <= 0) {
      return res.status(400).json({ success: false, message: "qty must be > 0" });
    }

    const product = await Products.findById(productId);
    if (!product) {
      return res.status(400).json({ success: false, message: "Invalid productId" });
    }

    // --- find latest kitchen stock ---
    let kitchenStock = await KitchenStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
 
    if (!kitchenStock) {
      kitchenStock = await KitchenStocks.create({
        franchiseId,
        productId,
        openingStock: 0,
        rcvdKitchenQty: type === 'receipt' ? transferQty : 0,
        transfersToConsumable: type !== 'receipt' ? transferQty : 0,
        closingStock: type === 'receipt' ? transferQty : 0,
        expiryDate: req.body.expiryDate
      });
    } else {
      rolloverKitchenIfNeeded(kitchenStock);
      if (type === 'receipt') {
        kitchenStock.rcvdKitchenQty = (kitchenStock.rcvdKitchenQty || 0) + transferQty;
      } else {
        kitchenStock.transfersToConsumable = (kitchenStock.transfersToConsumable || 0) + transferQty;
      }
      kitchenStock.closingStock = Math.max(0, (kitchenStock.openingStock || 0) + (kitchenStock.rcvdKitchenQty || 0) - (kitchenStock.transfersToConsumable || 0));
      await kitchenStock.save();
    }

    // --- update/create consumable stock (ONLY for transfers out) ---
    let consumable = null;
    if (type !== 'receipt') {
      consumable = await ConsumableStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
  
      if (!consumable) {
        consumable = await ConsumableStocks.create({
          franchiseId,
          productId,
          openingStock: 0,
          rcvdKitchenQty: transferQty,
          closingStock: transferQty
        });
      } else {
        rolloverConsumableIfNeeded(consumable);
        consumable.rcvdKitchenQty += transferQty;
        consumable.closingStock = Math.max(0, 
          (consumable.openingStock || 0) +
          (consumable.rcvdKitchenQty || 0) -
          (consumable.transfersToUsage || 0)
        );

        await consumable.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: type === 'receipt' ? "Stock received in kitchen" : "Kitchen transfer recorded successfully",
      data: kitchenStock,
    });

  } catch (error) {
    console.error("Error adding kitchen stock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* ---------------------------------------------------------
   BULK ADD KITCHEN STOCK
--------------------------------------------------------- */
exports.addBulkKitchenStock = async (req, res) => {
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
        const { productId: rawProductId, qty, type } = transfers[i];

        const productId = rawProductId?._id || rawProductId;
        if (!productId) {
          results.failed.push({
            index: i,
            error: "productId is required"
          });
          continue;
        }

        const transferQty = Number(qty);
        if (!transferQty || transferQty <= 0) {
          results.failed.push({
            index: i,
            productId,
            error: "qty must be > 0"
          });
          continue;
        }

        const product = await Products.findById(productId);
        if (!product) {
          results.failed.push({
            index: i,
            productId,
            error: "Invalid productId"
          });
          continue;
        }

        // --- find latest kitchen stock ---
        let kitchenStock = await KitchenStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
 
        if (!kitchenStock) {
          kitchenStock = await KitchenStocks.create({
            franchiseId,
            productId,
            openingStock: 0,
            rcvdKitchenQty: type === 'receipt' ? transferQty : 0,
            transfersToConsumable: type !== 'receipt' ? transferQty : 0,
            closingStock: type === 'receipt' ? transferQty : 0,
            expiryDate: transfers[i].expiryDate
          });
        } else {
          rolloverKitchenIfNeeded(kitchenStock);
          if (type === 'receipt') {
            kitchenStock.rcvdKitchenQty = (kitchenStock.rcvdKitchenQty || 0) + transferQty;
          } else {
            kitchenStock.transfersToConsumable = (kitchenStock.transfersToConsumable || 0) + transferQty;
          }
          kitchenStock.closingStock = Math.max(0, (kitchenStock.openingStock || 0) + (kitchenStock.rcvdKitchenQty || 0) - (kitchenStock.transfersToConsumable || 0));
          await kitchenStock.save();
        }

        // --- update/create consumable stock (ONLY for transfers out) ---
        if (type !== 'receipt') {
          let consumable = await ConsumableStocks.findOne({ franchiseId, productId }).sort({ updatedAt: -1 });
  
          if (!consumable) {
            consumable = await ConsumableStocks.create({
              franchiseId,
              productId,
              openingStock: 0,
              rcvdKitchenQty: transferQty,
              closingStock: transferQty
            });
          } else {
            rolloverConsumableIfNeeded(consumable);
            consumable.rcvdKitchenQty += transferQty; 
            consumable.closingStock = Math.max(0, 
              (consumable.openingStock || 0) +
              (consumable.rcvdKitchenQty || 0) -
              (consumable.transfersToUsage || 0)
            );

            await consumable.save();
          }
        }

        results.successful.push({
          index: i,
          productId,
          data: kitchenStock
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
      message: "Bulk kitchen transfer completed",
      data: results
    });

  } catch (error) {
    console.error("Error adding bulk kitchen stock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* ---------------------------------------------------------
   GET → FILTER + SEARCH + PAGINATION + SORT
--------------------------------------------------------- */
exports.getKitchenStocks = async (req, res) => {
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
      sortDir = "desc"
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

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = normalizeDate(fromDate);
      if (toDate) {
        const t = normalizeDate(toDate);
        t.setHours(23, 59, 59, 999);
        query.createdAt.$lte = t;
      }
    }

    // auto rollover: if last update before today, set openingStock = closingStock
    const today = normalizeDate(Date.now());

    // --- RECOVERY & SANITY FIX ---
    // 1. Correct records with negative stock or double-counted opening stock
    await KitchenStocks.updateMany(
      { franchiseId, $or: [
        { closingStock: { $lt: 0 } },
        { 
          $and: [
            { createdAt: { $gte: today } },
            { openingStock: { $gt: 0 } }
          ]
        }
      ]},
      [{ $set: { 
          openingStock: { $cond: [{ $gte: ["$createdAt", today] }, 0, "$openingStock"] },
          closingStock: { $max: [0, { $subtract: [{ $add: [{ $cond: [{ $gte: ["$createdAt", today] }, 0, "$openingStock"] }, "$rcvdKitchenQty"] }, "$transfersToConsumable"] }] } 
      }}]
    );

    // 2. Cleanup "Phantom" Kitchen Stock created by the Purchase-to-Store bug
    // If openingStock is 0, rcvdKitchenQty should ideally match StoreStock.transfersToKitchenStore
    // unless there was a direct Purchase-to-Kitchen movement.
    const buggyKitchenStocks = await KitchenStocks.find({
      franchiseId,
      openingStock: 0,
      rcvdKitchenQty: { $gt: 0 },
      createdAt: { $gte: today }
    }).lean();

    const StoreStock = require("../models/storeStockModel");
    for (const kStock of buggyKitchenStocks) {
      const sStock = await StoreStock.findOne({ 
        franchiseId, 
        productId: kStock.productId,
        createdAt: { $gte: today }
      }).lean();

      if (sStock) {
        // If kitchen has more than what store sent, the difference is likely phantom stock from the bug
        // unless it was a direct purchase (type: receipt). 
        // We sync it back to what the Store actually recorded as transferred.
        const actualTransferred = sStock.transfersToKitchenStore || 0;
        if (kStock.rcvdKitchenQty > actualTransferred) {
          await KitchenStocks.updateOne(
            { _id: kStock._id },
            [
              { $set: { rcvdKitchenQty: actualTransferred } },
              { $set: { closingStock: { $max: [0, { $subtract: [{ $add: ["$openingStock", actualTransferred] }, "$transfersToConsumable"] }] } } }
            ]
          );
        }
      }
    }

    // 3. Cleanup: Remove completely empty records to avoid UI clutter
    await KitchenStocks.deleteMany({
      franchiseId,
      openingStock: 0,
      rcvdKitchenQty: 0,
      transfersToConsumable: 0,
      closingStock: 0
    });

    // 4. Rollover and reset daily quantities for previous days
    await KitchenStocks.updateMany({ franchiseId, updatedAt: { $lt: today } }, [
      {
        $set: {
          openingStock: "$closingStock",
          rcvdKitchenQty: 0,
          transfersToConsumable: 0,
          closingStock: "$closingStock"
        }
      }
    ]);

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(500, parseInt(limit)));
    const sortOrder = sortDir === "asc" ? 1 : -1;

    const sortable = [
      "createdAt",
      "openingStock",
      "closingStock",
      "rcvdKitchenQty",
      "transfersToConsumable"
    ];

    const sortField = sortable.includes(sortBy) ? sortBy : "createdAt";

    const total = await KitchenStocks.countDocuments(query);

    const stocks = await KitchenStocks.find(query)
      .populate({
        path: "productId",
        select: "productName unit packSize stockAlert categoryId vendorsId companyId expiryDate",
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
    console.error("Error fetching kitchen stock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* ---------------------------------------------------------
   EDIT KITCHEN STOCK
--------------------------------------------------------- */
exports.updateKitchenStock = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const updated = await KitchenStocks.findOneAndUpdate(
      { _id: id, franchiseId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "KitchenStock not found"
      });
    }

    const populated = await KitchenStocks.findById(updated._id)
      .populate({
        path: "productId",
        select: "productName unit packSize stockAlert categoryId vendorsId companyId expiryDate",
        populate: [
          { path: "categoryId", select: "_id categoryName" },
          { path: "vendorsId", select: "_id vendor_name" },
          { path: "companyId", select: "_id brandName" }
        ]
      });

    return res.status(200).json({
      success: true,
      message: "KitchenStock updated successfully",
      data: populated
    });

  } catch (error) {
    console.error("Error updating KitchenStock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/* ---------------------------------------------------------
   DELETE KITCHEN STOCK
--------------------------------------------------------- */
exports.deleteKitchenStock = async (req, res) => {
  try {
    const { id } = req.params;
    const franchiseId = req.user.franchiseId;

    const deleted = await KitchenStocks.findOneAndDelete({ _id: id, franchiseId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "KitchenStock not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "KitchenStock deleted successfully",
      data: deleted
    });

  } catch (error) {
    console.error("Error deleting KitchenStock:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
