import React, { useEffect, useState } from 'react';
// Added FiHash for the new 'number' field type
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiAlertCircle, FiCheckSquare, FiChevronsDown, FiEdit, FiEye, FiFilePlus, FiHash, FiList, FiPlus, FiTrash2, FiType, FiX } from 'react-icons/fi';
import { AdminLayout } from '../../layouts/AdminLayout';

// --- DATA STRUCTURES (UPDATED) ---
export interface FormField {
  id: string;
  key: string;
  // Added 'number' to the available types
  type: 'text' | 'textarea' | 'checkbox' | 'select' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface SubCategory {
  id: number;
  name: string;
  formFields?: FormField[];
}

export interface Category {
  id: number;
  name: string;
  subcategories: SubCategory[];
  formFields?: FormField[];
}

// --- CATEGORY MODAL COMPONENT (No changes) ---
const CategoryModal = ({ isOpen, onClose, onSubmit, mode, currentCategory }: { isOpen: boolean, onClose: () => void, onSubmit: (name: string, id?: number) => void, mode: 'add' | 'edit', currentCategory: Category | null }) => {
  const [name, setName] = useState('');
  useEffect(() => { setName(isOpen && mode === 'edit' && currentCategory ? currentCategory.name : '') }, [isOpen, mode, currentCategory]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) { onSubmit(name, currentCategory?.id); onClose(); } };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-modal-pop"><div className="p-5 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-gray-800">{mode === 'add' ? 'Add New Category' : 'Edit Category'}</h3><button onClick={onClose}><FiX size={24}/></button></div><form onSubmit={handleSubmit} className="p-6 space-y-4"><div><label htmlFor="categoryName" className="block text-sm font-medium text-gray-600 mb-1">Category Name</label><input type="text" id="categoryName" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" autoFocus required/></div><div className="pt-4 flex justify-end gap-3"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button><button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save</button></div></form></div>
    </div>
  );
};

// --- SUBCATEGORY MODAL COMPONENT (No changes) ---
const SubCategoryModal = ({ isOpen, onClose, onSubmit, mode, parentCategory, currentSubCategory }: { isOpen: boolean, onClose: () => void, onSubmit: (name: string, parentId: number, subId?: number) => void, mode: 'add' | 'edit', parentCategory: Category | null, currentSubCategory: SubCategory | null }) => {
  const [name, setName] = useState('');
  useEffect(() => { setName(isOpen && mode === 'edit' && currentSubCategory ? currentSubCategory.name : '') }, [isOpen, mode, currentSubCategory]);
  if (!isOpen || !parentCategory) return null;
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) { onSubmit(name, parentCategory.id, currentSubCategory?.id); onClose(); }};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-modal-pop"><div className="p-5 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-gray-800">{mode === 'add' ? 'Add Subcategory' : 'Edit Subcategory'}</h3><button onClick={onClose}><FiX size={24}/></button></div><form onSubmit={handleSubmit} className="p-6 space-y-4"><div><label className="block text-sm font-medium">Parent Category</label><div className="w-full p-2 bg-gray-100 border rounded mt-1 font-semibold">{parentCategory?.name}</div></div><div><label htmlFor="subCategoryName" className="block text-sm font-medium mb-1">Subcategory Name</label><input type="text" id="subCategoryName" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" autoFocus required/></div><div className="pt-4 flex justify-end gap-3"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button><button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save</button></div></form></div>
    </div>
  );
};


// --- SORTABLE FIELD COMPONENT (UPDATED) ---
const SortableField = ({ field, onUpdate, onDelete }: { field: FormField, onUpdate: (id: string, newFieldData: Partial<FormField>) => void, onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // Added icon for 'number' type
  const getIcon = () => {
    switch (field.type) {
      case 'text': return <FiType className="text-blue-500"/>;
      case 'number': return <FiHash className="text-teal-500"/>;
      case 'textarea': return <FiList className="text-purple-500"/>;
      case 'checkbox': return <FiCheckSquare className="text-green-500"/>;
      case 'select': return <FiChevronsDown className="text-orange-500"/>;
      default: return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-50 border rounded-lg mb-3 touch-none">
      {/* Draggable Header */}
      <div {...attributes} {...listeners} className="flex items-center gap-3 p-3 border-b bg-white rounded-t-lg">
        <span className="cursor-grab text-gray-400 hover:text-gray-600">{getIcon()}</span>
        <span className="font-semibold text-gray-700">{field.label || 'New Field'}</span>
        <div className="flex-grow"></div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor={`required-${field.id}`} className="text-gray-600">Required</label>
          <input type="checkbox" id={`required-${field.id}`} checked={field.required} onChange={e => onUpdate(field.id, { required: e.target.checked })} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
        </div>
        <button onClick={() => onDelete(field.id)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
      </div>

      {/* Configuration Body */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`label-${field.id}`} className="block text-sm font-medium text-gray-600 mb-1">Label</label>
          <input type="text" id={`label-${field.id}`} value={field.label} onChange={e => onUpdate(field.id, { label: e.target.value })} className="w-full p-2 text-sm border rounded-md" placeholder="e.g., Full Name" />
        </div>
        <div>
          <label htmlFor={`key-${field.id}`} className="block text-sm font-medium text-gray-600 mb-1">Key / Name</label>
          <input type="text" id={`key-${field.id}`} value={field.key} onChange={e => onUpdate(field.id, { key: e.target.value.replace(/\s+/g, '_') })} className="w-full p-2 text-sm border rounded-md" placeholder="e.g., full_name (no spaces)" />
        </div>
        { (field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
          <div className="md:col-span-2">
            <label htmlFor={`placeholder-${field.id}`} className="block text-sm font-medium text-gray-600 mb-1">Placeholder</label>
            <input type="text" id={`placeholder-${field.id}`} value={field.placeholder} onChange={e => onUpdate(field.id, { placeholder: e.target.value })} className="w-full p-2 text-sm border rounded-md" placeholder="e.g., Enter a value" />
          </div>
        )}
      </div>
    </div>
  );
};


// --- FORM BUILDER MODAL COMPONENT (UPDATED) ---
const FormBuilderModal = ({ isOpen, onClose, onSubmit, targetName, initialFields = [] }: { isOpen: boolean, onClose: () => void, onSubmit: (fields: FormField[]) => void, targetName: string, initialFields?: FormField[] }) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));
  useEffect(() => { if (isOpen) setFields(initialFields) }, [isOpen, initialFields]);
  if (!isOpen) return null;
  
  const isFormValid = fields.every(f => f.key.trim() !== '' && f.label.trim() !== '');

  const addField = (type: FormField['type']) => {
    const timestamp = Date.now();
    const newField: FormField = {
      id: `field_${timestamp}`,
      key: `field_${timestamp}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      placeholder: '',
      required: false,
      ...(type === 'select' && { options: [] })
    };
    setFields([...fields, newField]);
  };
  
  const updateField = (id: string, newFieldData: Partial<FormField>) => {
    setFields(fields.map(f => (f.id === id ? { ...f, ...newFieldData } : f)));
  };

  const deleteField = (id: string) => setFields(fields.filter(f => f.id !== id));
  
  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(item => item.id === active.id);
      const newIndex = fields.findIndex(item => item.id === over.id);
      setFields(arrayMove(fields, oldIndex, newIndex));
    }
  };
  const handleSave = () => { if (isFormValid) { onSubmit(fields); onClose(); } };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl animate-modal-pop flex flex-col h-[90vh]">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div><h3 className="text-xl font-bold text-gray-800">Form Builder</h3><p className="text-sm text-gray-500">For: <span className="font-semibold text-indigo-600">{targetName}</span></p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto bg-gray-100">
            {fields.length === 0 ? <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg"><p className="text-gray-500">Your form is empty.</p><p className="text-sm text-gray-400">Add a field to get started!</p></div>
            : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>{fields.map(field => <SortableField key={field.id} field={field} onUpdate={updateField} onDelete={deleteField} />)}</SortableContext></DndContext>}
        </div>
        <div className="p-5 border-t flex flex-wrap justify-between items-center gap-4 bg-gray-50 rounded-b-xl">
            {/* --- UPDATED BUTTONS --- */}
            <div className="flex gap-2">
                <button onClick={() => addField('text')} className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 font-semibold py-2 px-3 rounded-lg hover:bg-blue-200"><FiType /> Text</button>
                <button onClick={() => addField('number')} className="flex items-center gap-2 text-sm bg-teal-100 text-teal-700 font-semibold py-2 px-3 rounded-lg hover:bg-teal-200"><FiHash /> Number</button>
            </div>
            <button onClick={handleSave} disabled={!isFormValid} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {!isFormValid && <FiAlertCircle />} Save Form
            </button>
        </div>
      </div>
    </div>
  );
};


// --- VIEW FORM MODAL COMPONENT (UPDATED) ---
const ViewFormModal = ({ isOpen, onClose, formName, fields }: { isOpen: boolean, onClose: () => void, formName: string, fields: FormField[] }) => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  if (!isOpen) return null;
  
  // Using valueAsNumber for number inputs
  const handleChange = (fieldKey: string, value: any, type: FormField['type']) => {
    setFormData(prev => ({ ...prev, [fieldKey]: type === 'number' ? value : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Form submission for "${formName}":`, formData);
    alert(`Form for "${formName}" submitted! Check the console for the data.`);
    onClose();
  };

  const renderField = (field: FormField) => {
    const { id, key, type, label, placeholder, required } = field;
    switch (type) {
      case 'text': 
        return <div key={id} className="mb-4"><label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label} {required &&<span className="text-red-500">*</span>}</label><input type="text" id={id} name={key} placeholder={placeholder} required={required} onChange={e => handleChange(key, e.target.value, type)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" /></div>;
      
      // Added case to render a number input field
      case 'number':
        return <div key={id} className="mb-4"><label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label} {required &&<span className="text-red-500">*</span>}</label><input type="number" id={id} name={key} placeholder={placeholder} required={required} onChange={e => handleChange(key, e.target.valueAsNumber, type)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" /></div>;
        
      case 'textarea': 
        return <div key={id} className="mb-4"><label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label} {required &&<span className="text-red-500">*</span>}</label><textarea id={id} name={key} rows={4} placeholder={placeholder} required={required} onChange={e => handleChange(key, e.target.value, type)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"></textarea></div>;
      
      case 'checkbox': 
        return <div key={id} className="mb-4 flex items-center"><input type="checkbox" id={id} name={key} required={required} onChange={e => handleChange(key, e.target.checked, type)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor={id} className="ml-2 block text-sm text-gray-900">{label} {required &&<span className="text-red-500">*</span>}</label></div>;
      
      default: return null;
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg animate-modal-pop"><div className="p-5 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-gray-800">{formName}</h3><button onClick={onClose}><FiX size={24}/></button></div><form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">{fields.map(renderField)}<div className="pt-4 flex justify-end gap-3"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button><button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Submit</button></div></form></div>
    </div>
  );
};


// ###################################################################################
// ###                         MAIN COMPONENT                                      ###
// ###################################################################################

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Electronics', subcategories: [{ id: 101, name: 'Mobiles' }, { id: 102, name: 'Laptops' }] },
    { id: 2, name: 'Real Estate', subcategories: [] },
    { id: 3, name: 'Cars', subcategories: [{ id: 301, name: 'Sedan' }, { id: 302, name: 'SUV' }] }
  ]);
  
  // --- All states and handlers from here down remain exactly the same as the previous version ---

  // --- MODAL STATES ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [subCategoryModalMode, setSubCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory | null>(null);
  type FormBuilderTarget = { item: Category | SubCategory, isSub: boolean };
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [formBuilderTarget, setFormBuilderTarget] = useState<FormBuilderTarget | null>(null);
  const [isViewFormModalOpen, setIsViewFormModalOpen] = useState(false);
  const [viewFormName, setViewFormName] = useState('');
  const [viewFormFields, setViewFormFields] = useState<FormField[]>([]);
  // --- CATEGORY & SUBCATEGORY HANDLERS ---
  const handleOpenCategoryModal = (mode: 'add' | 'edit', category?: Category) => { setCategoryModalMode(mode); setCurrentCategory(category || null); setIsCategoryModalOpen(true); };
  const handleCategorySubmit = (name: string, id?: number) => { if (categoryModalMode === 'add') { setCategories([...categories, { id: Date.now(), name, subcategories: [] }]); } else if (categoryModalMode === 'edit' && id) { setCategories(categories.map(cat => cat.id === id ? { ...cat, name } : cat)); } };
  const handleOpenSubCategoryModal = (mode: 'add' | 'edit', parent: Category, sub?: SubCategory) => { setSubCategoryModalMode(mode); setParentCategory(parent); setCurrentSubCategory(sub || null); setIsSubCategoryModalOpen(true); };
  const handleSubCategorySubmit = (name: string, parentId: number, subId?: number) => { setCategories(categories.map(cat => { if (cat.id === parentId) { const newSubcategories = subCategoryModalMode === 'add' ? [...cat.subcategories, { id: Date.now(), name }] : cat.subcategories.map(sub => sub.id === subId ? { ...sub, name } : sub); return { ...cat, subcategories: newSubcategories }; } return cat; })); };
  // --- FORM HANDLERS ---
  const handleOpenFormBuilder = (target: Category | SubCategory, isSub: boolean) => { setFormBuilderTarget({ item: target, isSub }); setIsFormBuilderOpen(true); };
  const handleSaveForm = (fields: FormField[]) => { if (!formBuilderTarget) return; const { item, isSub } = formBuilderTarget; setCategories(categories.map(cat => { if (!isSub && cat.id === item.id) return { ...cat, formFields: fields }; if (isSub) { const isParent = cat.subcategories.some(sub => sub.id === item.id); if (isParent) return { ...cat, subcategories: cat.subcategories.map(sub => sub.id === item.id ? { ...sub, formFields: fields } : sub) }; } return cat; })); setFormBuilderTarget(null); };
  const handleOpenViewForm = (name: string, fields: FormField[]) => { setViewFormName(name); setViewFormFields(fields); setIsViewFormModalOpen(true); };
  // --- DELETE HANDLER ---
  const handleDelete = (id: number, type: 'category' | 'subcategory') => { const confirmationMessage = type === 'category' ? 'Delete category? This will also delete its subcategories.' : 'Delete subcategory?'; if (window.confirm(confirmationMessage)) { if (type === 'category') { setCategories(categories.filter(c => c.id !== id)); } else { setCategories(categories.map(cat => ({ ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== id) }))); } } };

  // --- RENDER ---
  return (
    <AdminLayout>
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
          <button onClick={() => handleOpenCategoryModal('add')} className="flex w-full sm:w-auto justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"><FiPlus /> Add New Category</button>
        </div>
        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800"><tr><th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category / Subcategory</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th><th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Form Actions</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <React.Fragment key={category.id}>
                  <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3"><button onClick={() => handleOpenSubCategoryModal('add', category)} className="text-green-600 hover:text-green-800" title="Add Subcategory"><FiPlus size={18} /></button><button onClick={() => handleOpenCategoryModal('edit', category)} className="text-yellow-600 hover:text-yellow-800" title="Edit Category"><FiEdit size={18} /></button><button onClick={() => handleDelete(category.id, 'category')} className="text-red-600 hover:text-red-800" title="Delete Category"><FiTrash2 size={18} /></button></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2">{category.formFields?.length ? (<><button onClick={() => handleOpenViewForm(category.name, category.formFields!)} className="flex items-center gap-2 text-sm bg-green-100 text-green-700 font-semibold py-1 px-3 rounded-full hover:bg-green-200"><FiEye /> View</button><button onClick={() => handleOpenFormBuilder(category, false)} className="flex items-center gap-2 text-sm bg-yellow-100 text-yellow-700 font-semibold py-1 px-3 rounded-full hover:bg-yellow-200"><FiEdit /> Edit</button></>) : (<button onClick={() => handleOpenFormBuilder(category, false)} className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded-full hover:bg-indigo-200"><FiFilePlus /> Create Form</button>)}</div></td>
                  </tr>
                  {category.subcategories.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className="pl-12 pr-6 py-3 whitespace-nowrap text-sm text-gray-700">{sub.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium space-x-3"><span className="w-6 inline-block"></span><button onClick={() => handleOpenSubCategoryModal('edit', category, sub)} className="text-yellow-600 hover:text-yellow-800" title="Edit Subcategory"><FiEdit size={18} /></button><button onClick={() => handleDelete(sub.id, 'subcategory')} className="text-red-600 hover:text-red-800" title="Delete Subcategory"><FiTrash2 size={18} /></button></td>
                      <td className="px-6 py-3"><div className="flex items-center gap-2">{sub.formFields?.length ? (<><button onClick={() => handleOpenViewForm(sub.name, sub.formFields!)} className="flex items-center gap-2 text-sm bg-green-100 text-green-700 font-semibold py-1 px-3 rounded-full hover:bg-green-200"><FiEye /> View</button><button onClick={() => handleOpenFormBuilder(sub, true)} className="flex items-center gap-2 text-sm bg-yellow-100 text-yellow-700 font-semibold py-1 px-3 rounded-full hover:bg-yellow-200"><FiEdit /> Edit</button></>) : (<button onClick={() => handleOpenFormBuilder(sub, true)} className="flex items-center gap-2 text-sm bg-indigo-100 text-indigo-700 font-semibold py-1 px-3 rounded-full hover:bg-indigo-200"><FiFilePlus /> Create Form</button>)}</div></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {/* --- MOBILE CARD VIEW --- */}
        <div className="md:hidden space-y-4">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start mb-3"><h3 className="font-bold text-lg text-gray-800">{category.name}</h3><div className="flex items-center space-x-2"><button onClick={() => handleOpenCategoryModal('edit', category)} className="text-yellow-600 p-1"><FiEdit size={18} /></button><button onClick={() => handleDelete(category.id, 'category')} className="text-red-600 p-1"><FiTrash2 size={18} /></button></div></div>
              <div className="space-y-2">{category.formFields?.length ? (<div className="flex gap-2"><button onClick={() => handleOpenViewForm(category.name, category.formFields!)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-green-100 text-green-700 font-semibold py-2 px-3 rounded-full"><FiEye /> View Form</button><button onClick={() => handleOpenFormBuilder(category, false)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-yellow-100 text-yellow-700 font-semibold py-2 px-3 rounded-full"><FiEdit /> Edit Form</button></div>) : (<button onClick={() => handleOpenFormBuilder(category, false)} className="w-full flex items-center justify-center gap-2 text-sm bg-indigo-100 text-indigo-700 font-semibold py-2 px-3 rounded-full"><FiFilePlus /> Create Form</button>)}<button onClick={() => handleOpenSubCategoryModal('add', category)} className="w-full flex items-center justify-center gap-2 text-sm bg-gray-100 text-gray-700 font-semibold py-2 px-3 rounded-full"><FiPlus /> Add Subcategory</button></div>
              {category.subcategories.length > 0 && <hr className="my-3"/>}
              <div className="space-y-3 pl-4">
                {category.subcategories.map(sub => (
                  <div key={sub.id}>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-700">{sub.name}</span><div className="flex items-center space-x-2"><button onClick={() => handleOpenSubCategoryModal('edit', category, sub)} className="text-yellow-500 p-1"><FiEdit size={16} /></button><button onClick={() => handleDelete(sub.id, 'subcategory')} className="text-red-500 p-1"><FiTrash2 size={16} /></button></div></div>
                    <div className="mt-2">{sub.formFields?.length ? (<div className="flex gap-2"><button onClick={() => handleOpenViewForm(sub.name, sub.formFields!)} className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-100 text-green-700 font-semibold py-1 px-2 rounded-full"><FiEye /> View</button><button onClick={() => handleOpenFormBuilder(sub, true)} className="flex-1 flex items-center justify-center gap-1 text-xs bg-yellow-100 text-yellow-700 font-semibold py-1 px-2 rounded-full"><FiEdit /> Edit</button></div>) : (<button onClick={() => handleOpenFormBuilder(sub, true)} className="w-full flex items-center justify-center gap-2 text-xs bg-indigo-100 text-indigo-700 font-semibold py-1 px-2 rounded-full"><FiFilePlus /> Create Form</button>)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* --- RENDER ALL MODALS --- */}
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSubmit={handleCategorySubmit} mode={categoryModalMode} currentCategory={currentCategory} />
      <SubCategoryModal isOpen={isSubCategoryModalOpen} onClose={() => setIsSubCategoryModalOpen(false)} onSubmit={handleSubCategorySubmit} mode={subCategoryModalMode} parentCategory={parentCategory} currentSubCategory={currentSubCategory} />
      {formBuilderTarget && <FormBuilderModal isOpen={isFormBuilderOpen} onClose={() => setIsFormBuilderOpen(false)} onSubmit={handleSaveForm} targetName={formBuilderTarget.item.name} initialFields={formBuilderTarget.item.formFields || []} />}
      <ViewFormModal isOpen={isViewFormModalOpen} onClose={() => setIsViewFormModalOpen(false)} formName={viewFormName} fields={viewFormFields} />
    </div>
    </AdminLayout>
  );
};

export default CategoryManagement;