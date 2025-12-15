import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Checkbox, TextField, Button
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import {
  getVendorOrders,
  updateVendorOrder,
  selectVendorOrderState
} from "../../redux/slices/vendorOrderSlice";

function VendorOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { vendorOrders } = useAppSelector(selectVendorOrderState);

  const order = vendorOrders.find(o => o._id === id);

  const [selected, setSelected] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!order) dispatch(getVendorOrders({ page: 1, limit: 10 }));
  }, []);

  const toggleSelect = (productId: string) => {
    setSelected(prev => ({
      ...prev,
      [productId]: prev[productId]
        ? undefined
        : { sendToPurchaseQty: 0, remarks: "" }
    }));
  };

  const handleSubmit = () => {
    const payload = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([productId, v]) => ({
        productId,
        sendToPurchaseQty: Number(v.sendToPurchaseQty),
        remarks: v.remarks
      }));

    dispatch(updateVendorOrder({
      vendorOrderId: id!,
      products: payload 
    }));
  };

  if (!order) return null;

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">
        Order #{order.orderNumber}
      </h2>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Select</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Order Qty</TableCell>
            <TableCell>Send Qty</TableCell>
            <TableCell>Remarks</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {order.products.map(p => (
            <TableRow key={p._id}>
              <TableCell>
                <Checkbox
                  checked={!!selected[p.productId._id]}
                  onChange={() => toggleSelect(p.productId._id)}
                />
              </TableCell>

              <TableCell>{p.productId.productName}</TableCell>
              <TableCell>{p.orderQty}</TableCell>

              <TableCell>
                <TextField
                  type="number"
                  disabled={!selected[p.productId._id]}
                  value={selected[p.productId._id]?.sendToPurchaseQty || ""}
                  onChange={e =>
                    setSelected({
                      ...selected,
                      [p.productId._id]: {
                        ...selected[p.productId._id],
                        sendToPurchaseQty: e.target.value
                      }
                    })
                  }
                />
              </TableCell>

              <TableCell>
                <TextField
                  disabled={!selected[p.productId._id]}
                  value={selected[p.productId._id]?.remarks || ""}
                  onChange={e =>
                    setSelected({
                      ...selected,
                      [p.productId._id]: {
                        ...selected[p.productId._id],
                        remarks: e.target.value
                      }
                    })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        variant="contained"
        className="mt-4"
        onClick={handleSubmit}
      >
        Send to Purchase
      </Button>
    </AdminLayout>
  );
}

export default VendorOrderDetails;
