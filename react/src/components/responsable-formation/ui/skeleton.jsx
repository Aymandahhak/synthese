import React from "react";
import { cn } from "@/lib/utils";

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-gray-200 rounded", className)}
      {...props}
    />
  );
};

export { Skeleton };