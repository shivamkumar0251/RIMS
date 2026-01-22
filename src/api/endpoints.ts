// Production
// Development
export const API_BASE_PRODUCTION_URL = 'https://hopsnchops-backend.onrender.com/v1';
export const API_BASE_DEVELOPMENT_URL = 'http://localhost:5050/v1';
// export const API_BASE_URL = 'https://hopsnchops-backend.onrender.com/v1';
export const API_BASE_URL = 'http://localhost:5050/v1';

export const API_ENDPOINTS = {
  LOGIN_API: `${API_BASE_URL}/users/login`,
  GET_USER_BY_ID: `${API_BASE_URL}/users/login`,
  CHECK_TOKEN: `${API_BASE_URL}/users/checkToken`,
  logout: `${API_BASE_URL}/users/logout`,
  profile: `${API_BASE_URL}/users/profile`,
  forgotPassword: `${API_BASE_URL}/users/forgotPassword`,
  resetPassword: `${API_BASE_URL}/users/resetPassword`,
  franchiseInquiry: `${API_BASE_URL}/franchiseInquiry`,
  outlet: `${API_BASE_URL}/outlet`,
  franchise: `${API_BASE_URL}/franchise`,
  // ===== Admin =====
  ADD_USER_REGISTRATION: `${API_BASE_URL}/admin/usersRegistration`,
  adminProfile: `${API_BASE_URL}/admin/profile`,
  GET_USERS_LIST: `${API_BASE_URL}/admin/getusers`,
  // ===== Categories =====
  GET_CATEGORIES: `${API_BASE_URL}/categories/getCategories`, // with ?search=&page=&limit=&fromDate=&toDate=
  ADD_CATEGORY: `${API_BASE_URL}/categories/addCategory`,
  ADD_CATEGORY_BULK_EXCEL: `${API_BASE_URL}/categories/bulk-excel`,
  UPDATE_CATEGORY: (categoryId: string) => `${API_BASE_URL}/categories/updateCategories/${categoryId}`,
  DELETE_CATEGORY: (categoryId: string) => `${API_BASE_URL}/categories/deleteCategories/${categoryId}`,
  // ===== Sub-Categories =====
  ADD_SUBCATEGORY: (categoryId: string) => `${API_BASE_URL}/categories/${categoryId}/subcategories`,
  UPDATE_SUBCATEGORY: (categoryId: string, subCategoryId: string) => `${API_BASE_URL}/categories/${categoryId}/subcategories/${subCategoryId}`,
  DELETE_SUBCATEGORY: (categoryId: string, subCategoryId: string) => `${API_BASE_URL}/categories/${categoryId}/subcategories/${subCategoryId}`,
  // ===== Company/Brand =====
  ADD_COMPANY: `${API_BASE_URL}/companys`,
  GET_COMPANY: `${API_BASE_URL}/companys`,
  ADD_BULK_EXCEL_COMPANY: `${API_BASE_URL}/companys/bulk-excel`,
  UPDATE_COMPANY: (id: string) => `${API_BASE_URL}/companys/${id}`,
  DELETE_COMPANY: (id: string) => `${API_BASE_URL}/companys/${id}`,
  BULK_DELETE_COMPANY: `${API_BASE_URL}/companys/delete-bulk`, // post api
  // ===== vendorList =====
  GET_VENDOR_NAME_LIST: `${API_BASE_URL}/vendorList/list-names`,
  GET_VENDOR_DATA: `${API_BASE_URL}/vendorList`,
  ADD_VENDOR_DATA: `${API_BASE_URL}/vendorList`,
  ADD_BULK_EXCEL_VENDOR: `${API_BASE_URL}/vendorList/bulk-excel`,
  UPDATE_VENDOR: (id: string) => `${API_BASE_URL}/vendorList/${id}`,
  DELETE_VENDOR: (id: string) => `${API_BASE_URL}/vendorList/${id}`,
  // ===== Products =====
  GET_PRODUCTS: `${API_BASE_URL}/products`,
  ADD_PRODUCTS: `${API_BASE_URL}/products`,
  ADD_BULK_EXCEL_PRODUCTS: `${API_BASE_URL}/products/bulk-excel`,
  UPDATE_PRODUCTS: (id: string) => `${API_BASE_URL}/products/${id}`,
  DELETE_PRODUCTS: (id: string) => `${API_BASE_URL}/products/${id}`,
  // ===== Order (Section 9) =====
  GET_ORDERS: `${API_BASE_URL}/order/products`,
  ADD_ORDERS: `${API_BASE_URL}/order`,
  UPDATE_ORDERS: (id: string) => `${API_BASE_URL}/order/${id}`,
  DELETE_WHOLE_ORDERS: (id: string) => `${API_BASE_URL}/order/${id}`,
  DELETE_ORDERS_ITEMS: (id: string) => `${API_BASE_URL}/order/${id}/items`,
  // ===== Vendor Orders (Section 8) - Different from regular orders =====
  GET_VENDOR_ORDERS_LIST: `${API_BASE_URL}/order`,
  UPDATE_VENDOR_ORDER: (id: string) => `${API_BASE_URL}/order/${id}/send-to-purchase`,
  // ===== purchase =====
  GET_PURCHASE: `${API_BASE_URL}/purchase`,
  ADD_PURCHASE: `${API_BASE_URL}/purchase`,
  ADD_BULK_PURCHASE: `${API_BASE_URL}/purchase/bulk/create`,
  UPDATE_PURCHASE: (id: string) => `${API_BASE_URL}/purchase/${id}`,
  DELETE_PURCHASE: (id: string) => `${API_BASE_URL}/purchase/${id}`,
  // ===== storeStock =====
  GET_STORE_STOCK: `${API_BASE_URL}/storeStoke`,
  ADD_STORE_STOCK: `${API_BASE_URL}/storeStoke`,
  ADD_BULK_STORE_STOCK: `${API_BASE_URL}/storeStoke/bulk/create`,
  UPDATE_STORE_STOCK: (id: string) => `${API_BASE_URL}/storeStoke/${id}`,
  DELETE_STORE_STOCK: (id: string) => `${API_BASE_URL}/storeStoke/${id}`,
  // ===== kitchenStock =====
  GET_KITCHEN_STOCK: `${API_BASE_URL}/kitchenStock`,
  ADD_KITCHEN_STOCK: `${API_BASE_URL}/kitchenStock`,
  ADD_BULK_KITCHEN_STOCK: `${API_BASE_URL}/kitchenStock/bulk/create`,
  UPDATE_KITCHEN_STOCK: (id: string) => `${API_BASE_URL}/kitchenStock/${id}`,
  DELETE_KITCHEN_STOCK: (id: string) => `${API_BASE_URL}/kitchenStock/${id}`,
  // ===== consumableStock =====
  GET_CONSUMABLE: `${API_BASE_URL}/consumableStock`,
  ADD_CONSUMABLE: `${API_BASE_URL}/consumableStock`,
  ADD_BULK_CONSUMABLE: `${API_BASE_URL}/consumableStock/bulk/create`,
  UPDATE_CONSUMABLE: (id: string) => `${API_BASE_URL}/consumableStock/${id}`,
  DELETE_CONSUMABLE: (id: string) => `${API_BASE_URL}/consumableStock/${id}`,
  // ===== setupStore =====
  GET_SETUP_STOCK: `${API_BASE_URL}/setupStock`,
  ADD_SETUP_STOCK: `${API_BASE_URL}/setupStock`,
  ADD_BULK_SETUP_STOCK: `${API_BASE_URL}/setupStock/bulk/create`,
  UPDATE_SETUP_STOCK: (id: string) => `${API_BASE_URL}/setupStock/${id}`,
  DELETE_SETUP_STOCK: (id: string) => `${API_BASE_URL}/setupStock/${id}`,
  // ===== Product Requirements =====
  ADD_PRODUCT_REQUIREMENT: `${API_BASE_URL}/product-requirements`,
  GET_PRODUCT_REQUIREMENTS: `${API_BASE_URL}/product-requirements`,
  UPDATE_PRODUCT_REQUIREMENT: (id: string) => `${API_BASE_URL}/product-requirements/${id}`,
  DELETE_PRODUCT_REQUIREMENT: (id: string) => `${API_BASE_URL}/product-requirements/${id}`,
  // ===== Dashboard =====
  GET_DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
  // ===== Reports =====
  GET_PURCHASE_REPORT: `${API_BASE_URL}/reports/purchase`,
  GET_STOCK_REPORT: `${API_BASE_URL}/reports/stock`,
  GET_CONSUMPTION_REPORT: `${API_BASE_URL}/reports/consumption`,
  GET_SALES_REPORT: `${API_BASE_URL}/reports/sales`,
  GET_PURCHASE_ORIGIN_REPORT: `${API_BASE_URL}/reports/purchase-origin`,
};
