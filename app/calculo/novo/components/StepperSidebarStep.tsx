"use client";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export const steps = [
  {
    title: "calculo.dadosPessoais.stepTitle",
    description: "calculo.dadosPessoais.stepDescription",
    path: "/calculo/novo/dados-pessoais",
  },
  {
    title: "calculo.questionarioDinamico.stepTitle",
    description: "calculo.questionarioDinamico.stepDescription",
    path: "/calculo/novo/questionario-dinamico",
  },
  {
    title: "calculo.realizarCalculo.stepTitle",
    description: "calculo.realizarCalculo.stepDescription",
    path: "/calculo/novo/relatorio",
  },
];

export const StepperSidebarStep = ({
  title,
  isActive,
  index,
  description,
  isCompleted,
  stepsCount,
  nextToActive,
}: (typeof steps)[number] & {
  isActive: boolean;
  isCompleted: boolean;
  index: number;
  stepsCount: number;
  nextToActive: boolean;
}) => {
  const t = useTranslations();

  const rowBg = isActive
    ? "bg-[#ECD1A6]/8 border-l-2 border-l-[#ECD1A6]/60"
    : isCompleted
      ? "bg-white/3"
      : "";

  const circleStyle = isActive
    ? "bg-[#ECD1A6] text-[#1C2A39]"
    : isCompleted
      ? "bg-white/20 text-foreground"
      : "bg-white/8 text-muted-foreground border border-white/15";

  const lineColor = isCompleted
    ? "border-[#ECD1A6]/40 border-solid"
    : isActive
      ? "border-[#ECD1A6]/30 border-dashed"
      : nextToActive
        ? "border-white/30 border-dashed"
        : "border-white/15 border-dashed";

  return (
    <span
      className={`relative px-4 py-3 flex gap-3 border-b border-white/6 items-start transition-colors ${rowBg}`}
    >
      {index !== 0 && (
        <div
          className={`absolute left-[2.15rem] top-0 h-1/2 w-0 border-l z-0 ${lineColor}`}
        />
      )}
      {index < stepsCount - 1 && (
        <div
          className={`absolute left-[2.15rem] top-1/2 h-1/2 w-0 border-l z-0 ${
            isCompleted
              ? "border-[#ECD1A6]/40 border-solid"
              : "border-white/15 border-dashed"
          }`}
        />
      )}

      <div className="w-7 h-7 min-w-7 min-h-7 z-10 mt-0.5">
        <span
          className={`rounded-full w-full h-full leading-none flex items-center justify-center text-xs font-bold ${circleStyle}`}
        >
          {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 overflow-hidden">
        <span
          className={`text-[13px] font-semibold leading-snug ${
            isActive
              ? "text-[#ECD1A6]"
              : isCompleted
                ? "text-foreground/80"
                : "text-muted-foreground"
          }`}
        >
          {t(title)}
        </span>
        <p
          className={`text-xs leading-snug ${
            isActive ? "text-muted-foreground" : "text-muted-foreground/60"
          }`}
        >
          {t(description)}
        </p>
      </div>
    </span>
  );
};

export const safeParseInt = (value: unknown, defaultValue: number): number => {
  const parsed = parseInt(value as string, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};
