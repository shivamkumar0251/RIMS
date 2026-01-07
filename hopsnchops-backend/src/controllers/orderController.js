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

    if (productType) {
      query.productType = productType;
    }

    // Filter by brand
    if (brand) {
      if (isObjectId(brand)) {
        query.companyId = brand;
      } else {
        const comp = await CompanyBrands.findOne({ brandName: brand, franchiseId });
        if (comp) {
          query.companyId = comp._id;
        } else {
          return res.status(200).json({ success: true, data: [], total: 0, page: 1, limit: parseInt(limit) });
        }
      }
    }

    // Filter by category
    if (category) {
      if (isObjectId(category)) {
        query.categoryId = category;
      } else {
        const cat = await Categorys.findOne({ categoryName: category, franchiseId });
        if (cat) {
          query.categoryId = cat._id;
        } else {
          return res.status(200).json({ success: true, data: [], total: 0, page: 1, limit: parseInt(limit) });
        }
      }
    }

    // Filter by vendor
    if (vendor) {
      if (isObjectId(vendor)) {
        query.vendorsId = vendor;
      } else {
        const v = await Vendors.findOne({ vendor_name: vendor, franchiseId });
        if (v) {
          query.vendorsId = v._id;
        } else {
          return res.status(200).json({ success: true, data: [], total: 0, page: 1, limit: parseInt(limit) });
        }
      }
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
    const { search, brand, category, vendor, paymentStatus, fromDate, toDate, page = 1, limit = 50, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

    const query = { franchiseId };

    // Build product filter for brand/category/vendor
    let productFilter = { franchiseId };
    if (brand) {
      if (isObjectId(brand)) {
        productFilter.companyId = brand;
      } else {
        const comp = await CompanyBrands.findOne({ brandName: brand, franchiseId });
        if (comp) {
          productFilter.companyId = comp._id;
        } else {
          return res.status(200).json({ success: true, data: [], total: 0 });
        }
      }
    }
    if (category) {
      if (isObjectId(category)) {
        productFilter.categoryId = category;
      } else {
        const cat = await Categorys.findOne({ categoryName: category, franchiseId });
        if (cat) {
          productFilter.categoryId = cat._id;
        } else {
          return res.status(200).json({ success: true, data: [], total: 0 });
        }
      }
    }
    if (vendor) {
      if (isObjectId(vendor)) {
        productFilter.vendorsId = vendor;
      } else {
        const v = await Vendors.findOne({ vendor_name: vendor, franchiseId });
        if (v) {
          productFilter.vendorsId = v._id;
        } else {
          return res.status(200).json({ success: true, data: [], total: 0 });
        }
      }
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
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
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
    const { products, status } = req.body;

    // Validation
    if (!id) {
      return res.status(400).json({ success: false, message: 'id param required' });
    }

    // If neither products nor status is provided, it's a bad request
    if (!status && (!products || !Array.isArray(products) || products.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'products array or status is required'
      });
    }

    // Find the order
    const order = await OrderRequired.findOne({ _id: id, franchiseId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update status if provided
    if (status) {
      order.status = status;
    }

    // If no products to update, just save the status and return
    if (!products || !Array.isArray(products) || products.length === 0) {
      await order.save();
      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
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
        await existingPurchase.save();
        purchaseUpdates.push(existingPurchase);
      } else {
        // Create new purchase record
        const newPurchase = await Purchase.create({
          franchiseId,
          productId: prod.productId,
          rcvdPurchaseQty: prod.sendToPurchaseQty,
          sendToStoreQty: 0,
          currentPurchaseQty: prod.sendToPurchaseQty
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