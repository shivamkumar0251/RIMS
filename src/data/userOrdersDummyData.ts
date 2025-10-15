// src/data/userOrdersData.ts

export interface Product {
    id: number;
    name: string;
    category: 'Electronics' | 'Apparel' | 'Books' | 'Tools' | 'Groceries';
    price: number; // Unit price
    quantity: number;
    gst: 5 | 12 | 18 | 28; // GST percentage
}

export interface Order {
    id: string;
    customerName: string;
    orderDate: string; // YYYY-MM-DD format
    deliveryDate: string | null;
    status: 'Delivered' | 'Shipped' | 'Pending' | 'Cancelled';
    products: Product[];
    shippingAddress: string;
}

export const orders: Order[] = [
    {
        id: 'ORD-2024-54321',
        customerName: 'Aarav Sharma',
        orderDate: '2024-10-10',
        deliveryDate: '2024-10-15',
        status: 'Delivered',
        shippingAddress: '123, Lotus Apartment, Bengaluru, 560001',
        products: [
            { id: 101, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 4500, quantity: 1, gst: 18 },
            { id: 102, name: 'Organic Coffee Beans (500g)', category: 'Groceries', price: 550, quantity: 2, gst: 5 },
        ],
    },
    {
        id: 'ORD-2024-98765',
        customerName: 'Priya Patel',
        orderDate: '2024-10-14',
        deliveryDate: null,
        status: 'Shipped',
        shippingAddress: '45, Palm Street, Mumbai, 400002',
        products: [
            { id: 201, name: 'Digital Multimeter', category: 'Tools', price: 1200, quantity: 1, gst: 18 },
            { id: 202, name: 'Cotton T-Shirt (Blue)', category: 'Apparel', price: 600, quantity: 3, gst: 12 },
        ],
    },
    {
        id: 'ORD-2024-11223',
        customerName: 'Rajesh Kumar',
        orderDate: '2024-10-16',
        deliveryDate: null,
        status: 'Pending',
        shippingAddress: 'Sector 18, Noida, 201301',
        products: [
            { id: 301, name: 'The Art of War (Book)', category: 'Books', price: 350, quantity: 1, gst: 5 },
            { id: 302, name: 'Power Bank 10000mAh', category: 'Electronics', price: 1500, quantity: 1, gst: 18 },
        ],
    },
    {
        id: 'ORD-2024-44556',
        customerName: 'Shalini Gupta',
        orderDate: '2024-10-05',
        deliveryDate: null,
        status: 'Cancelled',
        shippingAddress: '303, Sky Tower, Chennai, 600006',
        products: [
            { id: 401, name: 'Kitchen Blender', category: 'Electronics', price: 3000, quantity: 1, gst: 28 },
        ],
    },
];