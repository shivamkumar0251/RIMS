import React from "react";
import { VendorDialogForm } from "../components/adminComponents/VendorDialogForm";

interface VendorModalProps {
  open: boolean;
  onClose: () => void;
  onAddVendor: (vendor: any) => void;
  variant?: "dialog" | "embedded";
  isEdit?: boolean;
  initialData?: any;
}

const VendorModal: React.FC<VendorModalProps> = ({
  open,
  onClose,
  onAddVendor,
  isEdit = false,
  initialData,
}) => {
  // Adapter to match VendorDialogForm's expectation of a Promise
  const handleSave = async (data: any) => {
    onAddVendor(data);
    return Promise.resolve();
  };

  return (
    <VendorDialogForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      isEdit={isEdit}
      initialData={initialData}
    />
  );
};

export default VendorModal;
