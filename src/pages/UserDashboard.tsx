

import React, { useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa'; 
import UserLayout from '../layouts/UserLayout';


type SubItem = {
    id: number;
    name: string;
    imageUrl: string;
    isSelected: boolean;
    quantity: number | '';
    price: number | '';
    gst: number | '';
};

type ServiceCategory = {
    id: number;
    name: string;
    subItems: SubItem[];
};


const dummyServiceData: ServiceCategory[] = [
    { 
        id: 1, 
        name: 'Interior', 
        subItems: [ 
            { id: 101, name: 'Design Consultation', imageUrl: 'https://api.iconify.design/ph:presentation-chart-duotone.svg', isSelected: true, quantity: 1, price: 5000, gst: 18 },
            { id: 102, name: '3D Visualization', imageUrl: 'https://api.iconify.design/ph:cube-duotone.svg', isSelected: false, quantity: 1, price: 8000, gst: 18 },
        ] 
    },
    { 
        id: 2, 
        name: 'Kitchen', 
        subItems: [ 
            { id: 201, name: 'Modular Kitchen', imageUrl: 'https://api.iconify.design/ph:cooking-pot-duotone.svg', isSelected: true, quantity: 1, price: 75000, gst: 18 },
            { id: 202, name: 'Cabinetry', imageUrl: 'https://api.iconify.design/ph:archive-box-duotone.svg', isSelected: true, quantity: 1, price: 45000, gst: 18 },
        ] 
    },
];



type SubItemRowProps = {
    item: SubItem;
    onUpdate: (field: keyof SubItem, value: string | number | boolean) => void;
};

const SubItemRow: React.FC<SubItemRowProps> = ({ item, onUpdate }) => { 
    return (
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-200 px-4 py-3 text-gray-800">
            <div className="flex items-center space-x-4">
                <input type="checkbox" checked={item.isSelected} onChange={(e) => onUpdate('isSelected', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <span className="font-medium">{item.name}</span>
            </div>
            <div className="flex justify-center">
                <img src={item.imageUrl} alt={item.name} className="h-[50px] w-[50px] rounded-md bg-gray-100 object-contain p-1" />
            </div>
            <input type="number" value={item.quantity} onChange={(e) => onUpdate('quantity', e.target.valueAsNumber || '')} className="w-full rounded-md border border-gray-300 p-2 text-center focus:border-blue-500 focus:ring-blue-500" placeholder="-"/>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input type="number" value={item.price} onChange={(e) => onUpdate('price', e.target.valueAsNumber || '')} className="w-full rounded-md border border-gray-300 p-2 pl-7 focus:border-blue-500 focus:ring-blue-500" placeholder="0"/>
            </div>
            <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                <input type="number" value={item.gst} onChange={(e) => onUpdate('gst', e.target.valueAsNumber || '')} className="w-full rounded-md border border-gray-300 p-2 pr-8 focus:border-blue-500 focus:ring-blue-500" placeholder="0"/>
            </div>
            <button className="text-gray-500 hover:text-blue-600">
                <FaPencilAlt className="h-5 w-5" /> {/* Icon updated */}
            </button>
        </div>
    );
};


const UserDashboard: React.FC = () => {
  
    const [serviceData, setServiceData] = useState(dummyServiceData);
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(serviceData[0]);

    // अपडेट लॉजिक अब लोकल state को बदलेगा
    const handleSubItemUpdate = (subItemId: number, field: keyof SubItem, value: any) => {
        if (!selectedCategory) return;

        const updatedSubItems = selectedCategory.subItems.map(item =>
            item.id === subItemId ? { ...item, [field]: value } : item
        );
        const updatedCategory = { ...selectedCategory, subItems: updatedSubItems };

        const updatedServiceData = serviceData.map(cat => 
            cat.id === updatedCategory.id ? updatedCategory : cat
        );
        
        setServiceData(updatedServiceData);
        setSelectedCategory(updatedCategory);
    };

    return (
        <UserLayout >
        <div className="h-full rounded-2xl bg-white p-6 shadow-sm">
            
            {/* डेमो के लिए कैटेगरी बदलने वाले बटन */}
            <div className="mb-4 flex gap-2">
                {serviceData.map(cat => (
                    <button 
                        key={cat.id} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-lg px-4 py-2 font-semibold ${selectedCategory?.id === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <h2 className="mb-6 text-3xl font-bold text-gray-800">
                {selectedCategory?.name || 'All Services'}
            </h2>
            
            <div className="sticky top-0 grid grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b-2 border-gray-200 bg-white px-4 py-2 text-left text-sm font-semibold text-gray-500">
                <span>Name</span>
                <span className="text-center">Image</span>
                <span className="text-center">Quantity</span>
                <span>Price</span>
                <span>GST</span>
                <span />
            </div>

            {selectedCategory ? (
                <div>
                    {selectedCategory.subItems.map(item => (
                        <SubItemRow
                            key={item.id}
                            item={item}
                            onUpdate={(field, value) => handleSubItemUpdate(item.id, field, value)}
                        />
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-center text-gray-500">
                    Please select a category to see its items.
                </p>
            )}
        </div>
        </UserLayout>
    );
};

export default UserDashboard;