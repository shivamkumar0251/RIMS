import React, { useEffect, useMemo } from 'react';
import {
  FiBox,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrash2,
  FiArrowRight,
  FiPlusCircle,
  FiTruck,
  FiRepeat,
  FiActivity,
  FiShoppingBag,
  FiRefreshCw,
  FiClock,
  FiLayout
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../redux/store/storeHooks';
import { getStoreStocks, selectStoreStockState } from '../../redux/slices/storeStockSlice';
import { getKitchenStocks, selectKitchenStockState } from '../../redux/slices/kitchenStockSlice';
import { getConsumableStocks, selectConsumableStockState } from '../../redux/slices/consumableStockSlice';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Tooltip,
  Avatar
} from '@mui/material';
import dayjs from 'dayjs';

// --- Premium KPI Card ---
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, gradient, shadowColor }) => (
  <Paper
    elevation={0}
    className="p-6 rounded-[24px] relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 h-full w-full"
    sx={{
      background: '#fff',
      border: '1px solid #f1f5f9',
      boxShadow: `0 10px 15px -3px ${shadowColor}10, 0 4px 6px -4px ${shadowColor}10`,
      width: '100%',
      '&:hover': {
        boxShadow: `0 20px 25px -5px ${shadowColor}20, 0 8px 10px -6px ${shadowColor}20`,
      }
    }}
  >
    {/* Decorative Background Shape */}
    <Box
      className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150"
      style={{ background: gradient }}
    />

    <Box className="relative z-10 flex items-center gap-4">
      <Box
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"
        sx={{ background: gradient }}
      >
        {icon}
      </Box>
      <Box className="min-w-0">
        <Typography variant="caption" className="text-slate-400 font-bold tracking-widest uppercase block mb-0.5 truncate">
          {title}
        </Typography>
        <Typography variant="h4" className="font-extrabold text-slate-800 truncate">
          {value}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// --- Modern Action Tile ---
interface ActionTileProps {
  label: string;
  sub: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const ActionTile: React.FC<ActionTileProps> = ({ label, sub, icon, onClick, color }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    className="p-5 rounded-2xl border border-slate-100 flex flex-col gap-3 cursor-pointer transition-all duration-200 group h-full"
    sx={{
      '&:hover': {
        borderColor: color,
        backgroundColor: `${color}05`,
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 20px -10px ${color}30`
      }
    }}
  >
    <Box
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-white"
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="body1" className="font-bold text-slate-700 group-hover:text-slate-900 truncate">
        {label}
      </Typography>
      <Typography variant="caption" className="text-slate-400 font-medium truncate block">
        {sub}
      </Typography>
    </Box>
  </Paper>
);

function Admindashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { storeStocks } = useAppSelector(selectStoreStockState);
  const { kitchenStocks } = useAppSelector(selectKitchenStockState);
  const { consumableStocks } = useAppSelector(selectConsumableStockState);

  useEffect(() => {
    document.title = "RIMS Dashboard | Operations Summary";
    window.scrollTo(0, 0);

    dispatch(getStoreStocks({ page: 1, limit: 100 }));
    dispatch(getKitchenStocks({ page: 1, limit: 100 }));
    dispatch(getConsumableStocks({ page: 1, limit: 100 }));
  }, [dispatch]);

  const stats = useMemo(() => {
    const lowStockStore = storeStocks.filter(s => s.closingStock <= (s.productId?.stockAlert || 10));
    const lowStockKitchen = kitchenStocks.filter(k => k.closingStock <= (k.productId?.stockAlert || 5));

    const today = dayjs().startOf('day');
    const todayConsumables = consumableStocks.filter(c => dayjs(c.createdAt).isAfter(today));
    const todayConsumption = todayConsumables.reduce((acc, curr) => acc + (curr.transfersInUse || 0), 0);
    const todayWastage = todayConsumables.reduce((acc, curr) => acc + (curr.transfersToWastage || 0), 0);

    return {
      storeCount: storeStocks.length,
      kitchenCount: kitchenStocks.length,
      lowStockCount: lowStockStore.length + lowStockKitchen.length,
      todayConsumption,
      todayWastage,
      lowStockItems: [
        ...lowStockStore.map(i => ({ ...i, location: 'Store' })),
        ...lowStockKitchen.map(i => ({ ...i, location: 'Kitchen' }))
      ].sort((a, b) => a.closingStock - b.closingStock).slice(0, 5)
    };
  }, [storeStocks, kitchenStocks, consumableStocks]);

  const recentActivities = useMemo(() => {
    return [
      ...storeStocks.map(s => ({ type: 'STORE', item: s.productId?.productName, date: s.updatedAt, qty: s.closingStock, user: 'Admin' })),
      ...kitchenStocks.map(k => ({ type: 'ISSUE', item: k.productId?.productName, date: k.updatedAt, qty: k.rcvdKitchenQty, user: 'Manager' })),
      ...consumableStocks.map(c => ({ type: 'CONSUME', item: c.productId?.productName, date: c.createdAt, qty: c.transfersInUse, user: 'Chef' }))
    ].sort((a, b) => dayjs(b.date).diff(dayjs(a.date))).slice(0, 6);
  }, [storeStocks, kitchenStocks, consumableStocks]);

  return (
    <AdminLayout>
      <Box className="bg-[#fdfdfe] min-h-screen p-4 md:p-6" sx={{ width: '100%', overflowX: 'hidden' }}>

        {/* Header - Minimal & Elegant */}
        <Box className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
          <Box className="flex-1">
            <Box className="flex items-center gap-3 mb-2">
              <Avatar className="bg-indigo-600 w-10 h-10 shadow-lg shadow-indigo-200">
                <FiLayout size={20} />
              </Avatar>
              <Typography variant="h3" className="font-black text-slate-800 tracking-tight" sx={{ fontSize: { xs: '1.75rem', md: '3rem' } }}>
                Operations <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Center</span>
              </Typography>
            </Box>
            <Typography variant="body1" className="text-slate-400 font-medium max-w-2xl">
              Managing inventory flow, kitchen sections, and wastage monitoring in real-time.
            </Typography>
          </Box>
          <Box className="flex gap-3 shrink-0">
            <Button
              variant="outlined"
              className="rounded-2xl px-6 py-3 normal-case font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => dispatch(getStoreStocks({ page: 1, limit: 100 }))}
              startIcon={<FiRefreshCw />}
            >
              Sync Data
            </Button>
            <Button
              variant="contained"
              className="!bg-slate-900 rounded-2xl px-8 py-3 normal-case font-bold shadow-xl shadow-slate-200"
              startIcon={<FiPlusCircle />}
            >
              New Transaction
            </Button>
          </Box>
        </Box>

        <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10 w-full">
          {[
            { title: "Store Items", value: stats.storeCount, icon: <FiBox size={24} />, grad: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)", shadow: "#6366f1" },
            { title: "Kitchen Stock", value: stats.kitchenCount, icon: <FiShoppingBag size={24} />, grad: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", shadow: "#0ea5e9" },
            { title: "Low Alerts", value: stats.lowStockCount, icon: <FiAlertTriangle size={24} />, grad: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", shadow: "#f59e0b" },
            { title: "Usage (Qty)", value: stats.todayConsumption.toFixed(1), icon: <FiTrendingUp size={24} />, grad: "linear-gradient(135deg, #10b981 0%, #059669 100%)", shadow: "#10b981" },
            { title: "Wastage (Qty)", value: stats.todayWastage.toFixed(1), icon: <FiTrash2 size={24} />, grad: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", shadow: "#ef4444" }
          ].map((card, idx) => (
            <Box key={idx} sx={{ display: 'flex' }}>
              <KPICard
                title={card.title}
                value={card.value}
                icon={card.icon}
                gradient={card.grad}
                shadowColor={card.shadow}
              />
            </Box>
          ))}
        </Box>

        <Grid container spacing={4} sx={{ width: '100%', margin: 0 }}>
          {/* Main Dashboard Area */}
          <Grid item xs={12} lg={8} sx={{ paddingLeft: { xs: 0, md: '32px' }, paddingTop: '32px !important' }}>
            <Box className="flex flex-col gap-10 w-full">

              {/* Table Section - Clean & High-Contrast */}
              <Paper elevation={0} className="rounded-[32px] border border-slate-50 overflow-hidden shadow-xl shadow-slate-100/50 w-full">
                <Box className="px-8 py-6 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                  <Box className="flex items-center gap-3">
                    <Box className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                      <FiAlertTriangle size={20} />
                    </Box>
                    <Typography variant="h6" className="font-black text-slate-800">
                      Critical Stock Alerts
                    </Typography>
                  </Box>
                  <Button size="small" className="normal-case text-indigo-600 font-bold hover:bg-white px-4 py-2 rounded-xl" onClick={() => navigate('/storeStock')}>
                    Manage Inventory
                  </Button>
                </Box>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="large" sx={{ minWidth: 600 }}>
                    <TableHead className="bg-slate-50/50">
                      <TableRow>
                        <TableCell className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest pl-8">Product Name</TableCell>
                        <TableCell className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest">Location</TableCell>
                        <TableCell className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest text-center">In Stock</TableCell>
                        <TableCell className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest">Risk Level</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.lowStockItems.length > 0 ? (
                        stats.lowStockItems.map((item: any, idx) => (
                          <TableRow key={idx} hover className="transition-all duration-200">
                            <TableCell className="py-5 pl-8">
                              <Typography variant="body2" className="font-bold text-slate-700">
                                {item.productId?.productName}
                              </Typography>
                              <Typography variant="caption" className="text-slate-400 font-medium">
                                SKU: {item.productId?._id.slice(-6).toUpperCase()} • {item.productId?.packSize}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={item.location} className={`font-bold px-2 ${item.location === 'Store' ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-700'}`} />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" className="font-black text-red-500 bg-red-50 px-3 py-1 rounded-lg inline-block">
                                {item.closingStock} <span className="text-[10px] uppercase">{item.productId?.unit}</span>
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box className="flex items-center gap-2">
                                <Box
                                  className="w-2.5 h-2.5 rounded-full bg-red-500"
                                  sx={{
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                    '@keyframes pulse': {
                                      '0%, 100%': { opacity: 1 },
                                      '50%': { opacity: 0.5 },
                                    }
                                  }}
                                />
                                <Typography variant="caption" className="font-black text-slate-600 uppercase tracking-tighter">
                                  {item.closingStock === 0 ? 'Out of Stock' : 'Critical Low'}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-14 text-center text-slate-400 font-bold italic">
                            All inventories are balanced. No alerts at this time.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Insights Row */}
              <Grid container spacing={4} sx={{ width: '100%', margin: 0 }}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} className="p-8 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-100/50 bg-white h-full overflow-hidden relative w-full">
                    <Box className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50" />
                    <Typography variant="h6" className="font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                      <FiActivity className="text-indigo-500" /> Daily Statistics
                    </Typography>
                    <Box className="space-y-6 relative z-10">
                      {[
                        { label: 'Received', val: '12 Products', p: 70, col: '#6366f1' },
                        { label: 'Issued Qty', val: '45.0 Units', p: 45, col: '#0ea5e9' },
                        { label: 'Consumed Qty', val: `${stats.todayConsumption.toFixed(1)} Units`, p: 60, col: '#10b981' }
                      ].map((item, i) => (
                        <Box key={i}>
                          <Box className="flex justify-between items-end mb-2">
                            <Typography variant="caption" className="text-slate-400 font-black tracking-widest uppercase">{item.label}</Typography>
                            <Typography variant="body2" className="text-slate-800 font-black">{item.val}</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={item.p} className="h-2 rounded-full bg-slate-100" sx={{ '& .MuiLinearProgress-bar': { backgroundColor: item.col } }} />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} className="p-8 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-100/50 bg-white h-full text-center w-full">
                    <Typography variant="h6" className="font-black text-slate-800 mb-8 flex items-center justify-center gap-2">
                      Wastage Ratio
                    </Typography>
                    <Box className="inline-flex items-center justify-center relative">
                      <Box className="relative flex items-center justify-center w-40 h-40">
                        <Box className="text-center relative z-10">
                          <Typography variant="h3" className="font-black text-slate-800 leading-none">
                            {stats.todayConsumption > 0 ? ((stats.todayWastage / stats.todayConsumption) * 100).toFixed(0) : 0}%
                          </Typography>
                          <Typography variant="overline" className="text-slate-400 font-black">Wastage</Typography>
                        </Box>
                        <svg className="absolute w-full h-full -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                          <circle
                            cx="80" cy="80" r="70"
                            stroke="#ef4444" strokeWidth="14" fill="transparent"
                            strokeDasharray="440"
                            strokeDashoffset={440 - (440 * (stats.todayConsumption > 0 ? Math.min(stats.todayWastage / stats.todayConsumption, 1) : 0.05))}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                      </Box>
                    </Box>
                    <Box className="flex justify-center mt-6">
                      <Typography variant="body2" className="text-slate-500 font-medium italic bg-slate-50 px-4 py-2 rounded-xl">
                        {stats.todayWastage < stats.todayConsumption * 0.1 ? '✨ Optimization is within green zone.' : '⚠️ Performance review recommended.'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Chart Section - Visual & Spaced */}
              <Paper elevation={0} className="p-10 rounded-[40px] border border-slate-50 shadow-2xl shadow-slate-100/50 bg-white w-full">
                <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                  <Box>
                    <Typography variant="h6" className="font-black text-slate-800">
                      7-Day Flow Trends
                    </Typography>
                    <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-widest">
                      Week-over-week analysis
                    </Typography>
                  </Box>
                  <Box className="flex flex-wrap items-center gap-6">
                    <Box className="flex items-center gap-2"><Box className="w-3 h-3 bg-indigo-500 rounded-full" /><Typography variant="caption" className="font-black text-slate-600 uppercase tracking-tighter">Usage</Typography></Box>
                    <Box className="flex items-center gap-2"><Box className="w-3 h-3 bg-red-400 rounded-full" /><Typography variant="caption" className="font-black text-slate-600 uppercase tracking-tighter">Wastage</Typography></Box>
                  </Box>
                </Box>
                <Box className="flex items-end justify-between h-56 gap-4 px-2 overflow-x-auto pb-4">
                  {[45, 60, 30, 80, 55, 70, 40].map((h, i) => (
                    <Tooltip key={i} title={`D${i + 1} Usage: ${h}, Wastage: ${(h * 0.1).toFixed(1)}`}>
                      <Box className="flex-1 min-w-[30px] flex flex-col items-center group cursor-pointer h-full justify-end">
                        <Box className="w-full flex flex-col items-center gap-1.5 h-full justify-end">
                          <Box
                            className="w-full sm:w-1/2 bg-indigo-500 rounded-[8px] transition-all duration-300 group-hover:scale-110 shadow-lg shadow-indigo-100"
                            style={{ height: `${h * 1.8}px` }}
                          />
                          <Box
                            className="w-full sm:w-1/2 bg-red-400 rounded-[8px] opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-red-100"
                            style={{ height: `${h * 0.3}px` }}
                          />
                        </Box>
                        <Typography variant="caption" className="text-slate-300 font-black mt-4 group-hover:text-slate-900">D{i + 1}</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Sidebar Section */}
          <Grid item xs={12} lg={4} sx={{ paddingLeft: { xs: 0, md: '32px' }, paddingRight: { xs: 0, md: '16px' }, paddingTop: '32px !important' }}>
            <Box className="flex flex-col gap-10 h-full w-full">

              {/* Modern Action Grid */}
              <Box>
                <Typography variant="subtitle2" className="text-slate-400 font-extrabold tracking-widest uppercase mb-5 px-2">
                  Action Grid
                </Typography>
                <Box className="grid grid-cols-2 gap-4 w-full">
                  {[
                    { label: "Vendor", sub: "Place Order", icon: <FiPlusCircle size={20} />, path: '/admin/vendorsOrder', col: "#6366f1" },
                    { label: "Receive", sub: "GRN Goods", icon: <FiTruck size={20} />, path: '/admin/purchase', col: "#3b82f6" },
                    { label: "Issue", sub: "To Kitchen", icon: <FiArrowRight size={20} />, path: '/admin/kitchen-issue', col: "#0ea5e9" },
                    { label: "Log", sub: "Consumables", icon: <FiRepeat size={20} />, path: '/admin/kitchen-consumption', col: "#10b981" }
                  ].map((tile, i) => (
                    <ActionTile
                      key={i}
                      label={tile.label}
                      sub={tile.sub}
                      icon={tile.icon}
                      onClick={() => navigate(tile.path)}
                      color={tile.col}
                    />
                  ))}
                </Box>
              </Box>

              {/* Activity Feed - Professional Vertical Timeline */}
              <Paper elevation={0} className="p-8 rounded-[32px] border border-slate-50 shadow-xl shadow-slate-100/50 bg-white w-full">
                <Box className="flex items-center justify-between mb-8">
                  <Typography variant="h6" className="font-bold text-slate-800">
                    Activity Feed
                  </Typography>
                  <Box className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <FiClock size={16} />
                  </Box>
                </Box>
                <Box className="flex flex-col gap-8">
                  {recentActivities.map((act, idx) => (
                    <Box key={idx} className="flex gap-5 relative group">
                      {idx !== recentActivities.length - 1 && (
                        <Box className="absolute left-[14px] top-6 bottom-[-32px] w-[2px] bg-slate-50 group-hover:bg-indigo-50" />
                      )}
                      <Box
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 z-10 shadow-sm border-2 border-white
                          ${act.type === 'STORE' ? 'bg-indigo-500' : act.type === 'ISSUE' ? 'bg-sky-500' : 'bg-emerald-500'}`}
                      >
                        <Box className="w-1.5 h-1.5 bg-white rounded-full" />
                      </Box>
                      <Box className="flex-1 min-w-0">
                        <Box className="flex justify-between items-start mb-0.5">
                          <Typography variant="caption" className="font-black text-slate-400 uppercase tracking-tighter truncate">
                            {act.type} Movement
                          </Typography>
                          <Typography variant="caption" className="text-slate-300 font-bold shrink-0">
                            {dayjs(act.date).format('h:mm A')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" className="text-slate-700 font-bold leading-tight truncate">
                          {act.item}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 font-medium block truncate">
                          <span className="text-slate-600 font-bold">{act.qty} units</span> by {act.user}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Button
                  fullWidth
                  variant="text"
                  className="mt-8 normal-case text-indigo-500 font-bold hover:bg-indigo-50 rounded-xl py-3 group"
                >
                  Full Activity Log <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Paper>

            </Box>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

export default Admindashboard;
