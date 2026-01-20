const mongoose = require('mongoose');
const OrderRequired = require('../models/orderModel');
const Purchase = require('../models/purchaseModel');
const Products = require('../models/productsModel');
const Categorys = require('../models/categoryModel');
const CompanyBrands = require('../models/companyModel');
const Vendors = require('../models/vendorListModel');

const isObjectId = (val) => mongoose.Types.ObjectId.isValid(String(val));

// Get all Products with currentPurchaseQty from Purchase model
exports.getProducts = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { search, brand, category, vendor, productType, fromDate, toDate, page = 1, limit = 50, sortBy = 'createdAt', sortDir = 'desc' } = req.query;
    const query = { franchiseId };

    const PRODUCT_TYPE = ["Inventory Item", "Packaging Item", "Equipment", "Crockery", "Furniture"];
    if (productType) {
      const types = String(productType).split(',').map(t => t.trim()).filter(Boolean);
      const validTypes = types.filter(t => PRODUCT_TYPE.includes(t));
      if (validTypes.length > 0) {
        query.productType = { $in: validTypes };
      }
    }

    // Filter by brand (company)
    if (brand) {
      const brandParts = String(brand).split(',').map(v => v.trim()).filter(Boolean);
      const brandIds = [];
      const brandNames = [];
      brandParts.forEach(p => {
        if (isObjectId(p)) brandIds.push(new mongoose.Types.ObjectId(p));
        else brandNames.push(p);
      });
      if (brandNames.length > 0) {
        const found = await CompanyBrands.find({ brandName: { $in: brandNames }, franchiseId }).select('_id');
        found.forEach(f => brandIds.push(f._id));
      }
      if (brandIds.length > 0) query.companyId = { $in: brandIds };
      else return res.status(200).json({ success: true, data: [], total: 0 });
    }

    // Filter by category
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

    // Filter by vendor
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

    // Search by product name
    if (search) {
      query.productName = { $regex: String(search), $options: 'i' };
    }

    // Date range filter
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

    // Fetch products
    const products = await Products.find(query)
      .skip(skip)
      .limit(l)
      .sort(sort)
      .populate('categoryId', 'categoryName')
      .populate('vendorsId', 'vendor_name')
      .populate('companyId', 'brandName');

    // Enrich with currentPurchaseQty from latest Purchase
    const enriched = await Promise.all(products.map(async (product) => {
      const latest = await Purchase.findOne({
        productId: product._id,
        franchiseId
      }).sort({ createdAt: -1 }).select('currentPurchaseQty');

      const doc = product.toObject();
      doc.currentPurchaseQty = latest ? latest.currentPurchaseQty : 0;
      return doc;
    }));

    const total = await Products.countDocuments(query);
    return res.status(200).json({
      success: true,
      data: enriched,
      total,
      page: p,
      limit: l
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Create bulk orders
exports.createBulkOrders = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    let ordersData = Array.isArray(req.body)
      ? req.body
      : (req.body.products && Array.isArray(req.body.products)
        ? req.body.products
        : (req.body.orders && Array.isArray(req.body.orders)
          ? req.body.orders
          : [req.body]));

    if (!Array.isArray(ordersData) || ordersData.length === 0) {
      return res.status(400).json({ success: false, message: 'orders array required with productId and orderQty' });
    }

    // Validate and prepare products array
    const productsArray = [];
    let totalAmount = 0;
    let totelOrderQty = 0;

    for (const orderItem of ordersData) {
      if (!orderItem.productId || orderItem.orderQty === undefined || orderItem.orderQty === null) {
        return res.status(400).json({
          success: false,
          message: 'Each order item must have productId and orderQty'
        });
      }

      // Fetch product to 
      const product = await Products.findOne({ _id: orderItem.productId, franchiseId });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with id ${orderItem.productId} not found`
        });
      }

      const orderQty = Number(orderItem.orderQty);
      if (orderQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'orderQty must be greater than 0'
        });
      }

      productsArray.push({
        productId: orderItem.productId,
        orderQty: orderQty
      });

      // Calculate total amount: taxableValue * orderQty
      totalAmount += (product.taxableValue || 0) * orderQty;
      totelOrderQty += orderQty;
    }

    // Create order with auto-generated orderNumber
    const orderData = {
      franchiseId,
      vendorsId: req.body.vendorsId || req.body.vendorId,
      products: productsArray,
      totalAmount,
      totelOrderQty,
      purchaseType: req.body.purchaseType || 'Order',
      orderDate: new Date()
    };

    const created = await OrderRequired.create(orderData);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('createBulkOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Get all orders with populated products
exports.getOrders = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { search, brand, category, vendor, productType, orderStatus, fromDate, toDate, page = 1, limit = 50, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

    const query = { franchiseId };

    // Build product filter for brand/category/vendor
    let productFilter = { franchiseId };
    const PRODUCT_TYPE = ["Inventory Item", "Packaging Item", "Equipment", "Crockery", "Furniture"];
    if (productType) {
      const types = String(productType).split(',').map(t => t.trim()).filter(Boolean);
      const validTypes = types.filter(t => PRODUCT_TYPE.includes(t));
      if (validTypes.length > 0) {
        productFilter.productType = { $in: validTypes };
      }
    }
    if (brand) {
      const parts = String(brand).split(',').map(v => v.trim()).filter(Boolean);
      const ids = [];
      const names = [];
      parts.forEach(p => { if (isObjectId(p)) ids.push(new mongoose.Types.ObjectId(p)); else names.push(p); });
      if (names.length > 0) {
        const found = await CompanyBrands.find({ brandName: { $in: names }, franchiseId }).select('_id');
        found.forEach(f => ids.push(f._id));
      }
      if (ids.length > 0) productFilter.companyId = { $in: ids };
      else return res.status(200).json({ success: true, data: [], total: 0 });
    }
    if (category) {
      const parts = String(category).split(',').map(v => v.trim()).filter(Boolean);
      const ids = [];
      const names = [];
      parts.forEach(p => { if (isObjectId(p)) ids.push(new mongoose.Types.ObjectId(p)); else names.push(p); });
      if (names.length > 0) {
        const found = await Categorys.find({ categoryName: { $in: names }, franchiseId }).select('_id');
        found.forEach(f => ids.push(f._id));
      }
      if (ids.length > 0) productFilter.categoryId = { $in: ids };
      else return res.status(200).json({ success: true, data: [], total: 0 });
    }
    if (vendor) {
      const parts = String(vendor).split(',').map(v => v.trim()).filter(Boolean);
      const ids = [];
      const names = [];
      parts.forEach(p => { if (isObjectId(p)) ids.push(new mongoose.Types.ObjectId(p)); else names.push(p); });
      if (names.length > 0) {
        const found = await Vendors.find({ vendor_name: { $in: names }, franchiseId }).select('_id');
        found.forEach(f => ids.push(f._id));
      }
      if (ids.length > 0) productFilter.vendorsId = { $in: ids };
      else return res.status(200).json({ success: true, data: [], total: 0 });
    }

    // If any product filter exists, find matching product IDs
    let matchingProductIds = null;
    if (Object.keys(productFilter).length > 1) {
      const products = await Products.find(productFilter).select('_id');
      matchingProductIds = products.map(p => p._id);
      if (matchingProductIds.length === 0) {
        return res.status(200).json({ success: true, data: [], total: 0 });
      }
    }

    // Search on product name
    if (search) {
      const searchFilter = { productName: { $regex: String(search), $options: 'i' }, franchiseId };
      const prods = await Products.find(searchFilter).select('_id');
      const searchPids = prods.map(p => p._id);
      if (searchPids.length === 0) {
        return res.status(200).json({ success: true, data: [], total: 0 });
      }
      if (matchingProductIds) {
        matchingProductIds = matchingProductIds.filter(id => searchPids.some(pid => pid.equals(id)));
      } else {
        matchingProductIds = searchPids;
      }
      if (matchingProductIds.length === 0) {
        return res.status(200).json({ success: true, data: [], total: 0 });
      }
    }

    // Filter orders by product IDs if needed
    if (matchingProductIds) {
      query['products.productId'] = { $in: matchingProductIds };
    }

    // Date range filter (using createdAt for consistency with other endpoints)
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const d = new Date(toDate);
        d.setHours(23, 59, 59, 999);
        query.createdAt.$lte = d;
      }
    }
    // ✅ Payment status filter
    if (orderStatus) {
      if (orderStatus === "Delivered") {
        query.orderStatus = { $ne: "Draft" };
      } else {

        query.orderStatus = orderStatus;
      }
    }

    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(1000, parseInt(limit)));
    const skip = (p - 1) * l;
    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };

    // Fetch orders with populated products
    const orders = await OrderRequired.find(query)
      .skip(skip)
      .limit(l)
      .sort(sort)
      .populate('vendorsId', 'vendor_name')
      .populate({
        path: 'products.productId',
        model: 'Products',
        populate: [
          { path: 'categoryId', model: 'Categorys', select: 'categoryName' },
          { path: 'vendorsId', model: 'VendorsList', select: 'vendor_name' },
          { path: 'companyId', model: 'CompanyBrands', select: 'brandName' }
        ]
      });

    const total = await OrderRequired.countDocuments(query);
    return res.status(200).json({
      success: true,
      data: orders,
      total,
      page: p,
      limit: l
    });
  } catch (err) {
    console.error('getOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Edit products array in OrderRequired
exports.updateOrderProducts = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'id param required' });
    }

    const existing = await OrderRequired.findOne({ _id: id, franchiseId });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, message: 'products must be an array' });
    }

    // Validate and prepare new products array
    const productsArray = [];
    let totalAmount = 0;
    let totelOrderQty = 0;

    for (const orderItem of products) {
      if (!orderItem.productId || orderItem.orderQty === undefined || orderItem.orderQty === null) {
        return res.status(400).json({
          success: false,
          message: 'Each product must have productId and orderQty'
        });
      }

      // Fetch product to get taxableValue
      const product = await Products.findOne({ _id: orderItem.productId, franchiseId });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with id ${orderItem.productId} not found`
        });
      }

      const orderQty = Number(orderItem.orderQty);
      if (orderQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'orderQty must be greater than 0'
        });
      }

      productsArray.push({
        productId: orderItem.productId,
        orderQty: orderQty
      });

      // Calculate total amount: taxableValue * orderQty
      totalAmount += (product.taxableValue || 0) * orderQty;
      totelOrderQty += orderQty;
    }

    // Update order
    const updated = await OrderRequired.findOneAndUpdate(
      { _id: id, franchiseId },
      {
        products: productsArray,
        totalAmount,
        totelOrderQty
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'products.productId',
      model: 'Products',
      populate: [
        { path: 'categoryId', model: 'Categorys', select: 'categoryName' },
        { path: 'vendorsId', model: 'VendorsList', select: 'vendor_name' },
        { path: 'companyId', model: 'CompanyBrands', select: 'brandName' }
      ]
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('updateOrderProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Delete order items (products) from order
exports.deleteOrderItems = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    const { productIds } = req.body; // Array of product IDs to remove from products array

    if (!id) {
      return res.status(400).json({ success: false, message: 'id param required' });
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'productIds array is required with at least one product ID'
      });
    }

    const existing = await OrderRequired.findOne({ _id: id, franchiseId });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Remove products from array
    const updatedProducts = existing.products.filter(
      p => !productIds.some(pid => String(p.productId) === String(pid))
    );

    // Check if all products are being removed
    if (updatedProducts.length === 0) {
      // If no products left, delete the whole order
      const deleted = await OrderRequired.findOneAndDelete({ _id: id, franchiseId });
      return res.status(200).json({
        success: true,
        message: 'Order deleted as no products remaining',
        data: deleted
      });
    }

    // Recalculate totalAmount and totelOrderQty
    let totalAmount = 0;
    let totelOrderQty = 0;

    for (const orderItem of updatedProducts) {
      const product = await Products.findById(orderItem.productId);
      if (product) {
        totalAmount += (product.taxableValue || 0) * (orderItem.orderQty || 0);
        totelOrderQty += (orderItem.orderQty || 0);
      }
    }

    const updated = await OrderRequired.findOneAndUpdate(
      { _id: id, franchiseId },
      {
        products: updatedProducts,
        totalAmount,
        totelOrderQty
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'products.productId',
      model: 'Products',
      populate: [
        { path: 'categoryId', model: 'Categorys', select: 'categoryName' },
        { path: 'vendorsId', model: 'VendorsList', select: 'vendor_name' },
        { path: 'companyId', model: 'CompanyBrands', select: 'brandName' }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Products removed from order',
      data: updated
    });
  } catch (err) {
    console.error('deleteOrderItems error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Delete whole order
exports.deleteOrder = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'id param required' });
    }

    const existing = await OrderRequired.findOne({ _id: id, franchiseId });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Delete whole OrderRequired
    const deleted = await OrderRequired.findOneAndDelete({ _id: id, franchiseId });
    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: deleted
    });
  } catch (err) {
    console.error('deleteOrder error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Update multiple products sendToPurchaseQty and remarks in order
exports.vendorUpdatesendToPurchaseQty = async (req, res) => {
  try {
    const franchiseId = req.user.franchiseId;
    const { id } = req.params;
    const { products, orderStatus } = req.body;

    // Validation
    if (!id) {
      return res.status(400).json({ success: false, message: 'id param required' });
    }

    // If neither products nor status is provided, it's a bad request
    if (!orderStatus && (!products || !Array.isArray(products) || products.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'products array or orderStatus is required'
      });
    }

    // Find the order
    const order = await OrderRequired.findOne({ _id: id, franchiseId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update orderStatus if provided
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    // If no products to update, just save the orderStatus and return
    if (!products || !Array.isArray(products) || products.length === 0) {
      await order.save();
      return res.status(200).json({
        success: true,
        message: 'Order orderStatus updated successfully',
        data: order
      });
    }

    // Validate each product in request
    for (const prod of products) {
      if (!prod.productId) {
        return res.status(400).json({
          success: false,
          message: 'productId is required for each product'
        });
      }
      if (prod.sendToPurchaseQty === undefined || prod.sendToPurchaseQty === null) {
        return res.status(400).json({
          success: false,
          message: 'sendToPurchaseQty is required for each product'
        });
      }
      if (typeof prod.sendToPurchaseQty !== 'number' || prod.sendToPurchaseQty < 0) {
        return res.status(400).json({
          success: false,
          message: 'sendToPurchaseQty must be a non-negative number'
        });
      }

      // Check if product exists in order
      const productExists = order.products.some(
        p => p.productId && p.productId.toString() === prod.productId.toString()
      );
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: `Product with id ${prod.productId} not found in order`
        });
      }
    }

    // Fetch all product details at once for efficiency
    const productIds = products.map(p => p.productId);
    const productDetailsMap = {};
    const productDetails = await Products.find({ _id: { $in: productIds }, franchiseId });
    productDetails.forEach(p => {
      productDetailsMap[p._id.toString()] = p;
    });

    // Verify all products exist
    for (const prod of products) {
      if (!productDetailsMap[prod.productId.toString()]) {
        return res.status(404).json({
          success: false,
          message: `Product with id ${prod.productId} not found`
        });
      }
    }

    // Update products in order
    for (const prod of products) {
      const productIndex = order.products.findIndex(
        p => p.productId && p.productId.toString() === prod.productId.toString()
      );

      if (productIndex !== -1) {
        order.products[productIndex].sendToPurchaseQty = prod.sendToPurchaseQty;
        if (prod.remarks !== undefined) {
          order.products[productIndex].remarks = prod.remarks;
        }
      }
    }

    // Calculate totalClosingAmount: sum of (sendToPurchaseQty * taxableValue) for all products in order
    const allProductIds = order.products.map(p => p.productId).filter(Boolean);
    const allProductDetails = await Products.find({ _id: { $in: allProductIds }, franchiseId });
    const allProductDetailsMap = {};
    allProductDetails.forEach(p => {
      allProductDetailsMap[p._id.toString()] = p;
    });

    let totalClosingAmount = 0;
    for (const prod of order.products) {
      const prodDetails = allProductDetailsMap[prod.productId?.toString()];
      if (prodDetails && prod.sendToPurchaseQty) {
        totalClosingAmount += (prod.sendToPurchaseQty * prodDetails.taxableValue);
      }
    }

    // Update order
    order.totalClosingAmount = totalClosingAmount;
    order.orderStatus = orderStatus;
    await order.save();

    // Create or update Purchase records for each product
    const purchaseUpdates = [];
    for (const prod of products) {
      const existingPurchase = await Purchase.findOne({
        franchiseId,
        productId: prod.productId
      });

      if (existingPurchase) {
        // Update existing purchase: set rcvdPurchaseQty and add to currentPurchaseQty
        existingPurchase.rcvdPurchaseQty = prod.sendToPurchaseQty;
        existingPurchase.currentPurchaseQty = (existingPurchase.currentPurchaseQty || 0) + prod.sendToPurchaseQty;
        existingPurchase.purchaseType = order.purchaseType || 'Order';
        existingPurchase.orderId = id;
        await existingPurchase.save();
        purchaseUpdates.push(existingPurchase);
      } else {
        // Create new purchase record
        const newPurchase = await Purchase.create({
          franchiseId,
          productId: prod.productId,
          rcvdPurchaseQty: prod.sendToPurchaseQty,
          sendToStoreQty: 0,
          currentPurchaseQty: prod.sendToPurchaseQty,
          purchaseType: order.purchaseType || 'Order',
          orderId: id
        });
        purchaseUpdates.push(newPurchase);
      }
    }

    // Fetch updated order with populated products
    const updatedOrder = await OrderRequired.findById(id)
      .populate({
        path: 'products.productId',
        model: 'Products',
        populate: [
          { path: 'categoryId', model: 'Categorys', select: 'categoryName' },
          { path: 'vendorsId', model: 'VendorsList', select: 'vendor_name' },
          { path: 'companyId', model: 'CompanyBrands', select: 'brandName' }
        ]
      });

    return res.status(200).json({
      success: true,
      message: 'Order products updated and purchase records created/updated',
      data: updatedOrder,
      purchaseUpdates: purchaseUpdates.length
    });
  } catch (err) {
    console.error('vendorUpdatesendToPurchaseQty error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};