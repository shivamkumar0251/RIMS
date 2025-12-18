# HopsNChops Backend API Documentation

## Base URL
```
Development: http://localhost:5000
Production: (To be configured)
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents
1. [Authentication & Users](#1-authentication--users)
2. [Admin](#2-admin)
3. [Franchise & Outlet](#3-franchise--outlet)
4. [Categories](#4-categories)
5. [Products](#5-products)
6. [Company](#6-company)
7. [Vendor List](#7-vendor-list)
8. [Vendor Orders](#8-vendor-orders)
9. [Orders](#9-orders)
10. [Purchase](#10-purchase)
11. [Store Stock](#11-store-stock)
12. [Kitchen Stock](#12-kitchen-stock)
13. [Consumable Stock](#13-consumable-stock)
14. [Product Requirements](#14-product-requirements)
15. [Franchise Inquiry](#15-franchise-inquiry)

---

## 1. Authentication & Users

### 1.1 User Login
**POST** `/v1/users/login`

**Authentication:** Not Required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one digit
- At least one special character

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "User Name",
    "role": "user"
  }
}
```

---

### 1.2 Check Token
**POST** `/v1/users/checkToken`

**Authentication:** Required (Bearer Token)

**Request Body:** None

**Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

---

### 1.3 User Logout
**POST** `/v1/users/logout`

**Authentication:** Required (Bearer Token)

**Request Body:** None

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 1.4 Forgot Password
**POST** `/v1/users/forgotPassword`

**Authentication:** Not Required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

---

### 1.5 Reset Password
**POST** `/v1/users/resetPassword`

**Authentication:** Not Required

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

---

### 1.6 Get User Profile
**GET** `/v1/users/profile`

**Authentication:** Required (Bearer Token)

**Request Body:** None

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "full_name": "User Name",
    "email": "user@example.com",
    "phone": "9876543210",
    "address": "User Address",
    "gst_no": "27ABCDE1234F1Z5",
    "role": "user",
    "franchiseId": "franchise_id"
  }
}
```

---

## 2. Admin

### 2.1 Register User (Admin Only)
**POST** `/v1/admin/usersRegistration`

**Authentication:** Required (Bearer Token) - Admin/Super Admin Only

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Password123!",
  "address": "123 Main Street",
  "gst_no": "27ABCDE1234F1Z5",
  "role": "user",
  "franchiseId": "franchise_id"
}
```

**Response:**
```json
{
  "message": "User Registered successfully",
  "user": { ... }
}
```

---

### 2.2 Get All Users by Franchise (Admin Only)
**GET** `/v1/admin/getusers`

**Authentication:** Required (Bearer Token) - Admin/Super Admin Only

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for filtering

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "full_name": "User Name",
      "email": "user@example.com",
      "role": "user",
      "franchiseId": "franchise_id"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

## 3. Franchise & Outlet

### 3.1 Get All Franchises
**GET** `/v1/franchise`

**Authentication:** Not Required

**Response:**
```json
{
  "franchises": [
    {
      "id": "franchise_id",
      "name": "Franchise Name",
      "location": "Location"
    }
  ]
}
```

---

### 3.2 Get All Outlets
**GET** `/v1/outlet`

**Authentication:** Not Required

**Response:**
```json
{
  "outlets": [
    {
      "id": "outlet_id",
      "name": "Outlet Name",
      "address": "Outlet Address"
    }
  ]
}
```

---

## 4. Categories

### 4.1 Get Categories by Franchise
**GET** `/v1/categories/getCategories`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

**Response:**
```json
{
  "categories": [
    {
      "id": "category_id",
      "name": "Category Name",
      "description": "Category Description",
      "subcategories": [...]
    }
  ]
}
```

---

### 4.2 Add Category (Admin Only)
**POST** `/v1/categories/addCategory`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category Description"
}
```

**Response:**
```json
{
  "message": "Category created successfully",
  "category": { ... }
}
```

---

### 4.3 Update Category (Admin Only)
**PUT** `/v1/categories/updateCategories/:categoryId`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `categoryId`: Category ID

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated Description"
}
```

**Response:**
```json
{
  "message": "Category updated successfully",
  "category": { ... }
}
```

---

### 4.4 Delete Category (Admin Only)
**DELETE** `/v1/categories/deleteCategories/:categoryId`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `categoryId`: Category ID

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

---

### 4.5 Bulk Create Categories from Excel (Admin Only)
**POST** `/v1/categories/bulk-excel`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:** Form Data
- `file`: Excel file (.xlsx, .xls)

**Response:**
```json
{
  "message": "Categories created successfully",
  "created": 10,
  "failed": 0
}
```

---

### 4.6 Add Sub-Category (Admin Only)
**POST** `/v1/categories/:categoryId/subcategories`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `categoryId`: Parent Category ID

**Request Body:**
```json
{
  "name": "Sub-Category Name"
}
```

**Response:**
```json
{
  "message": "Sub-category created successfully",
  "subcategory": { ... }
}
```

---

### 4.7 Update Sub-Category (Admin Only)
**PUT** `/v1/categories/:categoryId/subcategories/:subCategoryId`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `categoryId`: Parent Category ID
- `subCategoryId`: Sub-Category ID

**Request Body:**
```json
{
  "name": "Updated Sub-Category Name"
}
```

**Response:**
```json
{
  "message": "Sub-category updated successfully",
  "subcategory": { ... }
}
```

---

### 4.8 Delete Sub-Category (Admin Only)
**DELETE** `/v1/categories/:categoryId/subcategories/:subCategoryId`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `categoryId`: Parent Category ID
- `subCategoryId`: Sub-Category ID

**Response:**
```json
{
  "message": "Sub-category deleted successfully"
}
```

---

## 5. Products

### 5.1 Get Products
**GET** `/v1/products`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `category` (optional): Filter by category ID
- `sortBy` (optional): Sort field (name, price, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "category": "category_id",
      "image": "image_url",
      "stock": 100
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### 5.2 Create Single Product (Admin Only)
**POST** `/v1/products`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:** Form Data or JSON
- `name` (required): Product name
- `description` (optional): Product description
- `price` (optional): Product price
- `category` (optional): Category ID
- `image` (optional): Image file

**Response:**
```json
{
  "message": "Product created successfully",
  "product": { ... }
}
```

---

### 5.3 Bulk Create Products from Excel (Admin Only)
**POST** `/v1/products/bulk-excel`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:** Form Data
- `file`: Excel file (.xlsx, .xls)

**Response:**
```json
{
  "message": "Products created successfully",
  "created": 20,
  "failed": 0
}
```

---

### 5.4 Update Single Product (Admin Only)
**PUT** `/v1/products/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Product ID

**Request Body:** Form Data or JSON
- `name` (optional): Product name
- `description` (optional): Product description
- `price` (optional): Product price
- `category` (optional): Category ID
- `image` (optional): Image file

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

### 5.5 Bulk Update Products (Admin Only)
**PUT** `/v1/products`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:** Form Data
- `products`: Array of products to update

**Response:**
```json
{
  "message": "Products updated successfully",
  "updated": 5
}
```

---

### 5.6 Delete Single Product (Admin Only)
**DELETE** `/v1/products/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Product ID

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

### 5.7 Bulk Delete Products (Admin Only)
**DELETE** `/v1/products`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "ids": ["product_id_1", "product_id_2"]
}
```

**Response:**
```json
{
  "message": "Products deleted successfully",
  "deleted": 2
}
```

---

## 6. Company

### 6.1 Create Company (Admin Only)
**POST** `/v1/companys`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "name": "Company Name",
  "address": "Company Address",
  "phone": "9876543210",
  "email": "company@example.com",
  "gst_no": "27ABCDE1234F1Z5"
}
```

**Response:**
```json
{
  "message": "Company created successfully",
  "company": { ... }
}
```

---

### 6.2 Bulk Create Companies from Excel (Admin Only)
**POST** `/v1/companys/bulk-excel`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:** Form Data
- `file`: Excel file (.xlsx, .xls)

**Response:**
```json
{
  "message": "Companies created successfully",
  "created": 10
}
```

---

### 6.3 Get Companies
**GET** `/v1/companys`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**
```json
{
  "companies": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### 6.4 Update Company (Admin Only)
**PUT** `/v1/companys/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Company ID

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "address": "Updated Address"
}
```

**Response:**
```json
{
  "message": "Company updated successfully",
  "company": { ... }
}
```

---

### 6.5 Delete Company (Admin Only)
**DELETE** `/v1/companys/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Company ID

**Response:**
```json
{
  "message": "Company deleted successfully"
}
```

---

### 6.6 Bulk Delete Companies (Admin Only)
**POST** `/v1/companys/delete-bulk`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "ids": ["company_id_1", "company_id_2"]
}
```

**Response:**
```json
{
  "message": "Companies deleted successfully",
  "deleted": 2
}
```

---

## 7. Vendor List

### 7.1 Get Vendor Names List
**GET** `/v1/vendorList/list-names`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "vendors": [
    {
      "id": "vendor_id",
      "name": "Vendor Name"
    }
  ]
}
```

---

### 7.2 Get Vendors
**GET** `/v1/vendorList`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

**Response:**
```json
{
  "vendors": [
    {
      "id": "vendor_id",
      "name": "Vendor Name",
      "contact": "9876543210",
      "address": "Vendor Address"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

---

### 7.3 Create Vendor (Admin Only)
**POST** `/v1/vendorList`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "name": "Vendor Name",
  "contact": "9876543210",
  "email": "vendor@example.com",
  "address": "Vendor Address",
  "gst_no": "27ABCDE1234F1Z5"
}
```

**Response:**
```json
{
  "message": "Vendor created successfully",
  "vendor": { ... }
}
```

---

### 7.4 Bulk Create Vendors from Excel (Admin Only)
**POST** `/v1/vendorList/bulk-excel`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:** Form Data
- `file`: Excel file (.xlsx, .xls)

**Response:**
```json
{
  "message": "Vendors created successfully",
  "created": 15
}
```

---

### 7.5 Update Vendor (Admin Only)
**PUT** `/v1/vendorList/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Vendor ID

**Request Body:**
```json
{
  "name": "Updated Vendor Name",
  "contact": "9876543210"
}
```

**Response:**
```json
{
  "message": "Vendor updated successfully",
  "vendor": { ... }
}
```

---

### 7.6 Delete Vendor (Admin Only)
**DELETE** `/v1/vendorList/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Vendor ID

**Response:**
```json
{
  "message": "Vendor deleted successfully"
}
```

---

## 8. Vendor Orders

### 8.1 Create Vendor Order (Admin Only)
**POST** `/v1/vendor`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "vendorId": "vendor_id",
  "orderDate": "2024-01-15",
  "products": [
    {
      "productId": "product_id",
      "quantity": 10,
      "price": 99.99
    }
  ]
}
```

**Response:**
```json
{
  "message": "Vendor order created successfully",
  "order": { ... }
}
```

---

### 8.2 Get Vendor Orders
**GET** `/v1/vendor`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `vendorId` (optional): Filter by vendor ID

**Response:**
```json
{
  "orders": [...],
  "total": 30,
  "page": 1,
  "limit": 10
}
```

---

### 8.3 Update Order Product (Admin Only)
**PUT** `/v1/vendor/order-product`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "orderId": "order_id",
  "productId": "product_id",
  "quantity": 15,
  "price": 109.99
}
```

**Response:**
```json
{
  "message": "Order product updated successfully"
}
```

---

### 8.4 Update Vendor Order (Admin Only)
**PUT** `/v1/vendor/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Vendor Order ID

**Request Body:**
```json
{
  "orderDate": "2024-01-20",
  "status": "completed"
}
```

**Response:**
```json
{
  "message": "Vendor order updated successfully",
  "order": { ... }
}
```

---

### 8.5 Delete Vendor Order (Admin Only)
**DELETE** `/v1/vendor/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Vendor Order ID

**Response:**
```json
{
  "message": "Vendor order deleted successfully"
}
```

---

## 9. Orders

### 9.1 Get Products for Order
**GET** `/v1/order/products`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "currentPurchaseQty": 50,
      "price": 99.99
    }
  ]
}
```

---

### 9.2 Create Bulk Orders (Admin Only)
**POST** `/v1/order`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "orders": [
    {
      "productId": "product_id",
      "quantity": 10,
      "remarks": "Order remarks"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Orders created successfully",
  "orders": [...]
}
```

---

### 9.3 Get Orders
**GET** `/v1/order`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id",
      "products": [...],
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

### 9.4 Update Send to Purchase Quantity (Admin Only)
**PUT** `/v1/order/:id/send-to-purchase`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Order ID

**Request Body:**
```json
{
  "products": [
    {
      "productId": "product_id",
      "sendToPurchaseQty": 5,
      "remarks": "Purchase remarks"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Order updated successfully",
  "order": { ... }
}
```

---

### 9.5 Update Order Products (Admin Only)
**PUT** `/v1/order/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Order ID

**Request Body:**
```json
{
  "products": [
    {
      "productId": "product_id",
      "quantity": 15
    }
  ]
}
```

**Response:**
```json
{
  "message": "Order products updated successfully",
  "order": { ... }
}
```

---

### 9.6 Delete Order Items (Admin Only)
**DELETE** `/v1/order/:id/items`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Order ID

**Request Body:**
```json
{
  "productIds": ["product_id_1", "product_id_2"]
}
```

**Response:**
```json
{
  "message": "Order items deleted successfully"
}
```

---

### 9.7 Delete Order (Admin Only)
**DELETE** `/v1/order/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Order ID

**Response:**
```json
{
  "message": "Order deleted successfully"
}
```

---

## 10. Purchase

### 10.1 Create Purchase (Admin Only)
**POST** `/v1/purchase`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "vendorId": "vendor_id",
  "orderId": "order_id",
  "purchaseDate": "2024-01-15",
  "products": [
    {
      "productId": "product_id",
      "quantity": 10,
      "price": 99.99,
      "total": 999.90
    }
  ],
  "totalAmount": 999.90
}
```

**Response:**
```json
{
  "message": "Purchase created successfully",
  "purchase": { ... }
}
```

---

### 10.2 Get Purchases
**GET** `/v1/purchase`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `vendorId` (optional): Filter by vendor ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**
```json
{
  "purchases": [
    {
      "id": "purchase_id",
      "vendorId": "vendor_id",
      "purchaseDate": "2024-01-15",
      "totalAmount": 999.90,
      "products": [...]
    }
  ],
  "total": 40,
  "page": 1,
  "limit": 10
}
```

---

### 10.3 Update Purchase (Admin Only)
**PUT** `/v1/purchase/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Purchase ID

**Request Body:**
```json
{
  "purchaseDate": "2024-01-20",
  "totalAmount": 1099.90,
  "products": [...]
}
```

**Response:**
```json
{
  "message": "Purchase updated successfully",
  "purchase": { ... }
}
```

---

### 10.4 Delete Purchase (Admin Only)
**DELETE** `/v1/purchase/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Purchase ID

**Response:**
```json
{
  "message": "Purchase deleted successfully"
}
```

---

## 11. Store Stock

### 11.1 Add Store Stock (Admin Only)
**POST** `/v1/storeStoke`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 100,
  "location": "Warehouse A",
  "remarks": "Stock added"
}
```

**Response:**
```json
{
  "message": "Store stock added successfully",
  "stock": { ... }
}
```

---

### 11.2 Get Store Stock
**GET** `/v1/storeStoke`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `productId` (optional): Filter by product ID
- `location` (optional): Filter by location

**Response:**
```json
{
  "stocks": [
    {
      "id": "stock_id",
      "productId": "product_id",
      "productName": "Product Name",
      "quantity": 100,
      "location": "Warehouse A"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

---

### 11.3 Update Store Stock (Admin Only)
**PUT** `/v1/storeStoke/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Store Stock ID

**Request Body:**
```json
{
  "quantity": 150,
  "location": "Warehouse B",
  "remarks": "Stock updated"
}
```

**Response:**
```json
{
  "message": "Store stock updated successfully",
  "stock": { ... }
}
```

---

### 11.4 Delete Store Stock (Admin Only)
**DELETE** `/v1/storeStoke/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Store Stock ID

**Response:**
```json
{
  "message": "Store stock deleted successfully"
}
```

---

## 12. Kitchen Stock

### 12.1 Add Kitchen Stock (Admin Only)
**POST** `/v1/kitchenStock`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 50,
  "transferFrom": "store",
  "remarks": "Transferred from store"
}
```

**Response:**
```json
{
  "message": "Kitchen stock added successfully",
  "stock": { ... }
}
```

---

### 12.2 Get Kitchen Stocks
**GET** `/v1/kitchenStock`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `productId` (optional): Filter by product ID

**Response:**
```json
{
  "stocks": [
    {
      "id": "stock_id",
      "productId": "product_id",
      "productName": "Product Name",
      "quantity": 50
    }
  ],
  "total": 30,
  "page": 1,
  "limit": 10
}
```

---

### 12.3 Update Kitchen Stock (Admin Only)
**PUT** `/v1/kitchenStock/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Kitchen Stock ID

**Request Body:**
```json
{
  "quantity": 60,
  "remarks": "Stock updated"
}
```

**Response:**
```json
{
  "message": "Kitchen stock updated successfully",
  "stock": { ... }
}
```

---

### 12.4 Delete Kitchen Stock (Admin Only)
**DELETE** `/v1/kitchenStock/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Kitchen Stock ID

**Response:**
```json
{
  "message": "Kitchen stock deleted successfully"
}
```

---

## 13. Consumable Stock

### 13.1 Add Consumable Stock (Admin Only)
**POST** `/v1/consumableStock`

**Authentication:** Required (Bearer Token) - Admin Only

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 25,
  "transferFrom": "kitchen",
  "remarks": "Transferred from kitchen"
}
```

**Response:**
```json
{
  "message": "Consumable stock added successfully",
  "stock": { ... }
}
```

---

### 13.2 Get Consumable Stocks
**GET** `/v1/consumableStock`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "stocks": [
    {
      "id": "stock_id",
      "productId": "product_id",
      "productName": "Product Name",
      "quantity": 25
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10
}
```

---

### 13.3 Update Consumable Stock (Admin Only)
**PUT** `/v1/consumableStock/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Consumable Stock ID

**Request Body:**
```json
{
  "quantity": 30,
  "remarks": "Stock updated"
}
```

**Response:**
```json
{
  "message": "Consumable stock updated successfully",
  "stock": { ... }
}
```

---

### 13.4 Delete Consumable Stock (Admin Only)
**DELETE** `/v1/consumableStock/:id`

**Authentication:** Required (Bearer Token) - Admin Only

**URL Parameters:**
- `id`: Consumable Stock ID

**Response:**
```json
{
  "message": "Consumable stock deleted successfully"
}
```

---

## 14. Product Requirements

### 14.1 Add Product Requirement
**POST** `/v1/product-requirements`

**Authentication:** Not Required

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 50,
  "notes": "Urgent requirement"
}
```

**Response:**
```json
{
  "message": "Product requirement added successfully",
  "requirement": { ... }
}
```

---

### 14.2 Get Product Requirements
**GET** `/v1/product-requirements`

**Authentication:** Not Required

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "requirements": [
    {
      "id": "requirement_id",
      "productId": "product_id",
      "productName": "Product Name",
      "quantity": 50,
      "notes": "Urgent requirement"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

---

### 14.3 Update Product Requirement
**PUT** `/v1/product-requirements/:id`

**Authentication:** Not Required

**URL Parameters:**
- `id`: Requirement ID

**Request Body:**
```json
{
  "quantity": 75,
  "notes": "Updated requirement"
}
```

**Response:**
```json
{
  "message": "Product requirement updated successfully",
  "requirement": { ... }
}
```

---

### 14.4 Delete Product Requirement
**DELETE** `/v1/product-requirements/:id`

**Authentication:** Not Required

**URL Parameters:**
- `id`: Requirement ID

**Response:**
```json
{
  "message": "Product requirement deleted successfully"
}
```

---

## 15. Franchise Inquiry

### 15.1 Submit Franchise Inquiry
**POST** `/v1/franchiseInquiry`

**Authentication:** Not Required

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "address": "123 Main Street, City",
  "pincode": "123456"
}
```

**Validation Rules:**
- `fullName`: Minimum 2 characters
- `email`: Valid email format
- `phone`: Exactly 10 digits
- `address`: Required string
- `pincode`: Exactly 6 digits

**Response:**
```json
{
  "message": "Inquiry submitted successfully",
  "inquiry": {
    "id": "inquiry_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "errors": [
    {
      "field": "email",
      "message": "Email is not valid"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Notes

1. **Pagination**: Most GET endpoints support pagination with `page` and `limit` query parameters. Default values may vary.

2. **File Uploads**: For Excel bulk uploads, use `multipart/form-data` with the field name `file`.

3. **Image Uploads**: For product images, use `multipart/form-data` with the field name `image`.

4. **Date Formats**: Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ) for date fields.

5. **Authentication**: Store the JWT token received from login and include it in all authenticated requests.

6. **Roles**: 
   - `super_admin`: Full access
   - `admin`: Admin access (most endpoints)
   - `user`: Limited access

---

## Contact & Support

For API support, contact the development team.

**Last Updated:** January 2024

