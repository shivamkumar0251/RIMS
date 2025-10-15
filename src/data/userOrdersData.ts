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
    // --- Existing 6 Orders ---
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
    {
        id: 'ORD-2024-77889',
        customerName: 'Vikram Singh',
        orderDate: '2024-09-25',
        deliveryDate: '2024-09-30',
        status: 'Delivered',
        shippingAddress: '7th Cross, Koramangala, Bengaluru, 560034',
        products: [
            { id: 501, name: 'Running Shoes', category: 'Apparel', price: 2500, quantity: 1, gst: 12 },
        ],
    },
    {
        id: 'ORD-2024-00112',
        customerName: 'Neha Reddy',
        orderDate: '2024-10-17',
        deliveryDate: null,
        status: 'Pending',
        shippingAddress: '10, Banjara Hills, Hyderabad, 500034',
        products: [
            { id: 601, name: 'Novel by Indian Author', category: 'Books', price: 400, quantity: 2, gst: 5 },
        ],
    },

    // --- 14 New Orders (Total 20) ---
    {
        id: 'ORD-2024-19010',
        customerName: 'Gaurav Jain',
        orderDate: '2024-10-18',
        deliveryDate: null,
        status: 'Pending',
        shippingAddress: 'Flat 5B, Green Towers, Pune, 411001',
        products: [
            { id: 701, name: 'Smart Watch X5', category: 'Electronics', price: 8000, quantity: 1, gst: 18 },
        ],
    },
    {
        id: 'ORD-2024-88776',
        customerName: 'Sonia Desai',
        orderDate: '2024-09-01',
        deliveryDate: '2024-09-05',
        status: 'Delivered',
        shippingAddress: 'Plot 22, Gandhi Nagar, Ahmedabad, 380006',
        products: [
            { id: 801, name: 'Stainless Steel Flask', category: 'Tools', price: 750, quantity: 4, gst: 12 },
        ],
    },
    {
        id: 'ORD-2024-33445',
        customerName: 'Kiran Rao',
        orderDate: '2024-10-02',
        deliveryDate: '2024-10-09',
        status: 'Shipped',
        shippingAddress: 'Road No 3, Jubilee Hills, Hyderabad, 500033',
        products: [
            { id: 901, name: 'Classic Denim Jeans', category: 'Apparel', price: 1800, quantity: 2, gst: 12 },
            { id: 902, name: 'Belt (Black)', category: 'Apparel', price: 400, quantity: 1, gst: 12 },
        ],
    },
    {
        id: 'ORD-2024-65432',
        customerName: 'Deepa Verma',
        orderDate: '2024-09-15',
        deliveryDate: null,
        status: 'Cancelled',
        shippingAddress: '789, Park Avenue, Kolkata, 700001',
        products: [
            { id: 1001, name: 'Trekking Backpack (Large)', category: 'Apparel', price: 3500, quantity: 1, gst: 18 },
        ],
    },
    {
        id: 'ORD-2024-09102',
        customerName: 'Vivek Malhotra',
        orderDate: '2024-10-15',
        deliveryDate: null,
        status: 'Shipped',
        shippingAddress: 'D-99, Vasant Kunj, New Delhi, 110070',
        products: [
            { id: 1101, name: 'Electric Kettle', category: 'Electronics', price: 1100, quantity: 1, gst: 28 },
            { id: 1102, name: 'Green Tea Bags (100 pack)', category: 'Groceries', price: 300, quantity: 3, gst: 5 },
        ],
    },
    {
        id: 'ORD-2024-55555',
        customerName: 'Ritu Singh',
        orderDate: '2024-08-20',
        deliveryDate: '2024-08-27',
        status: 'Delivered',
        shippingAddress: 'B-101, Sun City, Jaipur, 302001',
        products: [
            { id: 1201, name: 'Yoga Mat', category: 'Apparel', price: 900, quantity: 1, gst: 12 },
            { id: 1202, name: 'Resistance Bands Set', category: 'Tools', price: 600, quantity: 1, gst: 18 },
            { id: 1203, name: 'Healthy Snack Box', category: 'Groceries', price: 1200, quantity: 1, gst: 5 },
        ],
    },
    {
        id: 'ORD-2024-12300',
        customerName: 'Mohit Chawla',
        orderDate: '2024-10-17',
        deliveryDate: null,
        status: 'Pending',
        shippingAddress: 'Sec 45, Gurgaon, 122002',
        products: [
            { id: 1301, name: 'Laptop Stand', category: 'Electronics', price: 2100, quantity: 1, gst: 18 },
        ],
    },
    {
        id: 'ORD-2024-11100',
        customerName: 'Anjali Menon',
        orderDate: '2024-09-28',
        deliveryDate: '2024-10-04',
        status: 'Delivered',
        shippingAddress: '3rd Main Rd, Adyar, Chennai, 600020',
        products: [
            { id: 1401, name: 'Fantasy Novel, Part 1', category: 'Books', price: 500, quantity: 1, gst: 5 },
            { id: 1402, name: 'Fantasy Novel, Part 2', category: 'Books', price: 500, quantity: 1, gst: 5 },
        ],
    },
    {
        id: 'ORD-2024-22200',
        customerName: 'Jatin Kalia',
        orderDate: '2024-10-08',
        deliveryDate: null,
        status: 'Shipped',
        shippingAddress: 'HSR Layout, Bengaluru, 560102',
        products: [
            { id: 1501, name: 'Adjustable Wrench', category: 'Tools', price: 800, quantity: 1, gst: 18 },
            { id: 1502, name: 'Screw Driver Set', category: 'Tools', price: 1500, quantity: 1, gst: 18 },
        ],
    },
    {
        id: 'ORD-2024-33300',
        customerName: 'Sanjana Bose',
        orderDate: '2024-10-01',
        deliveryDate: null,
        status: 'Cancelled',
        shippingAddress: 'Salt Lake City, Kolkata, 700064',
        products: [
            { id: 1601, name: 'Gaming Mouse', category: 'Electronics', price: 2500, quantity: 1, gst: 28 },
        ],
    },
    {
        id: 'ORD-2024-44400',
        customerName: 'Rahul Taneja',
        orderDate: '2024-09-10',
        deliveryDate: '2024-09-17',
        status: 'Delivered',
        shippingAddress: 'Bandra West, Mumbai, 400050',
        products: [
            { id: 1701, name: 'Winter Jacket', category: 'Apparel', price: 4000, quantity: 1, gst: 12 },
        ],
    },
    {
        id: 'ORD-2024-55500',
        customerName: 'Zoya Khan',
        orderDate: '2024-10-18',
        deliveryDate: null,
        status: 'Pending',
        shippingAddress: '12th Cross, Indiranagar, Bengaluru, 560038',
        products: [
            { id: 1801, name: 'HDMI Cable (2m)', category: 'Electronics', price: 450, quantity: 2, gst: 18 },
        ],
    },
    {
        id: 'ORD-2024-66600',
        customerName: 'Anil Gupta',
        orderDate: '2024-10-11',
        deliveryDate: null,
        status: 'Shipped',
        shippingAddress: 'Ashok Vihar, New Delhi, 110052',
        products: [
            { id: 1901, name: 'Flour (5kg)', category: 'Groceries', price: 300, quantity: 2, gst: 5 },
            { id: 1902, name: 'Sugar (1kg)', category: 'Groceries', price: 60, quantity: 5, gst: 5 },
        ],
    },
    {
        id: 'ORD-2024-77700',
        customerName: 'Pooja Singh',
        orderDate: '2024-08-05',
        deliveryDate: '2024-08-10',
        status: 'Delivered',
        shippingAddress: 'Marine Drive, Mumbai, 400020',
        products: [
            { id: 2001, name: 'Advanced Calculus Textbook', category: 'Books', price: 1800, quantity: 1, gst: 5 },
        ],
    },
];