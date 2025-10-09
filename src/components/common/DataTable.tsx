import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";

type AnyProps = {
    rows: any[];
    columns: any[];
    pageSize?: number;
    onRowClick?: (params: any) => void;
    checkboxSelection?: boolean;
    autoHeight?: boolean;
};

const StyledDataGrid = styled(DataGrid)(() => ({
    "& .MuiDataGrid-columnHeaders": {
        backgroundColor: "#e0e7ff !important", // Light indigo for header
        position: "sticky",
        top: 0,
        zIndex: 2,
    },
    "& .MuiDataGrid-footerContainer": {
        position: "sticky",
        bottom: 0,
        backgroundColor: "#ffffff !important", // White background for pagination
        zIndex: 2,
        borderTop: "1px solid #e0e0e0", // Subtle border for visibility
    },
    "& .MuiDataGrid-virtualScroller": {
        overflowY: "auto !important", // Enable scrolling for content
    },
    "& .MuiDataGrid-main": {
        position: "relative",
        overflow: "hidden", // Prevent main container from scrolling
    },
}));

const DataTable: React.FC<AnyProps> = ({
    rows,
    columns,
    pageSize = 10,
    onRowClick,
    checkboxSelection = true,
    autoHeight = false,
}) => {
    // Disable column resizing by setting resizable: false for each column
    const columnsWithNoResize = columns.map((col) => ({
        ...col,
        resizable: false,
    }));

    return (
        <div
            style={{
                width: "100%",
                height: "calc(100vh - 128px)", // Adjust for padding in parent Box (4 * 16px * 2 = 128px)
                position: "relative",
                background: "#fff",
                overflow: "hidden", // Prevent table from scrolling with page
            }}
        >
            <StyledDataGrid
                rows={rows}
                columns={columnsWithNoResize}
                initialState={{ pagination: { paginationModel: { pageSize } } }}
                pageSizeOptions={[5, 10, 25, 50]}
                checkboxSelection={checkboxSelection}
                disableRowSelectionOnClick
                onRowClick={onRowClick}
                autoHeight={autoHeight}
                slots={{ toolbar: GridToolbar }}
                disableColumnResize
            />
        </div>
    );
};

export default DataTable;