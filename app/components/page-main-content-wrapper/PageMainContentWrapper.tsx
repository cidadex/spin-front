import { PropsWithChildren } from "react";

export const PageMainContentWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-full w-full flex-1 bg-transparent border border-b-0  rounded-tr-2xl rounded-tl-2xl main-content-bg">
      <div className="container margin-x-auto">
        <div className="px-8">{children}</div>
      </div>
    </div>
  );
};
