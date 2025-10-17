import React from "react";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { LocalizationProvider } from "@mui/x-date-pickers-pro/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { Dayjs } from "dayjs";

export type DateRangeValue = [Dayjs | null, Dayjs | null];

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (newValue: DateRangeValue) => void;
  fullWidth?: boolean;
  size?: "small" | "medium";
  className?: string;
}

/**
 * 🔁 Reusable Date Range Picker Component
 * - Supports fullWidth, custom size, and external state management
 * - Uses MUI Pro DateRangePicker
 */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  fullWidth = true,
  size = "small",
  className = "",
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DateRangePicker"]} sx={{ pt: 0 }}>
        <DateRangePicker
          localeText={{ start: "Start Date", end: "End Date" }}
          slotProps={{
            textField: {
              size,
              fullWidth,
            },
          }}
          value={value}
          onChange={onChange}
          className={className}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default DateRangeFilter;
