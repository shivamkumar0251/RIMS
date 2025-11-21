import { Box, MenuItem, Pagination as MuiPagination, Select, Typography } from '@mui/material';

interface Props {
    page: number;
    onPageChange: (page: number) => void;
    rowsPerPage: number;
    onRowsPerPageChange: (value: number) => void;
    totalPages: number;
    totalCount?: number;
}

export default function Pagination({ page, onPageChange, rowsPerPage, onRowsPerPageChange, totalPages, totalCount }: Props) {
    return (
        <Box className="flex justify-between items-center px-4 py-3">
            <Box className="flex items-center gap-2">
                <Typography variant="body2" className="text-gray-600">
                    Per page
                </Typography>
                <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                </Select>
                {typeof totalCount === 'number' && (
                    <Typography variant="body2" className="text-gray-600 ml-3">
                        {totalCount} items
                    </Typography>
                )}
            </Box>

            <MuiPagination
                count={Math.max(1, totalPages)}
                page={page}
                onChange={(_, value) => onPageChange(value)}
                color="primary"
                disabled={totalPages === 0}
            />
        </Box>
    );
}
