import { toast, } from 'react-toastify';
import type { ToastOptions, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default configuration for toasts
const defaultConfig: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

// Toast utility functions
export const showToast = {
    success: (message: string, config: ToastOptions = {}) => {
        return toast.success(message, { ...defaultConfig, ...config });
    },
    error: (message: string, config: ToastOptions = {}) => {
        return toast.error(message, { ...defaultConfig, ...config });
    },
    info: (message: string, config: ToastOptions = {}) => {
        return toast.info(message, { ...defaultConfig, ...config });
    },
    warning: (message: string, config: ToastOptions = {}) => {
        return toast.warning(message, { ...defaultConfig, ...config });
    },
    // Custom toast with specific styling
    custom: (message: string, config: ToastOptions = {}) => {
        return toast(message, { ...defaultConfig, ...config });
    },
    // Dismiss all toasts
    dismissAll: () => {
        toast.dismiss();
    },
    // Update existing toast
    update: (toastId: Id, message: string, config: ToastOptions = {}) => {
        return toast.update(toastId, {
            render: message,
            ...config,
        });
    },
};
