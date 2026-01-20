import React from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { FiAlertTriangle } from 'react-icons/fi';

interface ExpiryBadgeProps {
    expiryDate?: string | Date | null;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({ expiryDate }) => {
    if (!expiryDate) {
        return (
            <Box className="flex flex-col">
                <Typography className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                    NONE / NO EXPIRY
                </Typography>
            </Box>
        );
    }

    const today = dayjs().startOf('day');
    const expiry = dayjs(expiryDate).startOf('day');
    const diffInDays = expiry.diff(today, 'day');
    const diffInMonths = expiry.diff(today, 'month');
    const diffInYears = expiry.diff(today, 'year');

    let status = {
        label: '',
        color: '',
        bg: '',
        border: '',
        animate: false,
        icon: false
    };

    if (diffInDays < 0) {
        status = {
            label: 'EXPIRED',
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            animate: false,
            icon: true
        };
    } else if (diffInDays <= 90) { // 0-3 months
        status = {
            label: 'Expiring Soon',
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            animate: true,
            icon: true
        };
    } else if (diffInMonths < 6) { // 3-6 months
        status = {
            label: 'Warning Soon',
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            animate: false,
            icon: false
        };
    } else if (diffInYears < 1) { // 6-12 months
        status = {
            label: 'Active',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            animate: false,
            icon: false
        };
    } else { // > 1 year
        status = {
            label: 'Fresh',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            animate: false,
            icon: false
        };
    }

    const getRelativeText = () => {
        if (diffInDays < 0) {
            const absoluteDays = Math.abs(diffInDays);
            return `Expired ${absoluteDays} day${absoluteDays === 1 ? '' : 's'} ago`;
        }
        return `Expires in ${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
    };

    return (
        <Box className="flex flex-col gap-0.5">
            <Typography variant="body2" className={`font-bold ${status.color}`}>
                {expiry.format("DD/MM/YYYY")}
            </Typography>
            <Box className="flex items-center gap-1">
                <Box className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border flex items-center gap-0.5 ${status.bg} ${status.color} ${status.border} ${status.animate ? 'animate-pulse' : ''}`}>
                    {status.icon && <FiAlertTriangle size={8} />}
                    {status.label}
                </Box>
                <Typography variant="caption" className="text-slate-400 text-[9px] font-medium whitespace-nowrap">
                    {getRelativeText()}
                </Typography>
            </Box>
        </Box>
    );
};
