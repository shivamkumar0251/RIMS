// Spinner.tsx
import React from "react";

const MainSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen p-8">
      <div
        className="
          border-[12px] border-gray-200 
          border-t-[12px] border-t-blue-500 
          rounded-full animate-spin
          w-20 h-20
          sm:w-15 sm:h-15 sm:border-[8px] sm:border-t-[8px]
          md:w-24 md:h-24 md:border-[14px] md:border-t-[14px]
          lg:w-28 lg:h-28 lg:border-[16px] lg:border-t-[16px]
        "
      />
    </div>
  );
};

export default MainSpinner;
