import React, { useState } from 'react';
import { FiChevronDown, FiPlus, FiUpload, FiX } from 'react-icons/fi';

// --- DATA STRUCTURES (Aap isse apne database ke structure se match kar sakte hain) ---

// 1. Har custom form field ka structure
interface FormField {
  id: string;
  key: string; // Backend me data save karne ke liye key (e.g., 'screen_size')
  type: 'text' | 'number' | 'textarea';
  label: string; // UI me dikhane ke liye label (e.g., 'Screen Size')
  placeholder?: string;
  required: boolean;
}

// 2. Har Subcategory ka structure
interface SubCategory {
  id: number;
  name: string;
  // Har subcategory ke apne custom fields ho sakte hain
  formFields: FormField[];
}

// 3. Har Category ka structure
interface Category {
  id: number;
  name: string;
  subcategories: SubCategory[];
}


// --- MOCK DATA (Isko aap API se fetch karenge) ---
// Yahan hum alag-alag subcategories ke liye alag-alag dynamic forms define kar rahe hain
const CATEGORIES_DATA: Category[] = [
  {
    id: 1,
    name: 'Electronics',
    subcategories: [
      {
        id: 101,
        name: 'Mobiles',
        formFields: [
          { id: 'f1', key: 'screen_size', type: 'text', label: 'Screen Size (Inches)', placeholder: 'e.g., 6.7', required: true },
          { id: 'f2', key: 'ram', type: 'number', label: 'RAM (GB)', placeholder: 'e.g., 8', required: true },
          { id: 'f3', key: 'storage', type: 'number', label: 'Storage (GB)', placeholder: 'e.g., 128', required: true },
        ],
      },
      {
        id: 102,
        name: 'Laptops',
        formFields: [
          { id: 'f4', key: 'processor', type: 'text', label: 'Processor', placeholder: 'e.g., Apple M3 Pro', required: true },
          { id: 'f5', key: 'ram', type: 'number', label: 'RAM (GB)', placeholder: 'e.g., 16', required: true },
          { id: 'f6', key: 'warranty', type: 'text', label: 'Warranty', placeholder: 'e.g., 1 Year International', required: false },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Clothing',
    subcategories: [
      {
        id: 201,
        name: 'Shirts',
        formFields: [
          { id: 'f7', key: 'material', type: 'text', label: 'Fabric Material', placeholder: 'e.g., 100% Cotton', required: true },
          { id: 'f8', key: 'fit_type', type: 'text', label: 'Fit Type', placeholder: 'e.g., Slim Fit', required: true },
        ],
      },
    ],
  },
];


// ######################################################################
// ###                  SUB-COMPONENTS                                ###
// ######################################################################

/**
 * Renders the correct input field based on the field type
 */
const DynamicFormField: React.FC<{ field: FormField; value: any; onChange: (key: string, value: any) => void; }> = ({ field, value, onChange }) => {
    const commonClasses = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
    
    return (
        <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
                <textarea
                    id={field.id}
                    value={value}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    rows={3}
                    className={commonClasses}
                    placeholder={field.placeholder}
                    required={field.required}
                />
            ) : (
                <input
                    id={field.id}
                    type={field.type}
                    value={value}
                    onChange={(e) => onChange(field.key, field.type === 'number' ? e.target.valueAsNumber : e.target.value)}
                    className={commonClasses}
                    placeholder={field.placeholder}
                    required={field.required}
                    step={field.type === 'number' ? 'any' : undefined}
                />
            )}
        </div>
    );
};


/**
 * The Modal (popup) for adding a product
 */
const AddProductModal: React.FC<{ isOpen: boolean; onClose: () => void; subCategory: SubCategory | null; onSubmit: (data: any) => void; }> = ({ isOpen, onClose, subCategory, onSubmit }) => {
    const [formData, setFormData] = useState<{ [key: string]: any }>({});

    // Reset form when subCategory changes
    React.useEffect(() => {
        if (subCategory) {
            const initialData: { [key: string]: any } = {
                productName: '',
                quantity: 0,
                gst: 0,
                price: 0,
            };
            subCategory.formFields.forEach(field => {
                initialData[field.key] = '';
            });
            setFormData(initialData);
        }
    }, [subCategory]);

    if (!isOpen || !subCategory) return null;

    const handleFormChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            subCategoryId: subCategory.id,
        };
        onSubmit(submissionData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-modal-pop flex flex-col max-h-[90vh]">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Add New Product</h3>
                        <p className="text-sm text-gray-500">
                            Category: <span className="font-semibold text-indigo-600">{subCategory.name}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto space-y-6">
                    {/* --- Static Fields --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
                            <input type="text" id="productName" value={formData.productName || ''} onChange={(e) => handleFormChange('productName', e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity <span className="text-red-500">*</span></label>
                            <input type="number" id="quantity" value={formData.quantity || ''} onChange={(e) => handleFormChange('quantity', e.target.valueAsNumber)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹) <span className="text-red-500">*</span></label>
                            <input type="number" id="price" step="0.01" value={formData.price || ''} onChange={(e) => handleFormChange('price', e.target.valueAsNumber)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="gst" className="block text-sm font-medium text-gray-700">GST (%) <span className="text-red-500">*</span></label>
                            <input type="number" id="gst" step="0.1" value={formData.gst || ''} onChange={(e) => handleFormChange('gst', e.target.valueAsNumber)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>

                    {/* --- Dynamic Fields --- */}
                    {subCategory.formFields.length > 0 && (
                        <div>
                            <hr className="my-6" />
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h4>
                            <div className="space-y-4">
                               {subCategory.formFields.map(field => (
                                    <DynamicFormField
                                        key={field.id}
                                        field={field}
                                        value={formData[field.key] || ''}
                                        onChange={handleFormChange}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </form>

                 <div className="p-5 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">
                        Cancel
                    </button>
                    <button type="submit" onClick={handleSubmit} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700">
                        Save Product
                    </button>
                </div>
            </div>
        </div>
    );
};


// ######################################################################
// ###                  MAIN PAGE COMPONENT                           ###
// ######################################################################

const AddProductAdvanced: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  // Category list ko expand/collapse karne ke liye function
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // "Add Product" button click hone par modal open karne ka function
  const handleOpenAddProductForm = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setIsModalOpen(true);
  };

  // Modal close karne ka function
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubCategory(null);
  };

  // Form submit hone par data handle karne ka function
  const handleFormSubmit = (data: any) => {
    console.log('Final Product Data to be sent to API:', data);
    alert(`Product "${data.productName}" added successfully! Check console for data.`);
    handleCloseModal();
  };

  // "Upload Excel" button ke liye placeholder function
  const handleExcelUpload = (subCategory: SubCategory) => {
    alert(`Excel upload functionality for "${subCategory.name}" would be implemented here.`);
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Product</h1>
        <p className="text-gray-600 mb-8">
            Select a category and subcategory below to begin adding a new product.
        </p>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="space-y-2 p-4">
            {CATEGORIES_DATA.map(category => (
              <div key={category.id} className="border-b last:border-b-0">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg text-gray-800 hover:bg-gray-50"
                >
                  <span>{category.name}</span>
                  <FiChevronDown className={`transform transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`} />
                </button>

                {/* Subcategories List (Collapsible) */}
                {expandedCategories.includes(category.id) && (
                  <div className="pl-6 pr-4 pb-4 animate-fade-in-down">
                    {category.subcategories.map(sub => (
                      <div key={sub.id} className="flex justify-between items-center p-3 my-1 rounded-lg hover:bg-gray-100">
                        <span className="text-gray-700">{sub.name}</span>
                        <div className="flex items-center gap-3">
                           <button onClick={() => handleExcelUpload(sub)} className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-800" title="Upload using Excel">
                                <FiUpload /> <span>Upload Excel</span>
                            </button>
                          <button onClick={() => handleOpenAddProductForm(sub)} className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 font-semibold py-2 px-3 rounded-lg hover:bg-indigo-200">
                            <FiPlus /> <span>Add Product</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        subCategory={selectedSubCategory}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default AddProductAdvanced;