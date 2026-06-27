"use client";
import { PropsWithChildren, ReactNode } from "react";
import { Activity } from "@/components/ui/activity";
import { NovoCalculoStepperProgressIndicator } from "./NovoCalculoStepperProgressIndicator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldValues, FormState } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

export const NovoCalculoStepperStepCard = ({
  stepIndex,
  children,
  formState,
  prevStep,
  stepTitle,
  stepSubtitle,
}: PropsWithChildren<{
  stepIndex: number;
  formState: FormState<FieldValues>;
  prevStep?: () => void;
  stepTitle: string;
  stepSubtitle?: ReactNode;
}>) => {
  const t = useTranslations();
  return (
    <>
      <div className="flex-1">
        <NovoCalculoStepperProgressIndicator currentStep={stepIndex} />
        <div className="container mx-auto mt-4">
          <header className="flex flex-col items-center py-5 gap-4">
            <h2 className="text-2xl font-bold">{stepTitle}</h2>
            {stepSubtitle && (
              <span className="text-sm text-muted-foreground">{stepSubtitle}</span>
            )}
            <Alert variant="default">
              <AlertCircleIcon />
              <AlertDescription>
                {t("calculo.dadosPessoais.autoFilledAlert.description")}
              </AlertDescription>
            </Alert>
          </header>
        </div>
        <section className="container mx-auto">{children}</section>
      </div>
      <div className="py-4">
        <Separator />
      </div>
      <footer className="flex items-center justify-center pb-4">
        <div className="container">
          <div className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              disabled={prevStep == null}
              onClick={prevStep}
              className="cursor-pointer"
            >
              <i className="material-symbols-outlined">arrow_back</i>
              {t("common.back")}
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={formState.isSubmitting}
            >
              <Activity mode={formState.isSubmitting ? "visible" : "hidden"}>
                <Loader className="w-4 h-4 animate-spin" />
              </Activity>
              {stepIndex === 3
                ? t("calculo.novoCalculo.finishAndCalculate")
                : t("common.next")}
              <i className="material-symbols-outlined">arrow_forward</i>
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
};
