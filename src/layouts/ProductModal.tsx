import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiPlus } from "react-icons/fi";
import { brands, categories, productData } from "../data/ProductDummyData";
import VendorModal, { type VendorFormData } from "./VendorModal";

interface ProductOption {
  product_name: string;
  category: string;
  brand: string;
  packSize: string;
  unit: string;
  shape: string;
  colour: string;
  printStatus: string;
  openingStock: number;
  quantity: number;
  perUnitRate: number;
  gst: number;
}

interface FormData {
  vendor?: string;
  product_name: string;
  category: string;
  brand: string;
  packSize: string;
  unit: string;
  shape: string;
  colour: string;
  printStatus: string;
  openingStock: number | "";
  quantity: number | "";
  createdAt: string;
  price: number | "";
  taxableValue: number | "";
  gst: number | "";
  total: number | "";
  stockAlert: number | "";
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    vendor: "",
    product_name: "",
    category: "",
    brand: "",
    packSize: "",
    unit: "",
    shape: "",
    colour: "",
    printStatus: "N.A",
    openingStock: "",
    quantity: "",
    createdAt: new Date().toISOString().split("T")[0],
    price: "",
    taxableValue: "",
    gst: "",
    total: "",
    stockAlert: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // 🔹 Vendor modal & list
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [vendors, setVendors] = useState<string[]>(["FreshFoods Supplier", "Dairy Delight", "GreenLeaf Farms"]);

  const handleAddVendor = (vendor: VendorFormData) => {
    setVendors((prev) => [...prev, vendor.name]);
    setFormData((prev) => ({ ...prev, vendor: vendor.name }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["openingStock", "quantity", "gst", "price", "stockAlert"].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  useEffect(() => {
    const quantity = Number(formData.quantity || 0);
    const price = Number(formData.price || 0);
    const gst = Number(formData.gst || 0);
    const taxableValue = quantity * price;
    const total = taxableValue + (taxableValue * gst) / 100;

    setFormData((prev) => ({
      ...prev,
      taxableValue: quantity && price ? taxableValue : "",
      total: quantity && price && gst ? total : "",
    }));
  }, [formData.quantity, formData.price, formData.gst]);

  const handleSelectProduct = (product: ProductOption) => {
    setFormData({
      vendor: formData.vendor,
      product_name: product.product_name,
      category: product.category,
      brand: product.brand,
      packSize: product.packSize,
      unit: product.unit,
      shape: product.shape,
      colour: product.colour,
      printStatus: product.printStatus,
      openingStock: product.openingStock,
      quantity: product.quantity,
      createdAt: new Date().toISOString().split("T")[0],
      price: product.perUnitRate,
      taxableValue: product.quantity * product.perUnitRate,
      gst: product.gst,
      total: product.quantity * product.perUnitRate + (product.quantity * product.perUnitRate * product.gst) / 100, stockAlert: 5,
    });
    setSearchTerm(product.product_name);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Product Added Successfully!");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/5 backdrop-blur-[0.5px] z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-6xl h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Add New Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <FiX size={22} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Row: Search + Date */}
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
            {/* Product Search */}
            <div className="relative flex-1">
              <label className="block text-sm font-medium mb-1">Search Product</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="Type to search..."
                className="border rounded-md w-full p-2 focus:ring-2 focus:ring-blue-400"
              />
              {showDropdown && (
                <ul className="absolute z-10 bg-white border mt-1 w-full max-h-40 overflow-y-auto rounded-md shadow-lg">
                  {productData
                    .filter((p) =>
                      p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((p, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectProduct(p)}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {p.product_name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Date Picker */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="createdAt"
                  value={formData.createdAt}
                  onChange={handleChange}
                  className="border rounded-md w-full p-2 pl-9 focus:ring-2 focus:ring-blue-400"
                />
                <FiCalendar
                  size={18}
                  className="absolute left-2 top-3 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* 🔹 Vendor Selection */}
          <div className="relative flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="border rounded-md w-full p-2"
              >
                <option value="">Select Vendor</option>
                {vendors.map((v, i) => (
                  <option key={i} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setVendorModalOpen(true)}
              className="mb-1 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              title="Add New Vendor"
            >
              <FiPlus size={20} />
            </button>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              className="border rounded-md w-full p-2"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded-md w-full p-2"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="border rounded-md w-full p-2"
            >
              <option value="">Select Brand</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Pack Size */}
          <div>
            <label className="block text-sm font-medium mb-1">Pack Size</label>
            <input
              name="packSize"
              value={formData.packSize}
              onChange={handleChange}
              placeholder="Pack Size"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <input
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Unit"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Shape */}
          <div>
            <label className="block text-sm font-medium mb-1">Shape</label>
            <input
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              placeholder="Shape"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Colour */}
          <div>
            <label className="block text-sm font-medium mb-1">Colour</label>
            <input
              name="colour"
              value={formData.colour}
              onChange={handleChange}
              placeholder="Colour"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Print Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Print Status</label>
            <select
              name="printStatus"
              value={formData.printStatus}
              onChange={handleChange}
              className="border rounded-md w-full p-2"
            >
              <option value="N.A">N.A</option>
              <option value="Printed">Printed</option>
              <option value="Not Printed">Not Printed</option>
            </select>
          </div>

          {/* Opening Stock */}
          <div>
            <label className="block text-sm font-medium mb-1">Opening Stock</label>
            <input
              name="openingStock"
              type="number"
              value={formData.openingStock}
              onChange={handleChange}
              placeholder="Opening Stock"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Per Unit Rate</label>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Per Unit Rate"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Taxable Value */}
          <div>
            <label className="block text-sm font-medium mb-1">Taxable Value</label>
            <input
              readOnly
              name="taxableValue"
              value={formData.taxableValue}
              placeholder="Taxable Value"
              className="border rounded-md w-full p-2 bg-gray-100"
            />
          </div>

          {/* GST */}
          <div>
            <label className="block text-sm font-medium mb-1">GST (%)</label>
            <input
              name="gst"
              type="number"
              value={formData.gst}
              onChange={handleChange}
              placeholder="GST (%)"
              className="border rounded-md w-full p-2"
            />
          </div>

          {/* Total */}
          <div>
            <label className="block text-sm font-medium mb-1">Total</label>
            <input
              readOnly
              name="total"
              value={formData.total}
              placeholder="Total"
              className="border rounded-md w-full p-2 bg-gray-100"
            />
          </div>

          {/* Stock Alert */}
          <div>
            <label className="block text-sm font-medium mb-1">Stock Alert</label>
            <input
              name="stockAlert"
              type="number"
              value={formData.stockAlert}
              onChange={handleChange}
              placeholder="Stock Alert"
              className="border rounded-md w-full p-2"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Vendor Modal */}
      <VendorModal
        open={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
        onAddVendor={handleAddVendor}
      />
    </div>
  );
};

export default ProductModal;


// add 
