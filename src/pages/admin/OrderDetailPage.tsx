import { useEffect, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiClock, FiPackage, FiTrash2, FiXCircle } from "react-icons/fi";
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

  // This function is called whenever you change an editable value in the table
  const handleItemChange = (itemId: string, field: string, value: any) => {
    if (!order) return;

    const updatedItems = order.items.map(item => {
      if (item.id === itemId) {
        let newValue = value;
        // Ensure numeric fields are not negative
        if (field === 'price' || field === 'quantity' || field === 'gst' || field === 'cgst' || field === 'sgst') {
          newValue = Number(value) < 0 ? 0 : Number(value);
        }
        return { ...item, [field]: newValue };
      }
      return item;
    });

    recalculateTotals(updatedItems);
  };

  const recalculateTotals = (items: any[]) => {
    let subtotal = 0;
    let gstAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;

    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      cgstAmount += itemTotal * ((item.gst / 2) / 100); // Assuming CGST is half of GST
      sgstAmount += itemTotal * ((item.gst / 2) / 100); // Assuming SGST is half of GST
    });
    
    gstAmount = cgstAmount + sgstAmount;

    setOrder(prevOrder => {
      if (!prevOrder) return null;
      return {
        ...prevOrder,
        items,
        subtotal,
        gstAmount,
        totalAmount: subtotal + gstAmount
      };
    });
  };

  const handleActionClick = (itemId: string, action: 'out-of-stock' | 'send-later' | 'delete') => {
    if (!order) return;

    let updatedItems = [...order.items];

    if (action === 'delete') {
      if (window.confirm("Are you sure you want to delete this item from the order?")) {
        updatedItems = order.items.filter(item => item.id !== itemId);
      }
    } else {
        alert(`Item ${itemId} marked as '${action}'. This is a simulation.`);
        // In a real app, you might update the item's status property here
    }
    
    recalculateTotals(updatedItems);
  };
  
  // Function for the "Process" button
  const handleProcessOrder = () => {
    alert(`Order ${order?.id} has been PROCESSED.\nThis is a simulation.`);
    navigate('/admin/orders'); // Go back to the main order list
  };

  // Function for the "Cancel Order" button
  const handleCancelOrder = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-slate-200 transition-colors">
                 <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">View Orders</h1>
              <div className="text-slate-500">
                <span>Order ID: {order.id}</span> | <span>Customer ID: {order.userId}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            {/* Products Table */}
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Products</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 text-sm">
                        <tr>
                            <th className="p-3">Product</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">Order Date</th>
                            <th className="p-3">GST</th>
                            <th className="p-3">CGST</th>
                            <th className="p-3">SGST</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-3 font-medium flex items-center">
                                    <img src={item.img} alt={item.name} className="w-12 h-12 rounded-md object-cover mr-4"/>
                                    {item.name}
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                    className="w-24 px-2 py-1 border border-slate-300 rounded-md"
                                  />
                                </td>
                                <td className="p-3">
                                    <input 
                                      type="number" 
                                      value={item.quantity} 
                                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                                      className="w-20 px-2 py-1 border border-slate-300 rounded-md"
                                    />
                                </td>
                                <td className="p-3">{order.orderDate}</td>
                                <td className="p-3">
                                  <input 
                                    type="number"
                                    value={item.gst}
                                    onChange={(e) => handleItemChange(item.id, 'gst', e.target.value)}
                                    className="w-20 px-2 py-1 border border-slate-300 rounded-md"
                                  />%
                                </td>
                                <td className="p-3">{(item.gst / 2).toFixed(2)}%</td>
                                <td className="p-3">{(item.gst / 2).toFixed(2)}%</td>
                                <td className="p-3 font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                      <button onClick={() => handleActionClick(item.id, 'out-of-stock')} className="p-2 text-orange-500 hover:bg-orange-100 rounded-full" title="Out of Stock"><FiPackage /></button>
                                      <button onClick={() => handleActionClick(item.id, 'send-later')} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full" title="Send Later"><FiClock /></button>
                                      <button onClick={() => handleActionClick(item.id, 'delete')} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><FiTrash2 /></button>
                                  </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-6">
                <div className="w-full sm:w-1/3 space-y-2 text-slate-700">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>CGST:</span> <span>+ ₹{(order.gstAmount / 2).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>SGST:</span> <span>+ ₹{(order.gstAmount / 2).toLocaleString('en-IN')}</span></div>
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
                    <FiCheckCircle /> Process
                </button>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}