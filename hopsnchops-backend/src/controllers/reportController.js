const mongoose = require("mongoose");
const Purchase = require("../models/purchaseModel");
const StoreStocks = require("../models/storeStockModel");
const KitchenStocks = require("../models/kitchenStockModel");
const ConsumableStocks = require("../models/consumableModel");
const Products = require("../models/productsModel");
const Vendors = require("../models/vendorListModel");
const Categories = require("../models/categoryModel");

const normalizeDate = (d) => {
  const dt = new Date(d || Date.now());
  dt.setHours(0, 0, 0, 0);
  return dt;
};

/**
 * PURCHASE REPORT
 * Returns aggregated purchase data with filters for vendor, product, category and date range
 */
exports.getPurchaseReport = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { fromDate, toDate, vendorId, productId, categoryId, page = 1, limit = 100 } = req.query;

    const query = { franchiseId };

    // Product-based filters
    let productFilter = { franchiseId };
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      productFilter._id = new mongoose.Types.ObjectId(productId);
    }
    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
      productFilter.vendorsId = new mongoose.Types.ObjectId(vendorId);
    }
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      productFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (Object.keys(productFilter).length > 1) {
      const matchingProducts = await Products.find(productFilter).select("_id").lean();
      const pids = matchingProducts.map(p => p._id);
      if (pids.length === 0) {
        return res.status(200).json({ success: true, data: [], total: 0 });
      }
      query.productId = { $in: pids };
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

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));

    const total = await Purchase.countDocuments(query);
    const purchases = await Purchase.find(query)
      .populate({
        path: "productId",
        select: "productName unit taxableValue perUnitRate categoryId vendorsId",
        populate: [
          { path: "categoryId", select: "categoryName" },
          { path: "vendorsId", select: "vendor_name" }
        ]
      })
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    return res.status(200).json({
      success: true,
      data: purchases,
      total,
      page: p,
      limit: l
    });
  } catch (error) {
    console.error("Purchase Report Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * STOCK REPORT
 * Returns current snapshot of stock across Store and Kitchen
 */
exports.getStockReport = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { categoryId, productId, stockStatus } = req.query;

    let productQuery = { franchiseId };
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      productQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      productQuery._id = new mongoose.Types.ObjectId(productId);
    }

    const products = await Products.find(productQuery)
      .populate("categoryId", "categoryName")
      .select("productName unit stockAlert categoryId")
      .lean();

    const reportData = await Promise.all(products.map(async (prod) => {
      const storeStock = await StoreStocks.findOne({ franchiseId, productId: prod._id }).sort({ updatedAt: -1 }).lean();
      const kitchenStock = await KitchenStocks.findOne({ franchiseId, productId: prod._id }).sort({ updatedAt: -1 }).lean();

      const storeQty = storeStock ? storeStock.closingStock : 0;
      const kitchenQty = kitchenStock ? kitchenStock.closingStock : 0;
      const totalQty = storeQty + kitchenQty;

      let status = "In Stock";
      if (totalQty <= 0) status = "Out of Stock";
      else if (totalQty <= (prod.stockAlert || 0)) status = "Low Stock";

      return {
        productId: prod._id,
        productName: prod.productName,
        unit: prod.unit,
        category: prod.categoryId?.categoryName || "N/A",
        storeQty,
        kitchenQty,
        totalQty,
        stockAlert: prod.stockAlert,
        status
      };
    }));

    // Filter by stockStatus if provided
    let filteredData = reportData;
    if (stockStatus === "low_stock") {
      filteredData = reportData.filter(item => item.status === "Low Stock");
    } else if (stockStatus === "out_of_stock") {
      filteredData = reportData.filter(item => item.status === "Out of Stock");
    } else if (stockStatus === "in_stock") {
      filteredData = reportData.filter(item => item.status === "In Stock");
    }

    return res.status(200).json({
      success: true,
      data: filteredData,
      total: filteredData.length
    });
  } catch (error) {
    console.error("Stock Report Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * CONSUMPTION REPORT
 * Analyzes kitchen usage and wastage over time
 */
exports.getConsumptionReport = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { fromDate, toDate, productId, categoryId } = req.query;

    let query = { franchiseId };

    // Product-based filters
    let productFilter = { franchiseId };
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      productFilter._id = new mongoose.Types.ObjectId(productId);
    }
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      productFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (Object.keys(productFilter).length > 1) {
      const matchingProducts = await Products.find(productFilter).select("_id").lean();
      const pids = matchingProducts.map(p => p._id);
      if (pids.length === 0) {
        return res.status(200).json({ success: true, data: [], total: 0 });
      }
      query.productId = { $in: pids };
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

    const consumptionData = await ConsumableStocks.find(query)
      .populate({
        path: "productId",
        select: "productName unit categoryId",
        populate: { path: "categoryId", select: "categoryName" }
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: consumptionData,
      total: consumptionData.length
    });
  } catch (error) {
    console.error("Consumption Report Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * SALES REPORT
 * Tracks total usage as sales, providing revenue estimates
 */
exports.getSalesReport = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { fromDate, toDate, productId, categoryId } = req.query;

    let query = { franchiseId, transfersToUsage: { $gt: 0 } };

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

    // Product-based filters
    let productFilter = { franchiseId };
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      productFilter._id = new mongoose.Types.ObjectId(productId);
    }
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      productFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (Object.keys(productFilter).length > 1) {
      const matchingProducts = await Products.find(productFilter).select("_id").lean();
      const pids = matchingProducts.map(p => p._id);
      if (pids.length === 0) {
        return res.status(200).json({ success: true, data: [], total: 0 });
      }
      query.productId = { $in: pids };
    }

    const salesData = await ConsumableStocks.find(query)
      .populate({
        path: "productId",
        select: "productName unit categoryId perUnitRate",
        populate: { path: "categoryId", select: "categoryName" }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Map to include sales values
    const processedData = salesData.map(item => {
      const qty = item.transfersToUsage || 0;
      const rate = item.productId?.perUnitRate || 0;
      return {
        ...item,
        salesQty: qty,
        rate: rate,
        totalSales: (qty * rate).toFixed(2),
      };
    });

    return res.status(200).json({
      success: true,
      data: processedData,
      total: processedData.length
    });
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * PURCHASE SOURCE REPORT
 * Differentiates between items purchased directly and via vendor orders
 */
exports.getPurchaseSourceReport = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { fromDate, toDate, productId, categoryId } = req.query;

    let query = { franchiseId };

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = normalizeDate(fromDate);
      if (toDate) {
        const t = normalizeDate(toDate);
        t.setHours(23, 59, 59, 999);
        query.createdAt.$lte = t;
      }
    }

    // Product and Category filters
    let productFilter = { franchiseId };
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      productFilter._id = new mongoose.Types.ObjectId(productId);
    }
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      productFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    let pids = [];
    if (Object.keys(productFilter).length > 1) {
      const matchingProducts = await Products.find(productFilter).select("_id").lean();
      pids = matchingProducts.map(p => p._id);
      if (pids.length === 0) {
        return res.status(200).json({ success: true, data: [], total: 0 });
      }
      query.productId = { $in: pids };
    }

    const purchaseData = await Purchase.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$productId",
          directQty: {
            $sum: {
              $cond: [
                { $or: [
                  { $eq: ["$purchaseType", "Direct"] },
                  { $eq: [{ $ifNull: ["$purchaseType", null] }, null] }
                ]},
                "$rcvdPurchaseQty",
                0
              ]
            }
          },
          orderQty: {
            $sum: {
              $cond: [{ $eq: ["$purchaseType", "Order"] }, "$rcvdPurchaseQty", 0]
            }
          },
          totalQty: { $sum: "$rcvdPurchaseQty" }
        }
      }
    ]);

    const reportData = await Promise.all(purchaseData.map(async (item) => {
      const product = await Products.findById(item._id)
        .populate("categoryId", "categoryName")
        .select("productName unit categoryId")
        .lean();

      if (!product) return null;

      // Fetch latest stock levels
      const storeStock = await StoreStocks.findOne({ franchiseId, productId: item._id }).sort({ updatedAt: -1 }).lean();
      const kitchenStock = await KitchenStocks.findOne({ franchiseId, productId: item._id }).sort({ updatedAt: -1 }).lean();

      return {
        productId: item._id,
        productName: product.productName,
        unit: product.unit,
        categoryName: product.categoryId?.categoryName || "N/A",
        directQty: item.directQty,
        orderQty: item.orderQty,
        totalQty: item.totalQty,
        storeQty: storeStock ? storeStock.closingStock : 0,
        kitchenQty: kitchenStock ? kitchenStock.closingStock : 0,
      };
    }));

    const finalData = reportData.filter(Boolean).sort((a, b) => a.productName.localeCompare(b.productName));

    return res.status(200).json({
      success: true,
      data: finalData,
      total: finalData.length
    });
  } catch (error) {
    console.error("Purchase Source Report Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
