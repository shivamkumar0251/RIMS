import React from "react";

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
      className={` rounded-md border border-transparent px-4 py-2 text-base font-medium 
                  bg-neutral-900 text-white cursor-pointer transition-colors
                  hover:border-indigo-400 focus:outline-none focus-visible:ring-2 
                  focus-visible:ring-indigo-400 ${loading ? "opacity-50 cursor-not-allowed" : ""} 
                  ${className ?? ""}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? "Loading..." : children || buttonName || "etc Name"}
    </button>
  );
};
