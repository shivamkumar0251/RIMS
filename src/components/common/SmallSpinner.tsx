import React from "react";

type SpinnerProps = {
  size?: number;   // size in px (applies to width & height)
  color?: string;  // Tailwind color class e.g. "border-t-blue-500"
  fullScreen?: boolean;
};

export const SmallSpinner: React.FC<SpinnerProps> = ({
  size = 40,
  color = "border-t-blue-600",
  fullScreen = false,
}) => {
  // dynamic border thickness based on size
  const borderSize =
    size < 30 ? 2 : size < 60 ? 4 : size < 100 ? 6 : 8;

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "h-screen w-full" : ""
      }`}
    >
      <div
        className={`
          rounded-full animate-spin motion-reduce:animate-none
          border-gray-200 ${color}
        `}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderWidth: `${borderSize}px`,
        }}
      />
    </div>
  );
};
