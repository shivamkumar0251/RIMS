import React from "react";
import { SmallSpinner } from "./common/SmallSpinner";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  buttonName?: string;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  loading = false,
  disabled,
  buttonName,
  ...props
}) => {
  return (
   <button
    className={`
        rounded-md border border-transparent px-4 py-2 text-base font-medium 
        bg-blue-600 text-white shadow-sm
        transition-all duration-200 ease-in-out
        hover:bg-blue-700 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
        ${loading ? "opacity-50 cursor-not-allowed" : ""} 
        ${className ?? ""}`
    }
    disabled={loading || disabled}
    {...props}
>
    {loading ? <SmallSpinner size={30}/> : children || buttonName || "Button"}
</button>
  );
};
