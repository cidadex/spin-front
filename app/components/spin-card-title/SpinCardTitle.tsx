import { CardHeader } from "@/components/ui/card";

export const SpinCardTitle = ({
  title,
  icon,
  actions,
  centered = false,
  dense = false,
  groupHoverable = false,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  centered?: boolean;
  dense?: boolean;
  groupHoverable?: boolean;
}) => {
  return (
    <div className="px-1 pt-1">
      <CardHeader
        className={`border border-white/10 bg-white/5 backdrop-blur-sm rounded-tl-xl rounded-tr-xl block ${dense ? "px-2" : ""}
        ${groupHoverable ? "group-hover:bg-white/10 transition-colors duration-300" : ""}`}
      >
        <div
          className={`flex gap-2 h-11 items-center ${centered ? "justify-center" : ""}`}
        >
          {icon && (
            <div className="text-[#ECD1A6] whitespace-nowrap leading-none">
              {icon}
            </div>
          )}
          <h1
            className={`text-sm truncate text-white/70 font-medium leading-none uppercase tracking-wider ${centered ? "text-center " : "flex-1"}`}
          >
            {title}
          </h1>
          {actions}
        </div>
      </CardHeader>
    </div>
  );
};
