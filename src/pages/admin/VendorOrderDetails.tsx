import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  getVendorOrders,
  selectVendorOrderState,
  updateVendorOrder
} from "../../redux/slices/vendorOrderSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
function VendorOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { vendorOrders } = useAppSelector(selectVendorOrderState);

  const order = vendorOrders.find(o => o._id === id);

  const [selected, setSelected] = useState<Record<string, any>>({});

  // ---------------- Fetch ----------------
  useEffect(() => {
    if (!order) {
      dispatch(getVendorOrders({ page: 1, limit: 10 }));
    }
  }, [order, dispatch]);

  // ---------------- Select Logic ----------------
  const toggleSelect = (productId: string) => {
    setSelected(prev => ({
      ...prev,
      [productId]: prev[productId]
        ? undefined
        : { sendToPurchaseQty: 0, remarks: "" }
    }));
  };
  const filterOrder = order?.products.filter(o=>o.productId)
  const allSelected =
    filterOrder?.length
      ? filterOrder?.every(p => !!selected[p.productId?._id])
      : false;

  const toggleSelectAll = () => {
    if (!order) return;

    if (allSelected) {
      setSelected({});
    } else {
      const next: Record<string, any> = {};
      filterOrder?.forEach(p => {
        next[p.productId?._id] = {
          sendToPurchaseQty: 0,
          remarks: ""
        };
      });
      setSelected(next);
    }
  };

  const hasSelection = Object.values(selected).some(Boolean);

  // ---------------- Submit ----------------
  const handleSubmit = () => {
    const payload = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([productId, v]) => ({
        productId,
        sendToPurchaseQty: Number(v.sendToPurchaseQty),
        remarks: v.remarks
      }));

    dispatch(
      updateVendorOrder({
        vendorOrderId: id!,
        products: payload
      })
    );

    // ✅ Redirect to purchase page
    navigate("/admin/purchase");
  };

  if (!order) return null;

  // ---------------- UI ----------------
  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "none",
            fontWeight: 500
          }}
        >
          Back
        </Button>

        <h2 className="text-xl font-semibold">
          Order #{order.orderNumber}
        </h2>
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Products</h3>

        <Button
          variant="contained"
          disabled={!hasSelection}
          onClick={handleSubmit}
          sx={{
            textTransform: "none",
            px: 3,
            py: 1,
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: "0px 4px 10px rgba(0,0,0,0.15)"
          }}
        >
          Send to Purchase
        </Button>
      </div>

      {/* Table Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}
      >
        <TableContainer component={Paper}>
          <Table>
            {/* ---------- TABLE HEAD ---------- */}
            <TableHead sx={{ backgroundColor: "#f5f7fa" }}>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={
                      !allSelected && Object.keys(selected).length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>

                {[
                  "Product",
                  "Category",
                  "Vendor",
                  "Company",
                  "Order Qty",
                  "Send Qty",
                  "Remarks"
                ].map(header => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#344054"
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* ---------- TABLE BODY ---------- */}
            <TableBody>
              {filterOrder?.map(row => {
                const product = row?.productId;
                return (
                  <TableRow
                    key={row?._id}
                    hover
                    sx={{
                      "& td": { py: 1.5 }
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={!!selected[product?._id]}
                        onChange={() => toggleSelect(product?._id)}
                      />
                    </TableCell>

                    <TableCell>
                      {product ? `${product?.productName} (${product?.packSize}) ` : "-"}
                    </TableCell>

                    <TableCell>
                      {product?.categoryId?.categoryName || "-"}
                    </TableCell>

                    <TableCell>
                      {product?.vendorsId?.vendor_name || "-"}
                    </TableCell>

                    <TableCell>
                      {product?.companyId?.brandName || "-"}
                    </TableCell>

                    <TableCell>{row?.orderQty}</TableCell>

                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        placeholder="Qty"
                        disabled={!selected[product?._id]}
                        sx={{ width: 90 }}
                        value={selected[product?._id]?.sendToPurchaseQty || ""}
                        onChange={e =>
                          setSelected(prev => ({
                            ...prev,
                            [product?._id]: {
                              ...prev[product?._id],
                              sendToPurchaseQty: e.target.value
                            }
                          }))
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Remarks"
                        disabled={!selected[product?._id]}
                        sx={{ minWidth: 160 }}
                        value={selected[product?._id]?.remarks || ""}
                        onChange={e =>
                          setSelected(prev => ({
                            ...prev,
                            [product?._id]: {
                              ...prev[product?._id],
                              remarks: e.target.value
                            }
                          }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </AdminLayout>
  );
}

export default VendorOrderDetails;
