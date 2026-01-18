# RIMS - Restaurant Inventory Management System

RIMS is a robust and modern **Restaurant Inventory Management System** designed to streamline tracking, ordering, and management of restaurant supplies. From daily consumables to high-value equipment, RIMS provides a centralized dashboard for franchise owners and admins to maintain optimal stock levels and automate order processing.

---

## 🚀 Key Features

### 📦 Product Management
- **Categorized Inventory**: Separate management for Daily Products (Inventory & Packaging) and Restaurant Setup (Equipment, Crockery, Furniture).
- **Bulk Operations**: High-speed bulk import and export of products using Excel templates.
- **Rich Media**: Integrated Cloudinary support for product images.
- **Advanced Filtering**: Filter by Category, Vendor, Brand, or Date to find items instantly.

### 🧾 Order Management
- **Smart Order Creation**: Create orders based on Vendor, Category, or Brand.
- **Single Vendor Enforcement**: Built-in validation to ensure distinct purchase orders are generated per vendor.
- **Multi-Format Export**: Export orders as **PDF**, **Excel**, **CSV**, or share directly via **WhatsApp**.
- **Order History**: Track order statuses from 'Draft' to 'Delivered' with detailed itemized views.

### 🏢 Vendor & Franchise Management
- **Vendor Profiles**: Complete vendor tracking including bank details, contact persons, and GST information.
- **Franchise Support**: Multi-franchise architecture with secure data isolation.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit (with Persistence)
- **UI Components**: Material UI (MUI)
- **Styling**: Tailwind CSS 4.0
- **Form Handling**: React Hook Form & Yup
- **Data Visualization**: Recharts
- **Icons**: React Icons (Fi, Md)

### Backend
- **Runtime**: Node.js
- **Framework**: Express (v5)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with BcryptJS
- **Storage**: Cloudinary (Image Hosting)
- **Exports**: ExcelJS, jsPDF, XLSX

---

## 📁 Project Structure

```bash
RIMS/
├── hopsnchops-backend/    # Express Server & MongoDB Models
│   ├── src/
│   │   ├── controllers/   # Business Logic
│   │   ├── models/        # Mongoose Schema Definitions
│   │   ├── routes/        # API Endpoints
│   │   └── utils/         # Cloudinary & Helper functions
│   └── index.js           # Entry Point
├── src/                   # React Frontend
│   ├── components/        # Reusable UI Components
│   ├── layouts/           # Page Wrappers (Admin Sidebar, Modals)
│   ├── pages/             # Main Application Screens
│   ├── redux/             # Slices, Thunks, and Store
│   └── api/               # Axios Client & Endpoints
├── public/                # Static Assets
└── README.md
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd hopsnchops-backend
npm install
```
Create a `.env` file based on the following template:
```env
PORT=5050
MONGODB_URL=your_mongodb_connection_string
JWT_TOKEN_SECRET=your_secret_key
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
Navigate to the root directory and install dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
*Note: Use `npm run dev:all` to start both frontend and backend concurrently.*

---

## 📜 Development Notes
- **Pagination**: Standardized at 25 items per page with sticky headers for large datasets.
- **Icons**: Uses `Fi` (Feather Icons) for a clean, professional aesthetic.
- **Modals**: Custom-built responsive drawers and dialogs for form-intensive tasks.

---
Created by [GladHand Technologies](https://github.com/codegladhand).
