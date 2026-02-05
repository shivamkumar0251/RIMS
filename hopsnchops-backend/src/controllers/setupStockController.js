const mongoose = require("mongoose");
const SetupStocks = require("../models/setupStockModel");
const Products = require("../models/productsModel");

const normalizeDate = (d) => {
    const dt = new Date(d || Date.now());
    dt.setHours(0, 0, 0, 0);
    return dt;
};

// Rollover logic: If accessing record from a new day, reset daily counters
const rolloverIfNeeded = (doc) => {
    if (!doc) return;
    const today = normalizeDate(Date.now());
    const lastUpdate = normalizeDate(doc.updatedAt);

    if (lastUpdate < today) {
        // New day: Closing stock of yesterday becomes Opening stock of today
        doc.openingStock = doc.closingStock;
        doc.rcvdStockQty = 0;
        doc.issuedQty = 0;
        doc.damagedQty = 0;
    }
};

// Helper to process a single stock update
const processStockUpdate = async (franchiseId, { productId, qty, type, remarks }) => {
    const pid = productId?._id || productId;
    if (!pid) throw new Error("productId is required");

    const transferQty = Number(qty) || 0;
    if (transferQty <= 0) throw new Error("qty must be > 0");

    // Ensure product exists
    const product = await Products.findById(pid);
    if (!product) throw new Error(`Invalid productId: ${pid}`);

    // Find latest SetupStock
    let setupStock = await SetupStocks.findOne({ franchiseId, productId: pid }).sort({ updatedAt: -1 });
    if (!setupStock) {
        setupStock = await SetupStocks.create({
            franchiseId,
            productId: pid,
            openingStock: 0,
            rcvdStockQty: 0,
            issuedQty: 0,
            damagedQty: 0,
            closingStock: 0,
            remarks: remarks || ""
        });
    } else {
        rolloverIfNeeded(setupStock);
    }

    // Update quantities based on transaction type
    if (type === 'receipt') {
        setupStock.rcvdStockQty = (setupStock.rcvdStockQty || 0) + transferQty;
    } else if (type === 'issue') {
        setupStock.issuedQty = (setupStock.issuedQty || 0) + transferQty;
    } else if (type === 'damaged') {
        setupStock.damagedQty = (setupStock.damagedQty || 0) + transferQty;
    } else {
        throw new Error("Invalid type. Must be receipt, issue, or damaged");
    }

    // Recalculate Closing Stock
    const calculatedClosing = (setupStock.openingStock || 0) +
        (setupStock.rcvdStockQty || 0) -
        (setupStock.issuedQty || 0) -
        (setupStock.damagedQty || 0);

    setupStock.closingStock = Math.max(0, calculatedClosing);
    if (remarks) setupStock.remarks = remarks;

    await setupStock.save();
    return setupStock;
};

exports.addSetupStock = async (req, res) => {
    try {
        const franchiseId = req.user.franchiseId;
        const result = await processStockUpdate(franchiseId, req.body);
        return res.status(201).json({ success: true, message: "Setup Stock updated successfully", data: result });
    } catch (error) {
        console.error("Error adding SetupStock:", error);
        return res.status(error.message.includes("Invalid") ? 400 : 500).json({
            success: false,
            message: error.message || "Server Error"
        });
    }
};

exports.addBulkSetupStock = async (req, res) => {
    try {
        const franchiseId = req.user.franchiseId;
        const items = req.body; // Expecting array

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "No items provided" });
        }

        const results = [];
        const errors = [];

        // Process sequentially to be safe
        for (const item of items) {
            try {
                const res = await processStockUpdate(franchiseId, item);
                results.push(res);
            } catch (err) {
                console.error(`Error processing item ${item.productId}:`, err);
                errors.push({ productId: item.productId, error: err.message });
            }
        }

        if (results.length === 0 && errors.length > 0) {
            return res.status(400).json({ success: false, message: "All items failed to update", errors });
        }

        return res.status(201).json({
            success: true,
            message: `Processed ${results.length} items. ${errors.length} failed.`,
            data: results,
            errors
        });

    } catch (error) {
        console.error("Error adding Bulk SetupStock:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

exports.getSetupStock = async (req, res) => {
    try {
        const franchiseId = req.user.franchiseId;
        const { search, categoryId, vendorId, companyId, fromDate, toDate, page = 1, limit = 50, sortBy = "createdAt", sortDir = "desc" } = req.query;

        const productQuery = { franchiseId };
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) productQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
        if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) productQuery.vendorsId = new mongoose.Types.ObjectId(vendorId);
        if (companyId && mongoose.Types.ObjectId.isValid(companyId)) productQuery.companyId = new mongoose.Types.ObjectId(companyId);
        if (search) productQuery.productName = { $regex: search, $options: "i" };

        // Get products matching filters
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

        // Pagination
        const p = Math.max(1, parseInt(page));
        const l = Math.max(1, Math.min(500, parseInt(limit)));
        const sortOrder = sortDir === "asc" ? 1 : -1;
        const sortField = sortBy || "createdAt";

        const total = await SetupStocks.countDocuments(query);
        const stocks = await SetupStocks.find(query)
            .populate({
                path: "productId",
                select: "productName unit packSize taxableValue perUnitRate stockAlert categoryId vendorsId companyId expiryDate productType",
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
        console.error("Error fetching SetupStock:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

exports.updateSetupStock = async (req, res) => {
    try {
        const { id } = req.params;
        const franchiseId = req.user.franchiseId;
        const updates = req.body;

        const setupStock = await SetupStocks.findOne({ _id: id, franchiseId });
        if (!setupStock) {
            return res.status(404).json({ success: false, message: "SetupStock not found" });
        }

        // Allow updating specific fields
        if (updates.expiryDate !== undefined) setupStock.expiryDate = updates.expiryDate;
        if (updates.warrantyDate !== undefined) setupStock.warrantyDate = updates.warrantyDate;
        if (updates.remarks !== undefined) setupStock.remarks = updates.remarks;

        await setupStock.save();

        return res.status(200).json({ success: true, message: "SetupStock updated", data: setupStock });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

exports.deleteSetupStock = async (req, res) => {
    try {
        const { id } = req.params;
        const franchiseId = req.user.franchiseId;
        const deleted = await SetupStocks.findOneAndDelete({ _id: id, franchiseId });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "SetupStock not found" });
        }
        return res.status(200).json({ success: true, message: "SetupStock deleted", data: deleted });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
