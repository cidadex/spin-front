import { PropsWithChildren } from "react";

interface ActivityProps extends PropsWithChildren {
  mode?: "visible" | "hidden";
  className?: string;
}

export const Activity = ({ mode = "visible", children, className }: ActivityProps) => {
  if (mode === "hidden") return null;
  return <div className={className}>{children}</div>;
};
