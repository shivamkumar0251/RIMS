// Triggering restart for schema updates
const express = require("express");
const morgan = require("morgan");
const mongoose = require('mongoose');
const cors = require('cors');
const { PORT, MONGODB_URL, CLIENT_URL, Development_CLIENT_URL, Production_CLIENT_URL, Development_CLIENT_URL_TEST, SERVER_URL } = require("./src/config/env");
const userRoutes = require('./src/routes/userRoutes')
const franchiseInquiry = require('./src/routes/franchiseInquiryRoutes')
const outlet = require('./src/routes/outletRoutes')
const franchise = require('./src/routes/franchiseRoutes')
const adminRoutes = require('./src/routes/adminRoutes')
const companyRoutes = require('./src/routes/companyRoutes')
const productsRoutes = require('./src/routes/productsRoutes')
const purchaseRoutes = require('./src/routes/purchaseRoutes')
const categoriesRoutes = require('./src/routes/categoriesRoutes')
const vendorOrdersRoutes = require('./src/routes/vendorOrdersRoutes.js')
const vendorListRoutes = require('./src/routes/vendorListRoutes.js')
const storeStokeRoutes = require('./src/routes/storeStokeRoutes')
const kitchenStockRoutes = require('./src/routes/kitchenStockRoutes.js')
const consumableStockRoutes = require('./src/routes/consumableRoutes.js')
const orderRoutes = require('./src/routes/orderRoutes.js')
const dashboardRoutes = require('./src/routes/dashboardRoutes.js')
const reportRoutes = require('./src/routes/reportRoutes.js')
const setupStockRoutes = require('./src/routes/setupStockRoutes.js')
const { swaggerSpec, swaggerUi } = require("./src/swagger/swagger.js");

const app = express();
app.use(morgan("dev"));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    CLIENT_URL,
    Development_CLIENT_URL,
    Development_CLIENT_URL_TEST,
    Production_CLIENT_URL,
    'http://localhost:4200',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  methods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
  credentials: true,
}));

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mongoose.connect(MONGODB_URL, {
  //serverSelectionTimeoutMS: 5000,
}).then(() => console.log("MongoDb is connected"))
  .catch(err => console.log(err));

// Routes
app.get('/help', (_, res) => res.send("Hello from Node Express backend!"))

app.use('/v1/users', userRoutes)
app.use('/v1/admin', adminRoutes)
app.use('/v1/companys', companyRoutes)
app.use('/v1/categories', categoriesRoutes)
app.use('/v1/vendorList', vendorListRoutes)
app.use('/v1/products', productsRoutes)
app.use('/v1/order', orderRoutes)
app.use('/v1/vendor', vendorOrdersRoutes)
app.use('/v1/purchase', purchaseRoutes)
app.use('/v1/storeStoke', storeStokeRoutes)
app.use('/v1/kitchenStock', kitchenStockRoutes)
app.use('/v1/consumableStock', consumableStockRoutes)
app.use('/v1/franchiseInquiry', franchiseInquiry)
app.use('/v1/outlet', outlet)
app.use('/v1/franchise', franchise)
app.use('/v1/dashboard', dashboardRoutes)
app.use('/v1/reports', reportRoutes)
app.use('/v1/setupStock', setupStockRoutes)

// app.use('/v1/vendors', storeStokeRoutes)
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
