import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FiSearch, FiRefreshCw, FiSend } from "react-icons/fi";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useAppDispatch, useAppSelector } from "../../redux/store/storeHooks";
import {
  getStoreStocks,
  selectStoreStockState
} from "../../redux/slices/storeStockSlice";
import {
  addStoreStock,
} from "../../redux/slices/storeStockSlice";
import type { StoreStockPostData } from "../../redux/slices/storeStockSlice";

type IssuedToType = "Main Kitchen" | "Tandoor Section" | "Curry Section" | "Pantry" | "Bar" | "Bakery" | "Cold Kitchen" | "";

interface IssueItem {
  productId: string;
  productName: string;
  availableQty: number;
  issueQty: number;
  unit: string;
  issuedTo: IssuedToType;
  remarks: string;
}

const ISSUED_TO_OPTIONS: IssuedToType[] = [
  "Main Kitchen",
  "Tandoor Section",
  "Curry Section",
  "Pantry",
  "Bar",
  "Bakery",
  "Cold Kitchen"
];

const KitchenIssue: React.FC = () => {
  const dispatch = useAppDispatch();
  const { storeStocks, loading, allStoreStocksData } = useAppSelector(selectStoreStockState);

  // Filters
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  // Issue items state
  const [issueItems, setIssueItems] = useState<Record<string, IssueItem>>({});

  // Load Store Stocks
  useEffect(() => {
    dispatch(
      getStoreStocks({
        page: page + 1,
        limit,
        search,
      })
    );
  }, [dispatch, page, limit, search]);

  // Initialize issue items when store stocks load
  useEffect(() => {
    const newItems: Record<string, IssueItem> = {};
    // Filter out Packaging Items from Issue list
    const issueableStocks = storeStocks.filter(s => s.productId?.productType !== "Packaging Item");

    issueableStocks.forEach((stock) => {
      const pid = stock.productId?._id;
      if (pid && !issueItems[pid]) {
        newItems[pid] = {
          productId: pid,
          productName: stock.productId?.productName || "",
          availableQty: stock.closingStock,
          issueQty: 0,
          unit: stock.productId?.unit || "",
          issuedTo: "",
          remarks: "",
        };
      } else if (pid && issueItems[pid]) {
        // Update available qty if stock changed
        newItems[pid] = {
          ...issueItems[pid],
          availableQty: stock.closingStock,
        };
      }
    });
    if (Object.keys(newItems).length > 0) {
      setIssueItems((prev) => ({ ...prev, ...newItems }));
    }
  }, [storeStocks]);

  const handleIssueQtyChange = (productId: string, value: number) => {
    setIssueItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        issueQty: Math.max(0, Math.min(value, prev[productId]?.availableQty || 0)),
      },
    }));
  };

  const handleIssuedToChange = (productId: string, value: IssuedToType) => {
    setIssueItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        issuedTo: value,
      },
    }));
  };

  const handleRemarksChange = (productId: string, value: string) => {
    setIssueItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        remarks: value,
      },
    }));
  };

  const handleIssue = async () => {
    const itemsToIssue = Object.values(issueItems).filter(
      (item) => item.issueQty > 0 && item.issuedTo.trim() !== ""
    );

    if (itemsToIssue.length === 0) {
      alert("Please select items with issue quantity and issued to information");
      return;
    }

    // Validate quantities
    for (const item of itemsToIssue) {
      if (item.issueQty > item.availableQty) {
        alert(`Issue quantity for ${item.productName} exceeds available quantity`);
        return;
      }
    }

    // Prepare payload for store stock (transfer to kitchen)
    const storeStockPayload: StoreStockPostData[] = itemsToIssue.map((item) => ({
      productId: item.productId,
      qty: item.issueQty,
    }));

    try {
      // Deduct from store stock (transfer to kitchen)
      // The backend 'addStoreStock' controller handles both deducting from Store 
      // and adding to Kitchen stock automatically.
      await dispatch(addStoreStock(storeStockPayload)).unwrap();

      // Log transaction
      const transactionLog = {
        type: "STORE_TO_KITCHEN",
        items: itemsToIssue.map(item => ({
          productId: item.productId,
          productName: item.productName,
          qty: item.issueQty,
          issuedTo: item.issuedTo,
          remarks: item.remarks,
        })),
        timestamp: new Date().toISOString(),
      };
      console.log("Transaction logged:", transactionLog);
      // TODO: Add API call to log transaction if transaction log API exists

      alert(`Successfully issued ${itemsToIssue.length} item(s) to kitchen`);

      // Reset issue items
      setIssueItems({});

      // Refresh store stocks
      dispatch(getStoreStocks({ page: page + 1, limit, search }));
    } catch (error) {
      console.error("Error issuing items:", error);
      alert("Failed to issue items. Please try again.");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setPage(0);
  };

  const itemsToIssueCount = Object.values(issueItems).filter(
    (item) => item.issueQty > 0 && item.issuedTo.trim() !== ""
  ).length;

  return (
    <AdminLayout>
      <div>
        {/* Filter Bar */}
        <Box className="flex flex-wrap items-center gap-4 p-4 border border-gray-100 shadow-sm">
          <TextField
            placeholder="Search product..."
            size="small"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiSearch className="text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="w-full sm:w-64"
          />

          <Button
            size="small"
            variant="text"
            startIcon={<FiRefreshCw />}
            onClick={handleResetFilters}
            className="text-blue-600 normal-case"
          >
            Reset
          </Button>

          <Box className="ml-auto">
            <Button
              variant="contained"
              startIcon={<FiSend />}
              disabled={itemsToIssueCount === 0}
              onClick={handleIssue}
            // className="!bg-blue-600 hover:!bg-blue-700"
            >
              Issue to Kitchen ({itemsToIssueCount})
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <Paper className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-bold">Product</TableCell>
                  <TableCell className="font-bold text-center">Available Qty</TableCell>
                  <TableCell className="font-bold text-center">Issue Qty</TableCell>
                  <TableCell className="font-bold">Unit</TableCell>
                  <TableCell className="font-bold">Issued To</TableCell>
                  <TableCell className="font-bold">Remarks</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-10">
                      <CircularProgress size={30} />
                      <Typography className="mt-2 text-gray-500 text-sm">Loading stocks...</Typography>
                    </TableCell>
                  </TableRow>
                ) : storeStocks.filter(s => s.productId?.productType !== "Packaging Item").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-10 text-gray-500 text-sm">
                      No issueable products found (Packaging items are restricted).
                    </TableCell>
                  </TableRow>
                ) : (
                  storeStocks
                    .filter(s => s.productId?.productType !== "Packaging Item")
                    .map((stock) => {
                      const pid = stock.productId?._id;
                      const item = issueItems[pid] || {
                        productId: pid || "",
                        productName: stock.productId?.productName || "",
                        availableQty: stock.closingStock,
                        issueQty: 0,
                        unit: stock.productId?.unit || "",
                        issuedTo: "",
                        remarks: "",
                      };

                      return (
                        <TableRow key={stock._id} hover>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">
                              {stock.productId?.productName}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {stock.productId?.packSize}
                            </Typography>
                          </TableCell>
                          <TableCell className="text-center font-bold text-blue-600">
                            {item.availableQty}
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.issueQty || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleIssueQtyChange(pid || "", Number(e.target.value));
                              }}
                              inputProps={{
                                min: 0,
                                max: item.availableQty,
                              }}
                              sx={{
                                width: 100,
                                "& .MuiInputBase-input": {
                                  textAlign: "center",
                                  "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                    display: "none",
                                  },
                                  "&": {
                                    MozAppearance: "textfield",
                                  },
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-gray-600">{item.unit}</TableCell>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              fullWidth
                              value={item.issuedTo}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleIssuedToChange(pid || "", e.target.value as IssuedToType);
                              }}
                              sx={{ minWidth: 150 }}
                            >
                              <MenuItem value="">
                                <em>Select Section</em>
                              </MenuItem>
                              {ISSUED_TO_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Enter remarks..."
                              value={item.remarks}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                handleRemarksChange(pid || "", e.target.value);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={allStoreStocksData?.pagination.total || 0}
            page={page}
            onPageChange={(_: React.MouseEvent<HTMLButtonElement> | null, p: number) => setPage(p)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            className="border-t bg-gray-50"
          />
        </Paper>
      </div>
    </AdminLayout>
  );
};

export default KitchenIssue;

