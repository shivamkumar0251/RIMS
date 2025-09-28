
import React from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import UserLayout from "../../layouts/UserLayout";

interface StatCardProps {
    title: string;
    value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
);

const Dashboard: React.FC = () => {
    // Dummy chart data
    const lineData = [
        { name: "Jan", users: 400 },
        { name: "Feb", users: 300 },
        { name: "Mar", users: 600 },
        { name: "Apr", users: 800 },
        { name: "May", users: 700 },
        { name: "Jun", users: 1000 },
    ];

    const barData = [
        { name: "Category A", products: 400 },
        { name: "Category B", products: 300 },
        { name: "Category C", products: 600 },
        { name: "Category D", products: 200 },
    ];

    return (
        <UserLayout>
            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    <StatCard title="Consume" value="1,240" />
                    <StatCard title="Store Stock" value="560" />
                    <StatCard title="Purchases" value="320" />
                    <StatCard title="Orders" value="740" />
                    <StatCard title="Total Categories" value="18" />
                    <StatCard title="Total Subcategories" value="42" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <div className="bg-white shadow-md rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4">User Growth</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white shadow-md rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Products by Category</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="products" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};

export default Dashboard;
