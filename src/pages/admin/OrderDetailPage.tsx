import { useEffect, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { mockOrders, type Order } from "../../data/ordersWithDetails";
import { AdminLayout } from "../../layouts/AdminLayout";

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  // State to hold the order details. We can edit this state.
  const [order, setOrder] = useState<Order | null>(null);

  // Find the correct order from our mock data when the page loads
  useEffect(() => {
    const foundOrder = mockOrders.find(o => o.id === orderId);
    if (foundOrder) {
      // Create a deep copy so we can edit it without changing the original mock data
      setOrder(JSON.parse(JSON.stringify(foundOrder)));
    }
  }, [orderId]);

  // --- HANDLER FUNCTIONS ---

  // This function is called whenever you change the quantity in the input box
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!order) return;

    const updatedItems = order.items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity < 1 ? 1 : newQuantity } : item
    );

    // Recalculate totals
    let subtotal = 0;
    let gstAmount = 0;
    updatedItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      gstAmount += itemTotal * (item.gst / 100);
    });

    setOrder({
      ...order,
      items: updatedItems,
      subtotal,
      gstAmount,
      totalAmount: subtotal + gstAmount
    });
  };

  // Function for the "Process & Deliver" button
  const handleProcessOrder = () => {
    // In a real app, you would send the updated 'order' object to your server here
    // and change its status to "Delivered".
    alert(`Order ${order?.id} has been processed and marked as DELIVERED.\nThis is a simulation.`);
    navigate('/admin/orders'); // Go back to the main order list
  };

  // Function for the "Cancel Order" button
  const handleCancelOrder = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      // In a real app, you would update the order status to "Canceled" on the server.
      alert(`Order ${order?.id} has been CANCELED.\nThis is a simulation.`);
      navigate('/admin/orders'); // Go back to the main order list
    }
  };


  // If the order is still loading or not found, show a message
  if (!order) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-slate-600">Loading order details...</div>
      </AdminLayout>
    );
  }

  // --- RENDER THE PAGE ---
  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors">
             <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Order Details</h1>
            <p className="text-slate-500">Order ID: {order.id}</p>
          </div>
        </div>
        
        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6 pb-6 border-b">
                <div><strong>Customer:</strong> {order.customerName} ({order.userId})</div>
                <div><strong>Date:</strong> {order.orderDate}</div>
                <div><strong>Status:</strong> <span className="font-bold text-yellow-600">{order.status}</span></div>
            </div>

            {/* Products Table */}
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Products in this Order</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 text-sm">
                        <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">GST</th>
                            <th className="p-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-3 font-medium flex items-center">
                                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-md object-cover mr-4"/>
                                    {item.name}
                                </td>
                                <td className="p-3">₹{item.price.toLocaleString('en-IN')}</td>
                                <td className="p-3">
                                    <input 
                                      type="number" 
                                      value={item.quantity} 
                                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))} 
                                      className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="p-3">{item.gst}%</td>
                                <td className="p-3 text-right font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-6">
                <div className="w-full sm:w-1/3 space-y-2 text-slate-700">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>GST:</span> <span>+ ₹{order.gstAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span>Grand Total:</span> <span>₹{order.totalAmount.toLocaleString('en-IN')}</span></div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-end gap-4">
                <button 
                  onClick={handleCancelOrder}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
                >
                    <FiXCircle /> Cancel Order
                </button>
                <button 
                  onClick={handleProcessOrder}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
                >
                    <FiCheckCircle /> Process & Deliver
                </button>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}