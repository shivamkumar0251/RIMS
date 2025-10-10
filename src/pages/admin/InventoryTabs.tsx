import React, { useMemo, useState, type FormEvent } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  initialCrockeryData,
  initialFixedAssetsData,
  type CrockeryItem,
  type FixedAsset,
} from "./../../data/dummyData";

// MUI Components
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import InventoryIcon from "@mui/icons-material/Inventory";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

type AddItemDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
  formType: "fixed" | "removable";
  categories: string[];
};

const AddItemDrawer: React.FC<AddItemDrawerProps> = ({
  isOpen,
  onClose,
  onAddItem,
  formType,
  categories,
}) => {
  const [formState, setFormState] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleAutocompleteChange = (fieldName: string, value: string | null) => {
    setFormState({ ...formState, [fieldName]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddItem({ id: Date.now(), ...formState });
    setFormState({});
    e.currentTarget.reset();
  };

  const fixedAssetFields = [
    { name: "itemName", label: "Product Name", type: "text" },
    { name: "category", label: "Category", type: "autocomplete" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "price", label: "Per Unit (₹)", type: "number" },
    { name: "taxableValue", label: "Taxable Value", type: "number" },
    { name: "gst", label: "GST (%)", type: "number" },
    { name: "total", label: "Total", type: "number" },
  ];

  const removableItemFields = [
    { name: "productName", label: "Product Name", type: "text" },
    { name: "category", label: "Category", type: "autocomplete" },
    { name: "inUse", label: "In Use", type: "number" },
    { name: "inStore", label: "In Store", type: "number" },
    { name: "price", label: "Per Unit (₹)", type: "number" },
    { name: "taxableValue", label: "Taxable Value", type: "number" },
    { name: "gst", label: "GST (%)", type: "number" },
    { name: "total", label: "Total", type: "number" },
  ];

  const fields = formType === "fixed" ? fixedAssetFields : removableItemFields;
  const title =
    formType === "fixed" ? "Add New Fixed Asset" : "Add New Removable Item";

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          p: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            borderBottom: 1,
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1, gap: 2.5 }}
        >
          {fields.map((field) => {
            if (field.type === "autocomplete") {
              return (
                <Autocomplete
                  key={field.name}
                  freeSolo
                  options={categories}
                  onChange={(event, value) =>
                    handleAutocompleteChange(field.name, value)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name={field.name}
                      label={field.label}
                      variant="outlined"
                      required
                    />
                  )}
                />
              );
            }
            return (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                variant="outlined"
                fullWidth
                required
                onChange={handleInputChange}
              />
            );
          })}
          <Box sx={{ mt: "auto" }}>
            <Button type="submit" variant="contained" size="large" fullWidth>
              Add Item
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

const InventoryDropdown: React.FC = () => {
  const [assetType, setAssetType] = useState<"fixed" | "removable">("fixed");
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(
    initialFixedAssetsData
  );
  const [crockeryItems, setCrockeryItems] = useState<CrockeryItem[]>(
    initialCrockeryData
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data, categories } = useMemo(() => {
    if (assetType === "fixed") {
      return {
        data: fixedAssets,
        categories: ["All", ...new Set(fixedAssets.map((item) => item.category))],
      };
    } else {
      return {
        data: crockeryItems,
        categories: ["All", ...new Set(crockeryItems.map((item) => item.category))],
      };
    }
  }, [assetType, fixedAssets, crockeryItems]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const name = "itemName" in item ? item.itemName : item.productName;
      const matchesSearch = name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, selectedCategory]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleAddItem = (newItem: any) => {
    if (assetType === "fixed") {
      setFixedAssets((prev) => [...prev, newItem]);
    } else {
      setCrockeryItems((prev) => [...prev, newItem]);
    }
    setDrawerOpen(false);
  };

  return (
    <AdminLayout>
      <AddItemDrawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAddItem={handleAddItem}
        formType={assetType}
        categories={categories.filter((cat) => cat !== "All")}
      />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* Top Filters and Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                placeholder="Search by Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Asset Type Dropdown */}
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Assets Type</InputLabel>
                <Select
                  value={assetType}
                  label="Assets Type"
                  onChange={(e) =>
                    setAssetType(e.target.value as "fixed" | "removable")
                  }
                >
                  <MenuItem value="fixed">Fixed Assets</MenuItem>
                  <MenuItem value="removable">Removable Items</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Export Buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export PDF">
                <IconButton sx={{ color: "#f44336" }}>
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Excel">
                <IconButton sx={{ color: "#4caf50" }}>
                  <AssessmentIcon />
                </IconButton>
              </Tooltip>
              <Button variant="contained" startIcon={<FileUploadIcon />}>
                Import
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDrawerOpen(true)}
              >
                Add New
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  {assetType === "fixed" ? (
                    <>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Per Unit Rate</TableCell>
                      <TableCell align="right">Taxable Value</TableCell>
                      <TableCell align="right">GST (%)</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell align="center">In Use</TableCell>
                      <TableCell align="center">In Store</TableCell>
                      <TableCell align="right">Per Unit Rate</TableCell>
                      <TableCell align="right">Taxable Value</TableCell>
                      <TableCell align="right">GST (%)</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <InventoryIcon color="action" />
                        <Typography variant="body2">
                          {"itemName" in item ? item.itemName : item.productName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>

                    {assetType === "fixed" && (item as FixedAsset) && (
                      <>
                        <TableCell align="center">
                          {(item as FixedAsset).quantity}
                        </TableCell>
                        <TableCell align="right">
                          {(item as FixedAsset).price}
                        </TableCell>
                        <TableCell align="right">
                          {(item as FixedAsset).taxableValue || "N.A"}
                        </TableCell>
                        <TableCell align="right">
                          {(item as FixedAsset).gst || "N.A"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          {(item as FixedAsset).total || "N.A"}
                        </TableCell>
                      </>
                    )}

                    {assetType === "removable" && (item as CrockeryItem) && (
                      <>
                        <TableCell align="center">
                          {(item as CrockeryItem).inUse || "N.A"}
                        </TableCell>
                        <TableCell align="center">
                          {(item as CrockeryItem).inStore ||
                            (item as CrockeryItem).closingStock}
                        </TableCell>
                        <TableCell align="right">
                          {(item as CrockeryItem).price}
                        </TableCell>
                        <TableCell align="right">
                          {(item as CrockeryItem).taxableValue || "N.A"}
                        </TableCell>
                        <TableCell align="right">
                          {(item as CrockeryItem).gst || "N.A"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          {(item as CrockeryItem).total || "N.A"}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Rows per page:</Typography>
              <Select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                size="small"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
              </Select>
            </Box>
            <Pagination
              count={Math.ceil(filteredData.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Paper>
      </Container>
    </AdminLayout>
  );
};

export default InventoryDropdown;
