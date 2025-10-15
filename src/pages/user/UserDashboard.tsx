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
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend,
    type PieLabelRenderProps,
} from "recharts";

import { Card, CardContent, Typography, LinearProgress, Button, Box } from "@mui/material";
import { MdOutlineFastfood, MdInventory2, MdLocalMall, MdListAlt, MdCategory, MdGroup, MdTimeline, MdPieChart } from "react-icons/md";
import UserLayout from "../../layouts/UserLayout"; // Assuming this still exists

// --- Type Definitions ---
interface StatData {
    title: string;
    value: string | number;
    icon: React.ReactElement;
    color: string; // Tailwind color class for icon/background
}

// --- Dummy Data ---
const statData: StatData[] = [
    { title: "Consumables", value: "1,240", icon: <MdOutlineFastfood size={28} />, color: "bg-blue-500" },
    { title: "Store Stock", value: "560", icon: <MdInventory2 size={28} />, color: "bg-green-500" },
    { title: "Purchases", value: "320", icon: <MdLocalMall size={28} />, color: "bg-red-500" },
    { title: "Orders", value: "740", icon: <MdListAlt size={28} />, color: "bg-yellow-500" },
    { title: "Categories", value: "18", icon: <MdCategory size={28} />, color: "bg-purple-500" },
    { title: "Total Users", value: "42", icon: <MdGroup size={28} />, color: "bg-pink-500" },
];

const lineData = [
    { name: "Jan", users: 400, orders: 100 },
    { name: "Feb", users: 300, orders: 120 },
    { name: "Mar", users: 600, orders: 180 },
    { name: "Apr", users: 800, orders: 250 },
    { name: "May", users: 700, orders: 220 },
    { name: "Jun", users: 1000, orders: 300 },
];

const barData = [
    { name: "Kitchen", stock: 400 },
    { name: "Store", stock: 300 },
    { name: "Wastage", stock: 60 },
    { name: "Products", stock: 200 },
];

const pieData = [
    { name: "Category A", value: 400 },
    { name: "Category B", value: 300 },
    { name: "Category C", value: 200 },
    { name: "Category D", value: 100 },
];

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// --- Stat Card Component using MUI Card ---
const StatCardMUI: React.FC<StatData> = ({ title, value, icon, color }) => (
    <Card
        className="shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-[1.02] rounded-xl"
        sx={{ minHeight: 140 }}
    >
        <CardContent className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
                <Typography variant="subtitle1" color="text.secondary">
                    {title}
                </Typography>
                <div className={`p-2 rounded-full text-white ${color}`}>
                    {icon}
                </div>
            </div>
            <Typography variant="h4" component="div" className="font-bold mt-4">
                {value}
            </Typography>
        </CardContent>
    </Card>
);

// --- Main Dashboard Component ---
const Dashboard: React.FC = () => {
    return (
        <UserLayout>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
                    📊 Unified Stock & Order Dashboard
                </h1>

                {/* --- Stats Cards Grid --- */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {statData.map((stat, index) => (
                        <StatCardMUI key={index} {...stat} />
                    ))}
                </div>

                {/* --- Reporting & Progress Section --- */}
                <Card className="shadow-lg rounded-xl mb-8 p-6 bg-white">
                    <Typography variant="h6" className="font-semibold mb-4 flex items-center">
                        <span className="mr-2">📈</span> Monthly Performance
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Inventory Utilization (Target 85%)
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={75}
                            sx={{ height: 10, borderRadius: 5, backgroundColor: '#e0e0e0' }}
                            color="success"
                        />
                        <Typography variant="caption" className="float-right text-sm mt-1">
                            75%
                        </Typography>
                    </Box>
                    <div className="mt-8 pt-4 border-t">
                        <Button variant="contained" color="primary" size="large" className="w-full md:w-auto">
                            Generate Detailed Report (PDF)
                        </Button>
                        <Button variant="outlined" color="secondary" size="large" className="mt-3 md:mt-0 md:ml-4 w-full md:w-auto">
                            View All Historical Data
                        </Button>
                    </div>
                </Card>

                {/* --- Charts Grid --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Line Chart: User & Order Timeline */}
                    <ChartCard title="User & Order Growth" icon={<MdTimeline size={20} />} className="xl:col-span-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip wrapperClassName="rounded-lg shadow-lg border-none" contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6" // Blue
                                    strokeWidth={3}
                                    name="Total Users"
                                    dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#ef4444" // Red
                                    strokeWidth={3}
                                    name="New Orders"
                                    dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie Chart: Categories Distribution */}
                    <ChartCard title="Product Categories" icon={<MdPieChart size={20} />}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <Tooltip wrapperClassName="rounded-lg shadow-lg border-none" contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '10px' }} />
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="40%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    labelLine={false}
                                    // Use the imported type from recharts: PieLabelRenderProps
                                    label={(props: PieLabelRenderProps) => {
                                        // We safely destructure the necessary properties from the props object
                                        const { name, percent } = props.payload as { name: string, percent: number };

                                        // recharts passes the percentage as a decimal (0.0 to 1.0) in the payload
                                        // The props object itself contains coordinates, not the percent value directly
                                        // The percent is usually nested inside the 'payload' of the props object.

                                        return `${name} (${(percent * 100).toFixed(0)}%)`;
                                    }}
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Bar Chart: Stock Levels */}
                    <ChartCard title="Stock Levels by Location" icon={<MdInventory2 size={20} />}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip wrapperClassName="rounded-lg shadow-lg border-none" contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }} />
                                <Bar dataKey="stock" fill="#10b981" barSize={30} radius={[4, 4, 0, 0]} /> {/* Green */}
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Area Chart: Consumable Usage */}
                    <ChartCard title="Monthly Consumable Usage" icon={<MdOutlineFastfood size={20} />} className="xl:col-span-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip wrapperClassName="rounded-lg shadow-lg border-none" contentStyle={{ backgroundColor: '#ffffff', border: '1px 1px solid #e0e0e0' }} />
                                <Area
                                    type="monotone"
                                    dataKey="orders" // Reusing order data for area chart example
                                    stroke="#8884d8"
                                    fillOpacity={1}
                                    fill="url(#colorUsage)"
                                    name="Usage Units"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* Placeholder for Map/World View */}
                <div className="mt-8">
                    <ChartCard title="Global Supply Chain View" icon={<span className="mr-2">🌍</span>}>
                        <div className="h-64 flex items-center justify-center bg-gray-100 border-dashed border-2 border-gray-300 rounded-lg">
                            <p className="text-gray-500">
                                Placeholder for World Map or Earth Visualization (e.g., using `react-simple-maps` or similar library)
                            </p>
                        </div>
                    </ChartCard>
                </div>
            </div>
        </UserLayout>
    );
};

export default Dashboard;

// --- Helper Component for Chart Wrapping (to keep code clean) ---
// This uses a simple Card component styled with Tailwind
const ChartCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactElement; className?: string }> = ({ title, children, icon, className = "" }) => (
    <div className={`bg-white shadow-lg rounded-xl p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h2>
        {children}
    </div>
);