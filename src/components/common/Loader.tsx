import React from "react";

type LoaderProps = {
  size?: number; // in px
  color?: string;
  "aria-label"?: string;
};

const Loader: React.FC<LoaderProps> = ({ size = 160, color = "#7FB3FF", "aria-label": ariaLabel = "loading" }) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lightBlueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="40%" stopColor={color} stopOpacity="0.4" />
            <stop offset="70%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="5"
        />

        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="url(#lightBlueGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="188"
          strokeDashoffset="130"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 40 40"
            to="360 40 40"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default Loader;
