"use client";
import { routeConfig } from "@/lib/route-config";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { NovoCalculoStepperEmptyStateIndicator } from "./NovoCalculoStepperEmptyStateIndicator";
import { safeParseInt, steps, StepperSidebarStep } from "./StepperSidebarStep";

export const NovoCalculoStepperRightSidebarSectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => {
  return (
    <header className="px-6 py-4 flex flex-col gap-2 bg-white/5 border-b border-white/10">
      <span className="flex gap-2 font-semibold text-[13px] text-foreground items-center leading-none">
        <span className="text-xl leading-none text-[#ECD1A6]">
          <i className="material-symbols-outlined material-symbols-outlined-sized leading-none">
            {icon}
          </i>
        </span>
        {title}
      </span>
      <span className="text-xs text-muted-foreground leading-none">{subtitle}</span>
    </header>
  );
};

export const NovoCalculoStepperRightSidebar = () => {
  const currentPath = usePathname();
  const pageConfig = routeConfig[currentPath]?.configs;
  const t = useTranslations("calculo.novoCalculo");

  return (
    <>
      <NovoCalculoStepperRightSidebarSectionHeader
        icon="checklist"
        title={t("sidebar.progressAnalysis.title")}
        subtitle={t("sidebar.progressAnalysis.subtitle")}
      />
      <div className="flex flex-col">
        {steps.map((step, index) => {
          const isActive = pageConfig?.stepIndex === index;
          const isCompleted = safeParseInt(pageConfig?.stepIndex, 0) > index;
          const nextToActive = pageConfig?.stepIndex === index - 1;
          return (
            <StepperSidebarStep
              key={step.path}
              title={step.title}
              path={step.path}
              isActive={isActive}
              isCompleted={isCompleted}
              index={index}
              description={step.description}
              stepsCount={steps.length}
              nextToActive={nextToActive}
            />
          );
        })}
      </div>
      <NovoCalculoStepperRightSidebarSectionHeader
        icon="menu_book"
        title={t("sidebar.strategicAnalysis.title")}
        subtitle={t("sidebar.strategicAnalysis.subtitle")}
      />
      <NovoCalculoStepperEmptyStateIndicator />
      <footer className="p-8"></footer>
    </>
  );
};
