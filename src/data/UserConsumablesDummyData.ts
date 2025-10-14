export interface Product {
    id: number;
    productName: string;
    quantity: number;
    consumables: number;
    wastage: number;
    createdDate: string;
}

export const USER_CONSUMABLES: Product[] = [
    {
        id: 1,
        productName: "Sugar",
        quantity: 100,
        consumables: 60,
        wastage: 10,
        createdDate: "2025-10-10",
    },
    {
        id: 2,
        productName: "Flour",
        quantity: 80,
        consumables: 40,
        wastage: 5,
        createdDate: "2025-10-11",
    },
    {
        id: 3,
        productName: "Oil",
        quantity: 50,
        consumables: 25,
        wastage: 5,
        createdDate: "2025-10-12",
    },
    {
        id: 4,
        productName: "Rice",
        quantity: 70,
        consumables: 45,
        wastage: 8,
        createdDate: "2025-10-13",
    },
    {
        id: 5,
        productName: "Milk Powder",
        quantity: 30,
        consumables: 15,
        wastage: 2,
        createdDate: "2025-10-14",
    },
];
