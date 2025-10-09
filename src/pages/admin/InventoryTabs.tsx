import React, { useState, FormEvent, useMemo } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { initialFixedAssetsData, initialCrockeryData, type FixedAsset, type CrockeryItem } from './../../data/dummyData';

// MUI Component Imports
import {
    Box, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, IconButton, Typography, Drawer, TextField, Container, Menu, MenuItem, Tooltip,
    Checkbox, InputAdornment, FormControl, InputLabel, Select, Chip, Pagination, Autocomplete
} from '@mui/material';

// MUI Icon Imports
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';

// --- MUI DRAWER FOR ADDING ITEMS ---
type AddItemDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: any) => void;
    formType: 'fixed' | 'removable';
    categories: string[]; // <-- NEW PROP to receive the category list
};
const AddItemDrawer: React.FC<AddItemDrawerProps> = ({ isOpen, onClose, onAddItem, formType, categories }) => {
    // Using state to manage form data for better control with Autocomplete
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
        setFormState({}); // Reset form state
        e.currentTarget.reset();
    };

    const fixedAssetFields = [{ name: 'itemName', label: 'Item Name', type: 'text' }, { name: 'category', label: 'Category', type: 'autocomplete' }, { name: 'brand', label: 'Brand', type: 'text' }, { name: 'quantity', label: 'Quantity', type: 'number' }, { name: 'price', label: 'Per Unit (₹)', type: 'number' }, { name: 'purchaseDate', label: 'Purchase Date', type: 'date', InputLabelProps: { shrink: true } },];
    const removableItemFields = [{ name: 'productName', label: 'Product Name', type: 'text' }, { name: 'category', label: 'Category', type: 'autocomplete' }, { name: 'brand', label: 'Brand', type: 'text' }, { name: 'material', label: 'Material', type: 'text' }, { name: 'openingStock', label: 'Initial Quantity (In Store)', type: 'number' }, { name: 'price', label: 'Per Unit (₹)', type: 'number' },];

    const fields = formType === 'fixed' ? fixedAssetFields : removableItemFields;
    const title = formType === 'fixed' ? 'Add New Fixed Asset' : 'Add New Removable Item';

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose}>
            <Box sx={{ width: 400, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                    <Typography variant="h6">{title}</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 2.5 }}>
                    {fields.map(field => {
                        // If field type is autocomplete, render the new Autocomplete component
                        if (field.type === 'autocomplete') {
                            return (
                                <Autocomplete
                                    key={field.name}
                                    freeSolo
                                    options={categories}
                                    onChange={(event, value) => handleAutocompleteChange(field.name, value)}
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
                        // Otherwise, render a normal TextField
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
                                InputLabelProps={field.InputLabelProps}
                            />
                        );
                    })}
                    <Box sx={{ mt: 'auto' }}>
                        <Button type="submit" variant="contained" size="large" fullWidth>Add Item</Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
};


// --- MUI MAIN INVENTORY TABS COMPONENT ---
type TabValue = 'fixed' | 'removable';
const InventoryTabs: React.FC = () => {
    // The main component logic remains mostly the same...
    const [activeTab, setActiveTab] = useState<TabValue>('fixed');
    const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(initialFixedAssetsData);
    const [crockeryItems, setCrockeryItems] = useState<CrockeryItem[]>(initialCrockeryData);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => { setActiveTab(newValue); setSearchTerm(''); setSelectedCategory('All'); setSelectedBrand('All'); setSelectedRows([]); setPage(1); };

    const { data, categories, brands } = useMemo(() => {
        if (activeTab === 'fixed') { return { data: fixedAssets, categories: ['All', ...new Set(fixedAssets.map(item => item.category))], brands: ['All', ...new Set(fixedAssets.map(item => item.brand))], }; }
        else { return { data: crockeryItems, categories: ['All', ...new Set(crockeryItems.map(item => item.category))], brands: ['All', ...new Set(crockeryItems.map(item => item.brand))], }; }
    }, [activeTab, fixedAssets, crockeryItems]);

    const filteredData = useMemo(() => { return data.filter(item => { const name = 'itemName' in item ? item.itemName : item.productName; const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()); const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory; const matchesBrand = selectedBrand === 'All' || item.brand === selectedBrand; return matchesSearch && matchesCategory && matchesBrand; }); }, [data, searchTerm, selectedCategory, selectedBrand]);
    const paginatedData = useMemo(() => { const startIndex = (page - 1) * rowsPerPage; return filteredData.slice(startIndex, startIndex + rowsPerPage); }, [filteredData, page, rowsPerPage]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.checked) { setSelectedRows(paginatedData.map((item) => item.id)); } else { setSelectedRows([]); } };
    const handleSelectRow = (id: number) => { setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]); };

    const handleQuantityChange = (id: number, amount: number) => setFixedAssets(current => current.map(asset => asset.id === id ? { ...asset, quantity: Math.max(0, asset.quantity + amount) } : asset));
    const handleClosingStockChange = (id: number, amount: number) => setCrockeryItems(current => current.map(item => item.id === id ? { ...item, closingStock: Math.max(0, Math.min(item.openingStock, item.closingStock + amount)) } : item));
    const handleAddItem = (newItem: any) => { if (activeTab === 'fixed') { setFixedAssets(prev => [...prev, newItem]); } else { setCrockeryItems(prev => [...prev, { ...newItem, closingStock: newItem.openingStock }]); } setDrawerOpen(false); };

    return (
        <AdminLayout>
            {/* We now pass the list of categories to the Drawer */}
            <AddItemDrawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                onAddItem={handleAddItem}
                formType={activeTab}
                categories={categories.filter(cat => cat !== 'All')} // Pass categories, removing 'All'
            />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    {/* Header and Filters */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField placeholder="Search by Name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }} sx={{ minWidth: 300 }} />
                            <FormControl sx={{ minWidth: 150 }}><InputLabel>Category</InputLabel><Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>{categories.map(cat => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}</Select></FormControl>
                            <FormControl sx={{ minWidth: 150 }}><InputLabel>Brand</InputLabel><Select value={selectedBrand} label="Brand" onChange={(e) => setSelectedBrand(e.target.value)}>{brands.map(brand => (<MenuItem key={brand} value={brand}>{brand}</MenuItem>))}</Select></FormControl>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Refresh"><IconButton color="primary"><RefreshIcon /></IconButton></Tooltip>
                            <Tooltip title="Export PDF"><IconButton sx={{ color: '#f44336' }}><PictureAsPdfIcon /></IconButton></Tooltip>
                            <Tooltip title="Export Excel"><IconButton sx={{ color: '#4caf50' }}><AssessmentIcon /></IconButton></Tooltip>
                            <Button variant="contained" startIcon={<FileUploadIcon />}>Import</Button>
                        </Box>
                    </Box>

                    {/* Tabs and Add Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={activeTab} onChange={handleTabChange}><Tab label={`Fixed Assets (${fixedAssets.length})`} value="fixed" /><Tab label={`Removable Items (${crockeryItems.length})`} value="removable" /></Tabs>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDrawerOpen(true)}>Add New</Button>
                    </Box>

                    {/* Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox"><Checkbox indeterminate={selectedRows.length > 0 && selectedRows.length < paginatedData.length} checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length} onChange={handleSelectAll} /></TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    {activeTab === 'fixed' ? (<> <TableCell align="center">Quantity</TableCell><TableCell>Purchase Date</TableCell><TableCell align="right">Per Unit</TableCell><TableCell align="right">Total Value</TableCell> </>) : (<> <TableCell align="center">In Use</TableCell><TableCell align="center">In Store</TableCell><TableCell align="right">Per Unit</TableCell><TableCell align="right">Total Value</TableCell> </>)}
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedData.map((item) => {
                                    const isSelected = selectedRows.includes(item.id);
                                    return (
                                        <TableRow key={item.id} hover selected={isSelected}>
                                            <TableCell padding="checkbox"><Checkbox checked={isSelected} onChange={() => handleSelectRow(item.id)} /></TableCell>
                                            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><InventoryIcon color="action" /><Typography variant="body2">{'itemName' in item ? item.itemName : item.productName}</Typography></Box></TableCell>
                                            <TableCell><Chip label={item.category} size="small" color="primary" variant="outlined" /></TableCell>

                                            {activeTab === 'fixed' && (item as FixedAsset) && (<>
                                                <TableCell align="center"><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}><IconButton size="small" onClick={() => handleQuantityChange(item.id, -1)} disabled={(item as FixedAsset).quantity <= 0}><RemoveIcon fontSize="small" /></IconButton><Typography variant="body2" sx={{ fontWeight: 500 }}>{(item as FixedAsset).quantity}</Typography><IconButton size="small" onClick={() => handleQuantityChange(item.id, 1)}><AddIcon fontSize="small" /></IconButton></Box></TableCell>
                                                <TableCell>{(item as FixedAsset).purchaseDate}</TableCell>
                                                <TableCell align="right">{(item as FixedAsset).price.toLocaleString('en-IN')}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{((item as FixedAsset).quantity * (item as FixedAsset).price).toLocaleString('en-IN')}</TableCell>
                                            </>)}

                                            {activeTab === 'removable' && (item as CrockeryItem) && (<>
                                                <TableCell align="center" sx={{ fontWeight: 500 }}>{(item as CrockeryItem).openingStock - (item as CrockeryItem).closingStock}</TableCell>
                                                <TableCell align="center"><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}><IconButton size="small" onClick={() => handleClosingStockChange(item.id, -1)} disabled={(item as CrockeryItem).closingStock <= 0}><RemoveIcon fontSize="small" /></IconButton><Typography variant="body2" sx={{ fontWeight: 500, color: 'success.dark' }}>{(item as CrockeryItem).closingStock}</Typography><IconButton size="small" onClick={() => handleClosingStockChange(item.id, 1)} disabled={(item as CrockeryItem).closingStock >= (item as CrockeryItem).openingStock}><AddIcon fontSize="small" /></IconButton></Box></TableCell>
                                                <TableCell align="right">{(item as CrockeryItem).price.toLocaleString('en-IN')}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{((item as CrockeryItem).closingStock * (item as CrockeryItem).price).toLocaleString('en-IN')}</TableCell>
                                            </>)}

                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <Tooltip title="View"><IconButton size="small"><VisibilityIcon color="info" fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Edit"><IconButton size="small"><EditIcon color="warning" fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Delete"><IconButton size="small"><DeleteIcon color="error" fontSize="small" /></IconButton></Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">Rows per page:</Typography>
                            <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} size="small">
                                <MenuItem value={5}>5</MenuItem><MenuItem value={10}>10</MenuItem><MenuItem value={25}>25</MenuItem>
                            </Select>
                        </Box>
                        <Pagination count={Math.ceil(filteredData.length / rowsPerPage)} page={page} onChange={(e, value) => setPage(value)} color="primary" />
                    </Box>
                </Paper>
            </Container>
        </AdminLayout>
    );
};

export default InventoryTabs;