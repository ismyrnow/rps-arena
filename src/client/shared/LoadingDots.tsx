import React from "react";

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg"; // Size of the dots
  color?: string; // Tailwind color class, e.g., "text-blue-500"
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  color = "bg-neutral-800",
}) => {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex space-x-2">
      <span
        className={`animate-bounce ${sizes[size]} ${color} rounded-full`}
        style={{ animationDelay: "0s" }}
      ></span>
      <span
        className={`animate-bounce ${sizes[size]} ${color} rounded-full`}
        style={{ animationDelay: "0.2s" }}
      ></span>
      <span
        className={`animate-bounce ${sizes[size]} ${color} rounded-full`}
        style={{ animationDelay: "0.4s" }}
      ></span>
    </div>
  );
};

export default LoadingDots;
