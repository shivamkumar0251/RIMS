// import React, { useState, useEffect } from "react";
// import {
//     Box,
//     Button,
//     Popover,
//     List,
//     ListItemButton,
//     ListItemText,
//     Typography,
//     Stack,
//     Divider
// } from "@mui/material";
// import {
//     LocalizationProvider,
// } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
// import { FiCalendar, FiChevronDown } from "react-icons/fi";
// import dayjs, { Dayjs } from "dayjs";
// import quarterOfYear from "dayjs/plugin/quarterOfYear";

// dayjs.extend(quarterOfYear);

// interface AdvancedDateRangePickerProps {
//     fromDate: string;
//     toDate: string;
//     onRangeChange: (start: string, end: string, label: string) => void;
//     initialLabel?: string;
// }

// const AdvancedDateRangePicker: React.FC<AdvancedDateRangePickerProps> = ({
//     fromDate,
//     toDate,
//     onRangeChange,
//     initialLabel = "This Month"
// }) => {
//     const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
//     const [selectedLabel, setSelectedLabel] = useState(initialLabel);

//     // Split range into start and end for individual pickers
//     const [startDate, setStartDate] = useState<Dayjs | null>(fromDate ? dayjs(fromDate) : dayjs().startOf('month'));
//     const [endDate, setEndDate] = useState<Dayjs | null>(toDate ? dayjs(toDate) : dayjs());

//     // Sync state with props when they change externally
//     useEffect(() => {
//         setStartDate(fromDate ? dayjs(fromDate) : dayjs().startOf('month'));
//         setEndDate(toDate ? dayjs(toDate) : dayjs());
//     }, [fromDate, toDate]);

//     const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//         setAnchorEl(event.currentTarget);
//     };

//     const handleClose = () => {
//         setAnchorEl(null);
//     };

//     const open = Boolean(anchorEl);
//     const id = open ? "date-range-popover" : undefined;

//     const presets = [
//         { label: "Today", getValue: () => [dayjs().startOf("day"), dayjs().endOf("day")] },
//         { label: "This Week", getValue: () => [dayjs().startOf("week"), dayjs().endOf("week")] },
//         { label: "This Month", getValue: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
//         { label: "This Quarter", getValue: () => [dayjs().startOf("quarter"), dayjs().endOf("quarter")] },
//         { label: "This Year", getValue: () => [dayjs().startOf("year"), dayjs().endOf("year")] },
//         { label: "Yesterday", getValue: () => [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")] },
//         { label: "Previous Week", getValue: () => [dayjs().subtract(1, "week").startOf("week"), dayjs().subtract(1, "week").endOf("week")] },
//         { label: "Previous Month", getValue: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
//         { label: "Previous Quarter", getValue: () => [dayjs().subtract(3, "month").startOf("quarter"), dayjs().subtract(3, "month").endOf("quarter")] },
//         { label: "Previous Year", getValue: () => [dayjs().subtract(1, "year").startOf("year"), dayjs().subtract(1, "year").endOf("year")] },
//         { label: "Custom", getValue: () => [startDate, endDate] },
//     ];

//     const handlePresetClick = (label: string, getValue: () => any) => {
//         const range = getValue();
//         setStartDate(range[0]);
//         setEndDate(range[1]);
//         setSelectedLabel(label);

//         if (label !== "Custom") {
//             onRangeChange(range[0].format("YYYY-MM-DD"), range[1].format("YYYY-MM-DD"), label);
//             handleClose();
//         }
//     };

//     const handleDone = () => {
//         if (startDate && endDate) {
//             onRangeChange(
//                 startDate.format("YYYY-MM-DD"),
//                 endDate.format("YYYY-MM-DD"),
//                 selectedLabel === "Custom" ? "Custom Range" : selectedLabel
//             );
//         }
//         handleClose();
//     };

//     return (
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <Button
//                 aria-describedby={id}
//                 variant="outlined"
//                 onClick={handleClick}
//                 startIcon={<FiCalendar />}
//                 endIcon={<FiChevronDown />}
//                 className="border-slate-200 text-slate-700 bg-white normal-case font-medium hover:bg-slate-50 px-4"
//                 sx={{ minWidth: 200, justifyContent: "space-between", borderRadius: "10px", height: "40px" }}
//             >
//                 <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: "slate.500", mr: 1 }}>
//                     Date Range :
//                 </Typography>
//                 <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
//                     {selectedLabel}
//                 </Typography>
//             </Button>

//             <Popover
//                 id={id}
//                 open={open}
//                 anchorEl={anchorEl}
//                 onClose={handleClose}
//                 anchorOrigin={{
//                     vertical: "bottom",
//                     horizontal: "left",
//                 }}
//                 transformOrigin={{
//                     vertical: "top",
//                     horizontal: "left",
//                 }}
//                 PaperProps={{
//                     sx: { mt: 1, borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", overflow: "hidden" }
//                 }}
//             >
//                 <Box className="flex flex-col md:flex-row" sx={{ height: { xs: 'auto', md: 500 }, maxHeight: { xs: '85vh', md: 'auto' }, overflow: 'auto' }}>
//                     {/* Sidebar */}
//                     <Box sx={{ 
//                         width: { xs: '100%', md: 180 }, 
//                         borderRight: { xs: 'none', md: "1px solid" }, 
//                         borderBottom: { xs: "1px solid", md: 'none' },
//                         borderColor: "divider", 
//                         bgcolor: "slate.50",
//                         p: 1
//                     }}>
//                         <List component="nav" dense sx={{ display: { xs: 'flex', md: 'block' }, overflowX: 'auto', p: 0 }}>
//                             {presets.map((preset) => (
//                                 <ListItemButton
//                                     key={preset.label}
//                                     selected={selectedLabel === preset.label}
//                                     onClick={() => handlePresetClick(preset.label, preset.getValue)}
//                                     sx={{
//                                         py: 1,
//                                         px: 2,
//                                         whiteSpace: 'nowrap',
//                                         borderRadius: '8px',
//                                         mb: { xs: 0, md: 0.5 },
//                                         mr: { xs: 1, md: 0 },
//                                         "&.Mui-selected": {
//                                             bgcolor: "indigo.50",
//                                             color: "indigo.700",
//                                         }
//                                     }}
//                                 >
//                                     <ListItemText
//                                         primary={preset.label}
//                                         primaryTypographyProps={{
//                                             variant: "body2",
//                                             fontWeight: selectedLabel === preset.label ? 600 : 500
//                                         }}
//                                     />
//                                 </ListItemButton>
//                             ))}
//                         </List>
//                     </Box>

//                     {/* Calendar Area */}
//                     <Box className="flex flex-col flex-1">
//                         <Box className="p-4 flex gap-4 border-b border-divider flex-wrap bg-white">
//                             <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between' }}>
//                                 <Box className="flex-1">
//                                     <Typography variant="caption" className="text-slate-500 font-bold uppercase mb-1 block">Start Date</Typography>
//                                     <Box className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium text-center">
//                                         {startDate?.format("DD MMM YYYY") || "Select"}
//                                     </Box>
//                                 </Box>
//                                 <Box className="flex-1">
//                                     <Typography variant="caption" className="text-slate-500 font-bold uppercase mb-1 block">End Date</Typography>
//                                     <Box className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium text-center">
//                                         {endDate?.format("DD MMM YYYY") || "Select"}
//                                     </Box>
//                                 </Box>
//                             </Stack>
//                         </Box>

//                         <Box className="flex flex-col md:flex-row p-2 gap-4 justify-center items-start bg-white">
//                             <Box>
//                                 <Typography variant="caption" className="pl-4 text-slate-400 font-semibold">Start</Typography>
//                                 <DateCalendar
//                                     value={startDate}
//                                     onChange={(newValue) => {
//                                         setStartDate(newValue);
//                                         setSelectedLabel("Custom");
//                                         // If start date is after end date, update end date
//                                         if (endDate && newValue && newValue.isAfter(endDate)) {
//                                             setEndDate(newValue);
//                                         }
//                                     }}
//                                     views={['year', 'month', 'day']}
//                                     showDaysOutsideCurrentMonth
//                                     fixedWeekNumber={6}
//                                 />
//                             </Box>

//                             <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

//                             <Box>
//                                 <Typography variant="caption" className="pl-4 text-slate-400 font-semibold">End</Typography>
//                                 <DateCalendar
//                                     value={endDate}
//                                     onChange={(newValue) => {
//                                         setEndDate(newValue);
//                                         setSelectedLabel("Custom");
//                                         // If end date is before start date, update start date
//                                         if (startDate && newValue && newValue.isBefore(startDate)) {
//                                             setStartDate(newValue);
//                                         }
//                                     }}
//                                     views={['year', 'month', 'day']}
//                                     showDaysOutsideCurrentMonth
//                                     fixedWeekNumber={6}
//                                     minDate={startDate || undefined}
//                                 />
//                             </Box>
//                         </Box>

//                         <Box className="mt-auto p-4 bg-slate-50 flex justify-end gap-3 border-t border-divider">
//                             <Button size="small" variant="text" onClick={handleClose} className="text-slate-500 font-semibold">
//                                 Cancel
//                             </Button>
//                             <Button size="small" variant="contained" onClick={handleDone} className="bg-indigo-600 hover:bg-indigo-700 shadow-none px-6">
//                                 Done
//                             </Button>
//                         </Box>
//                     </Box>
//                 </Box>
//             </Popover>
//         </LocalizationProvider>
//     );
// };

// export default AdvancedDateRangePicker;


import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Popover,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    Stack
} from "@mui/material";
import {
    LocalizationProvider,
} from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { StaticDateRangePicker } from "@mui/x-date-pickers-pro/StaticDateRangePicker";
import type { DateRange } from "@mui/x-date-pickers-pro";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import dayjs, { Dayjs } from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);
interface AdvancedDateRangePickerProps {
    fromDate: string;
    toDate: string;
    onRangeChange: (start: string, end: string, label: string) => void;
    initialLabel?: string;
}
const AdvancedDateRangePicker: React.FC<AdvancedDateRangePickerProps> = ({
    fromDate,
    toDate,
    onRangeChange,
    initialLabel = "This Month"
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedLabel, setSelectedLabel] = useState(initialLabel);
    const [tempRange, setTempRange] = useState<DateRange<Dayjs>>([
        fromDate ? dayjs(fromDate) : dayjs().startOf('month'),
        toDate ? dayjs(toDate) : dayjs(),
    ]);

    // Sync tempRange with props when they change externally (e.g. on Reset)
    useEffect(() => {
        setTempRange([
            fromDate ? dayjs(fromDate) : dayjs().startOf('month'),
            toDate ? dayjs(toDate) : dayjs(),
        ]);
    }, [fromDate, toDate]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? "date-range-popover" : undefined;
    const presets = [
        { label: "Today", getValue: () => [dayjs().startOf("day"), dayjs().endOf("day")] },
        { label: "This Week", getValue: () => [dayjs().startOf("week"), dayjs().endOf("week")] },
        { label: "This Month", getValue: () => [dayjs().startOf("month"), dayjs().endOf("month")] },
        { label: "This Quarter", getValue: () => [dayjs().startOf("quarter"), dayjs().endOf("quarter")] },
        { label: "This Year", getValue: () => [dayjs().startOf("year"), dayjs().endOf("year")] },
        { label: "Yesterday", getValue: () => [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")] },
        { label: "Previous Week", getValue: () => [dayjs().subtract(1, "week").startOf("week"), dayjs().subtract(1, "week").endOf("week")] },
        { label: "Previous Month", getValue: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
        { label: "Previous Quarter", getValue: () => [dayjs().subtract(3, "month").startOf("quarter"), dayjs().subtract(3, "month").endOf("quarter")] },
        { label: "Previous Year", getValue: () => [dayjs().subtract(1, "year").startOf("year"), dayjs().subtract(1, "year").endOf("year")] },
        { label: "Custom", getValue: () => [dayjs(fromDate), dayjs(toDate)] },
    ];

    const handlePresetClick = (label: string, getValue: () => any) => {
        const range = getValue();
        setTempRange(range);
        setSelectedLabel(label);
        if (label !== "Custom") {
            onRangeChange(range[0].format("YYYY-MM-DD"), range[1].format("YYYY-MM-DD"), label);
            handleClose();
        }
    };

    const handleDone = () => {
        if (tempRange[0] && tempRange[1]) {
            onRangeChange(
                tempRange[0].format("YYYY-MM-DD"),
                tempRange[1].format("YYYY-MM-DD"),
                selectedLabel === "Custom" ? "Custom Range" : selectedLabel
            );
        }
        handleClose();
    };
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Button
                aria-describedby={id}
                variant="outlined"
                onClick={handleClick}
                startIcon={<FiCalendar />}
                endIcon={<FiChevronDown />}
                className="border-slate-200 text-slate-700 bg-white normal-case font-medium hover:bg-slate-50 px-4 py-2"
                sx={{ minWidth: 200, justifyContent: "space-between", borderRadius: "8px" }}
            >
                <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: "slate.500", mr: 1 }}>
                    Date Range :
                </Typography>
                <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                    {selectedLabel}
                </Typography>
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                PaperProps={{
                    sx: { mt: 1, borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", overflow: "hidden" }
                }}
            >
                <Box className="flex" sx={{ height: 450 }}>
                    {/* Sidebar */}
                    <Box sx={{ width: 180, borderRight: "1px solid", borderColor: "divider", bgcolor: "slate.50" }}>
                        <List component="nav" dense>
                            {presets.map((preset) => (
                                <ListItemButton
                                    key={preset.label}
                                    selected={selectedLabel === preset.label}
                                    onClick={() => handlePresetClick(preset.label, preset.getValue)}
                                    sx={{
                                        py: 1,
                                        "&.Mui-selected": {
                                            bgcolor: "indigo.50",
                                            color: "indigo.700",
                                            "&::before": {
                                                content: '""',
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: 3,
                                                bgcolor: "indigo.600"
                                            }
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={preset.label}
                                        primaryTypographyProps={{
                                            variant: "body2",
                                            fontWeight: selectedLabel === preset.label ? 600 : 500
                                        }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>

                    {/* Calendar Area */}
                    <Box className="flex flex-col">
                        <Box className="p-4 flex gap-4 border-b border-divider">
                            <Stack direction="row" spacing={2}>
                                <Box>
                                    <Typography variant="caption" className="text-slate-500 font-bold uppercase mb-1 block">Start Date</Typography>
                                    <Box className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium">
                                        {tempRange[0]?.format("DD MMM YYYY") || "Select"}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" className="text-slate-500 font-bold uppercase mb-1 block">End Date</Typography>
                                    <Box className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium">
                                        {tempRange[1]?.format("DD MMM YYYY") || "Select"}
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>

                        <StaticDateRangePicker
                            displayStaticWrapperAs="desktop"
                            value={tempRange}
                            onChange={(newRange) => {
                                setTempRange(newRange);
                                setSelectedLabel("Custom");
                            }}
                            sx={{
                                "& .MuiPickersLayout-root": { minWidth: "auto" },
                                "& .MuiDateRangeCalendar-root": { gap: 2 },
                                // Hiding the MUI X License Watermark Aggressively
                                "& .MuiXLicenseInfo-root, & .mui-x-license-root, & [class*='MuiXLicenseInfo-root'], & [class*='mui-x-license-root']": {
                                    display: "none !important",
                                    visibility: "hidden !important",
                                    opacity: "0 !important",
                                    height: "0 !important",
                                    pointerEvents: "none !important",
                                },
                            }}
                        />
                        <Box className="mt-auto p-4 bg-slate-50 flex justify-end gap-3 border-t border-divider">
                            <Button size="small" variant="text" onClick={handleClose} className="text-slate-500 font-semibold">
                                Cancel
                            </Button>
                            <Button size="small" variant="contained" onClick={handleDone} className="bg-indigo-600 hover:bg-indigo-700 shadow-none px-6">
                                Done
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Popover>
        </LocalizationProvider>
    );
};
export default AdvancedDateRangePicker;
 