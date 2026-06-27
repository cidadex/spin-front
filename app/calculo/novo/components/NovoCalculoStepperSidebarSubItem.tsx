import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PropsWithChildren } from "react";

export const NovoCalculoStepperSidebarSubItem = ({
  label,
  value,
  children,
  tooltip,
}: PropsWithChildren<{
  label: string;
  value: string;
  tooltip?: string;
}>) => {
  return (
    <div className="flex-1 flex flex-col">
      <span className="text-[10px] text-muted-foreground">
        {label}
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger>
              <span className="ml-1">
                <i className="material-symbols-outlined material-symbols-outlined-sized text-muted-foreground cursor-pointer">
                  info
                </i>
              </span>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          <></>
        )}
      </span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
      {children}
    </div>
  );
};
