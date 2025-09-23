export const API_BASE_URL = 'https://hopsnchops-backend.onrender.com/v1';
// export const API_BASE_URL = 'http://localhost:5000/v1';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login`,
  GET_USER_BY_ID: `${API_BASE_URL}/users/login`,
  logout: `${API_BASE_URL}/users/logout`,
  profile: `${API_BASE_URL}/users/profile`,
  forgotPassword: `${API_BASE_URL}/users/forgotPassword`,
  resetPassword: `${API_BASE_URL}/users/resetPassword`,
  usersRegistration: `${API_BASE_URL}/admin/usersRegistration`,
  adminProfile: `${API_BASE_URL}/admin/profile`,
  franchiseInquiry: `${API_BASE_URL}/franchiseInquiry`,
  outlet: `${API_BASE_URL}/outlet`,
  franchise: `${API_BASE_URL}/franchise`,
  materialsAddtype: `${API_BASE_URL}/materials/addtype`,
  materialsGettype: `${API_BASE_URL}/materials/gettype`,
  materialsUpdatetype: (materialId: string) => `${API_BASE_URL}/materials/updatetype/${materialId}`,
  materialsDeletetype: (materialId: string) => `${API_BASE_URL}/materials/deletetype/${materialId}`,
  addProducts: `${API_BASE_URL}/products/addProducts`,
  getProducts: `${API_BASE_URL}/products/getProducts`,
  updateProducts: (productId: string) => `${API_BASE_URL}/products/updateProducts/${productId}`,
  deleteProducts: (productId: string) => `${API_BASE_URL}/products/deleteProducts/${productId}`,
  productRequirements: (id?: string) => id ? `${API_BASE_URL}/product-requirements/${id}` : `${API_BASE_URL}/product-requirements/`,

};
