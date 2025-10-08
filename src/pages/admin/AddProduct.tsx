import React, { useEffect, useState } from "react";
import { FiEdit, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";

// Import the initial data and the Product type
import { mockAllProducts as initialMockProducts, type Product } from "../../components/data";

export default function AddProductAdvanced() {
  const { categoryName, subCategoryName } = useParams<{ categoryName: string; subCategoryName: string }>();

  // --- STATE MANAGEMENT ---
  // Master list of all products, now managed by state
  const [allProducts, setAllProducts] = useState<Product[]>(initialMockProducts);
  // The list of products currently visible in the table
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // State for the "Add Item" modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemStock, setNewItemStock] = useState("");

  // State for the "Edit Item" modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);


  // --- DATA FILTERING ---
  // This effect runs when the page loads or the data/URL changes
  useEffect(() => {
    if (subCategoryName) {
      const filtered = allProducts.filter(
        (product) => product.subcategory.toLowerCase() === subCategoryName.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  }, [subCategoryName, allProducts]); // Re-filter whenever the master list changes


  // --- CRUD FUNCTIONS (Create, Read, Update, Delete) ---

  // CREATE: Handles new item submission
  const handleAddItemSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newItem: Product = {
      id: `item_${Date.now()}`, // Create a unique ID
      name: newItemName,
      price: Number(newItemPrice),
      stock: Number(newItemStock),
      category: (categoryName || "") as "setup" | "products",
      subcategory: subCategoryName!,
    };
    // Add the new item to the master list
    setAllProducts([newItem, ...allProducts]);
    alert(`New item "${newItemName}" added successfully!`);
    closeAndResetAddModal();
  };
  
  // UPDATE: Opens the edit modal and pre-fills data
  const handleEditClick = (product: Product) => {
    setEditingItem(product);
    setIsEditModalOpen(true);
  };
  
  // UPDATE: Handles edit form submission
  const handleUpdateItemSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem) return;

    // Find and update the item in the master list
    const updatedProducts = allProducts.map((p) =>
      p.id === editingItem.id ? editingItem : p
    );
    setAllProducts(updatedProducts);
    alert(`Item "${editingItem.name}" updated successfully!`);
    closeAndResetEditModal();
  };

  // DELETE: Deletes an item after confirmation
  const handleDelete = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      const newProductList = allProducts.filter((p) => p.id !== productId);
      setAllProducts(newProductList);
      alert(`Item "${productName}" has been deleted.`);
    }
  };

  
  // --- MODAL HELPER FUNCTIONS ---
  const closeAndResetAddModal = () => {
    setIsAddModalOpen(false);
    setNewItemName(""); setNewItemPrice(""); setNewItemStock("");
  };
  
  const closeAndResetEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const pageTitle = subCategoryName
    ? `Products in ${subCategoryName.charAt(0).toUpperCase() + subCategoryName.slice(1)}`
    : "Products";

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition w-full sm:w-auto"
          >
            <FiPlus /> Add New Item
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-200 text-slate-700">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4 hidden md:table-cell">Main Category</th>
                <th className="p-4 hidden lg:table-cell">Subcategory</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{product.name}</td>
                  <td className="p-4 text-slate-600 hidden md:table-cell">{product.category}</td>
                  <td className="p-4 text-slate-600 hidden lg:table-cell">{product.subcategory}</td>
                  <td className="p-4 text-slate-600">₹{product.price.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-slate-600">{product.stock}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-800">
                        <FiEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="text-red-600 hover:text-red-800">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closeAndResetAddModal}>
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-800">Add a New Item</h2><button onClick={closeAndResetAddModal}><FiX size={24}/></button></div>
            <form onSubmit={handleAddItemSubmit}>
              {/* Form content for adding is same as before */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-600 mb-1">Category</label><p className="w-full px-3 py-2 bg-slate-100 rounded-md">{categoryName}</p></div>
                  <div><label className="block text-sm font-medium text-slate-600 mb-1">Subcategory</label><p className="w-full px-3 py-2 bg-slate-100 rounded-md">{subCategoryName}</p></div>
                </div>
                <div><label htmlFor="itemName" className="block text-sm font-medium text-slate-600 mb-1">Item Name</label><input id="itemName" type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label htmlFor="itemPrice" className="block text-sm font-medium text-slate-600 mb-1">Price (₹)</label><input id="itemPrice" type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="w-full px-3 py-2 border rounded-md" required /></div>
                  <div><label htmlFor="itemStock" className="block text-sm font-medium text-slate-600 mb-1">Stock</label><input id="itemStock" type="number" value={newItemStock} onChange={(e) => setNewItemStock(e.target.value)} className="w-full px-3 py-2 border rounded-md" required /></div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4"><button type="button" onClick={closeAndResetAddModal} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-slate-700 text-white rounded-lg">Submit Item</button></div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ITEM MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={closeAndResetEditModal}>
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-800">Edit Item</h2><button onClick={closeAndResetEditModal}><FiX size={24}/></button></div>
            <form onSubmit={handleUpdateItemSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-600 mb-1">Category</label><p className="w-full px-3 py-2 bg-slate-100 rounded-md">{editingItem.category}</p></div>
                  <div><label className="block text-sm font-medium text-slate-600 mb-1">Subcategory</label><p className="w-full px-3 py-2 bg-slate-100 rounded-md">{editingItem.subcategory}</p></div>
                </div>
                <div><label htmlFor="editItemName" className="block text-sm font-medium text-slate-600 mb-1">Item Name</label><input id="editItemName" type="text" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" required /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label htmlFor="editItemPrice" className="block text-sm font-medium text-slate-600 mb-1">Price (₹)</label><input id="editItemPrice" type="number" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md" required /></div>
                  <div><label htmlFor="editItemStock" className="block text-sm font-medium text-slate-600 mb-1">Stock</label><input id="editItemStock" type="number" value={editingItem.stock} onChange={(e) => setEditingItem({...editingItem, stock: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-md" required /></div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4"><button type="button" onClick={closeAndResetEditModal} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}