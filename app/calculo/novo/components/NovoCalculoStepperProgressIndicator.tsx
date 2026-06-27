"use client";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

export const NovoCalculoStepperProgressIndicator = ({
  currentStep,
}: {
  currentStep: number;
}) => {
  const t = useTranslations("calculo.novoCalculo.progressIndicator");

  const totalSteps = 3;

  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="container mx-auto">
      <div className="flex gap-2 items-center pb-5">
        <div className="flex justify-between whitespace-nowrap">
          <span className="text-xs text-gray-600 font-medium">
            {t("registrationProgress")}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between">
          <span className="text-xs text-gray-600 font-medium">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
