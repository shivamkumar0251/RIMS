import { useEffect, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiClock, FiPackage, FiTrash2, FiXCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AdminLayout } from "../../layouts/AdminLayout";
import { getOrders, updateOrder, deleteWholeOrder, selectOrders, selectOrderLoading } from "../../redux/slices/orderSlice";
import type { AppDispatch } from "../../redux/store/store";
import type { Order } from "../../redux/slices/orderSlice";

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);

  // State to hold the order details. We can edit this state.
  const [order, setOrder] = useState<Order | null>(null);

  // Fetch orders if not already loaded
  useEffect(() => {
    if (orders.length === 0) {
      dispatch(getOrders({ page: 1, limit: 1000 }));
    }
  }, [dispatch, orders.length]);

  // Find the correct order when orders are loaded or orderId changes
  useEffect(() => {
    if (orders.length > 0 && orderId) {
      const foundOrder = orders.find((o: Order) => o._id === orderId);
      if (foundOrder) {
        // Create a deep copy so we can edit it without changing the original data
        setOrder(JSON.parse(JSON.stringify(foundOrder)));
      }
    }
  }, [orders, orderId]);

  // --- HANDLER FUNCTIONS ---

  // This function is called whenever you change an editable value in the table
  const handleItemChange = (itemId: string, field: string, value: unknown) => {
    if (!order) return;

    const orderData = order as Record<string, unknown>;
    const items = (orderData.items || []) as Array<Record<string, unknown>>;
    
    const updatedItems = items.map(item => {
      if (String(item._id || item.id) === itemId) {
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

  const recalculateTotals = (items: Array<Record<string, unknown>>) => {
    let subtotal = 0;
    let gstAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;

    items.forEach(item => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);
      const gst = Number(item.gst || 0);
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      cgstAmount += itemTotal * ((gst / 2) / 100); // Assuming CGST is half of GST
      sgstAmount += itemTotal * ((gst / 2) / 100); // Assuming SGST is half of GST
    });
    
    gstAmount = cgstAmount + sgstAmount;

    setOrder(prevOrder => {
      if (!prevOrder) return null;
      return {
        ...prevOrder,
        items: items,
        subtotal,
        gstAmount,
        totalAmount: subtotal + gstAmount
      } as Order;
    });
  };

  const handleActionClick = async (itemId: string, action: 'out-of-stock' | 'send-later' | 'delete') => {
    if (!order) return;

    const orderData = order as Record<string, unknown>;
    let updatedItems = [...(orderData.items || [])] as Array<Record<string, unknown>>;

    if (action === 'delete') {
      if (window.confirm("Are you sure you want to delete this item from the order?")) {
        updatedItems = updatedItems.filter(item => String(item._id || item.id) !== itemId);
        recalculateTotals(updatedItems);
        // Update order via API
        await dispatch(updateOrder({ orderId: order._id, orderData: { items: updatedItems } }));
      }
    } else {
        alert(`Item ${itemId} marked as '${action}'.`);
        // In a real app, you might update the item's status property here
    }
  };
  
  // Function for the "Process" button
  const handleProcessOrder = async () => {
    if (!order) return;
    
    if (window.confirm(`Are you sure you want to process order ${order._id}?`)) {
      await dispatch(updateOrder({ orderId: order._id, orderData: { status: 'Processing' } }));
      alert(`Order ${order._id} has been PROCESSED.`);
      navigate('/admin/orders'); // Go back to the main order list
    }
  };

  // Function for the "Cancel Order" button
  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await dispatch(deleteWholeOrder(order._id));
      alert(`Order ${order._id} has been CANCELED.`);
      navigate('/admin/orders'); // Go back to the main order list
    }
  };

  // If the order is still loading or not found, show a message
  if (loading || !order) {
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
                <span>Order ID: {(order as Record<string, unknown>)._id || (order as Record<string, unknown>).id}</span> | <span>Customer ID: {(order as Record<string, unknown>).userId || (order as Record<string, unknown>).user || 'N.A'}</span>
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
                        {((order as Record<string, unknown>).items || []).map((item: Record<string, unknown>) => {
                            const itemId = String(item._id || item.id || '');
                            const itemName = String(item.name || item.productName || 'N.A');
                            const itemImg = String(item.img || item.image || '');
                            const price = Number(item.price || 0);
                            const quantity = Number(item.quantity || 0);
                            const gst = Number(item.gst || 0);
                            const orderDate = (order as Record<string, unknown>).orderDate || (order as Record<string, unknown>).createdAt || '';

                            return (
                                <tr key={itemId} className="border-b">
                                    <td className="p-3 font-medium flex items-center">
                                        {itemImg && <img src={itemImg} alt={itemName} className="w-12 h-12 rounded-md object-cover mr-4"/>}
                                        {itemName}
                                    </td>
                                    <td className="p-3">
                                      <input 
                                        type="number"
                                        value={price}
                                        onChange={(e) => handleItemChange(itemId, 'price', e.target.value)}
                                        className="w-24 px-2 py-1 border border-slate-300 rounded-md"
                                      />
                                    </td>
                                    <td className="p-3">
                                        <input 
                                          type="number" 
                                          value={quantity} 
                                          onChange={(e) => handleItemChange(itemId, 'quantity', e.target.value)} 
                                          className="w-20 px-2 py-1 border border-slate-300 rounded-md"
                                        />
                                    </td>
                                    <td className="p-3">{String(orderDate)}</td>
                                    <td className="p-3">
                                      <input 
                                        type="number"
                                        value={gst}
                                        onChange={(e) => handleItemChange(itemId, 'gst', e.target.value)}
                                        className="w-20 px-2 py-1 border border-slate-300 rounded-md"
                                      />%
                                    </td>
                                    <td className="p-3">{(gst / 2).toFixed(2)}%</td>
                                    <td className="p-3">{(gst / 2).toFixed(2)}%</td>
                                    <td className="p-3 font-semibold">₹{(price * quantity).toLocaleString('en-IN')}</td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                          <button onClick={() => handleActionClick(itemId, 'out-of-stock')} className="p-2 text-orange-500 hover:bg-orange-100 rounded-full" title="Out of Stock"><FiPackage /></button>
                                          <button onClick={() => handleActionClick(itemId, 'send-later')} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full" title="Send Later"><FiClock /></button>
                                          <button onClick={() => handleActionClick(itemId, 'delete')} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Delete"><FiTrash2 /></button>
                                      </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-6">
                <div className="w-full sm:w-1/3 space-y-2 text-slate-700">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₹{Number((order as Record<string, unknown>).subtotal || 0).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>CGST:</span> <span>+ ₹{(Number((order as Record<string, unknown>).gstAmount || 0) / 2).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>SGST:</span> <span>+ ₹{(Number((order as Record<string, unknown>).gstAmount || 0) / 2).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2"><span>Grand Total:</span> <span>₹{Number((order as Record<string, unknown>).totalAmount || 0).toLocaleString('en-IN')}</span></div>
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