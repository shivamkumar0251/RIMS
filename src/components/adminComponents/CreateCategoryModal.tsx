import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import {  useCreateCategoryMutation,  useUpdateCategoryMutation,} from "../products/store/apiServices";

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
  editMode: boolean;
  currentCategory: { _id: string; category: string } | null;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  open,
  onClose,
  onRefresh,
  editMode,
  currentCategory,
}) => {
  const [categoryName, setCategoryName] = useState("");

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();

  // prefill when editing
  useEffect(() => {
    if (editMode && currentCategory) {
      setCategoryName(currentCategory.category);
    } else {
      setCategoryName("");
    }
  }, [editMode, currentCategory, open]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    try {
      let res: any;
      if (editMode && currentCategory) {
        // update
        res = await updateCategory({
          id: currentCategory._id,
          category: categoryName,
        }).unwrap();
      } else {
        // create
        res = await createCategory({ category: categoryName }).unwrap();
      }

      if (res?.success) {
        await onRefresh(); // refresh table
        onClose();
        setCategoryName("");
      } else {
        console.error("Action failed:", res);
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {editMode ? "Edit Category" : "Add Category"}
      </DialogTitle>

      <DialogContent>
        <Box mt={1}>
          <TextField
            autoFocus
            fullWidth
            label="Category Name"
            variant="outlined"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{ textTransform: "capitalize" }}
        >
          Close
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          disabled={creating || updating}
          sx={{ textTransform: "capitalize" }}
        >
          {editMode
            ? updating
              ? "Updating..."
              : "Update"
            : creating
            ? "Creating..."
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCategoryModal;
