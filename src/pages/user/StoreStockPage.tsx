// src/pages/StoreStockPage.tsx

import React from 'react';
// ✨ FIX 1: Imports are now simpler because of the tsconfig.json change.
// import { stockProducts, type Product } from 'data/storeStockData'; 
import UserLayout from '../../layouts/UserLayout';
import { stockProducts, type Product } from '../../data/storeStockData';

const StoreStockPage: React.FC = () => {

  // ✨ FIX 2: Added the correct type for the 'acc' parameter.
  const groupedBySubCategory = stockProducts.reduce((acc: Record<string, Product[]>, product: Product) => {
    const { subCategory } = product;
    if (!acc[subCategory]) {
      acc[subCategory] = [];
    }
    acc[subCategory].push(product);
    return acc;
  }, {} as Record<string, Product[]>);


  return (
    <UserLayout>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Store Stock - Fixed Assets</h1>
        
        {Object.keys(groupedBySubCategory).length > 0 ? (
          Object.keys(groupedBySubCategory).map(subCategory => (
            <div key={subCategory} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3 capitalize">{subCategory}</h2>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product Name</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedBySubCategory[subCategory].map((product: Product) => (
                        <tr key={product.id} className="hover:bg-gray-50 border-b border-gray-200">
                          <td className="px-5 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{product.category}</td>
                          <td className="px-5 py-4 text-sm text-center text-gray-700">{product.quantity}</td>
                          <td className="px-5 py-4 text-sm text-right text-gray-700">₹{product.price.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No items currently in store stock.</p>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default StoreStockPage;