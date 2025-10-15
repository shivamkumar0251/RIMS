import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { brands, categories, productData } from "../data/ProductDummyData";

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
    createdAt: new Date().toLocaleDateString(),
    price: "",
    taxableValue: "",
    gst: "",
    total: "",
    stockAlert: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  // Calculate total + GST automatically
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
      createdAt: new Date().toLocaleDateString(),
      price: product.perUnitRate,
      taxableValue: product.quantity * product.perUnitRate,
      gst: product.gst,
      total:
        product.quantity * product.perUnitRate +
        (product.quantity * product.perUnitRate * product.gst) / 100,
      stockAlert: 5,
    });
    setSearchTerm(product.product_name);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", formData);
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
          {/* Autocomplete Product Search */}
          <div className="relative">
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

          {/* PackSize, Unit, Shape, Colour */}
          <input
            name="packSize"
            value={formData.packSize}
            onChange={handleChange}
            placeholder="Pack Size"
            className="border rounded-md w-full p-2"
          />
          <input
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            placeholder="Unit"
            className="border rounded-md w-full p-2"
          />
          <input
            name="shape"
            value={formData.shape}
            onChange={handleChange}
            placeholder="Shape"
            className="border rounded-md w-full p-2"
          />
          <input
            name="colour"
            value={formData.colour}
            onChange={handleChange}
            placeholder="Colour"
            className="border rounded-md w-full p-2"
          />

          {/* Print Status, Opening Stock */}
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
          <input
            name="openingStock"
            type="number"
            value={formData.openingStock}
            onChange={handleChange}
            placeholder="Opening Stock"
            className="border rounded-md w-full p-2"
          />

          {/* Quantity, Price */}
          <input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            className="border rounded-md w-full p-2"
          />
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="Per Unit Rate"
            className="border rounded-md w-full p-2"
          />

          {/* Taxable, GST, Total */}
          <input
            readOnly
            name="taxableValue"
            value={formData.taxableValue}
            placeholder="Taxable Value"
            className="border rounded-md w-full p-2 bg-gray-100"
          />
          <input
            name="gst"
            type="number"
            value={formData.gst}
            onChange={handleChange}
            placeholder="GST (%)"
            className="border rounded-md w-full p-2"
          />
          <input
            readOnly
            name="total"
            value={formData.total}
            placeholder="Total"
            className="border rounded-md w-full p-2 bg-gray-100"
          />

          {/* Stock Alert */}
          <input
            name="stockAlert"
            type="number"
            value={formData.stockAlert}
            onChange={handleChange}
            placeholder="Stock Alert"
            className="border rounded-md w-full p-2"
          />
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
    </div>
  );
};

export default ProductModal;
