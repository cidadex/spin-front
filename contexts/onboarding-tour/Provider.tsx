"use client";
import { Tour } from "onborda/dist/types";
import { OnboardingTourContext } from "./context";
import { Onborda, useOnborda } from "onborda";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { AuthStatusEnum } from "@/types/enums";
import type { CardComponentProps } from "onborda";
import { Button } from "@/components/ui/button";

export const OnboardingTourProvider = ({
  children,
}: React.PropsWithChildren<object>) => {
  const { authState } = useAuth();
  const [rawSteps] = useState<Tour[]>([
    {
      tour: "main",
      steps: [
        {
          title: "Título",
          content: (
            <>
              Creating Teams is the best way to organize your operation. Give it
              a name and group employees who work the same tools or department,
              to easily check on them.
            </>
          ),
          selector: "#tour-1",
          icon: <span className="material-symbols-outlined">bolt</span>,
          side: "bottom-left",
        },
        {
          title: "Welcome to the App",
          content: "This is a brief tour to get you started.",
          selector: "#tour-2",
          icon: null,
          side: "top-right",
        },
        {
          title: "Welcome to the App",
          content: "This is a brief tour to get you started.",
          selector: "#tour-3",
          icon: <span className="material-symbols-outlined">bolt</span>,
          side: "bottom",
        },
      ],
    },
  ]);

  const steps = useMemo(() => {
    if (authState !== AuthStatusEnum.Authenticated) {
      return [];
    }
    return rawSteps;
  }, [authState, rawSteps]);

  return (
    <OnboardingTourContext value={{ steps }}>
      <Onborda steps={steps} cardComponent={TourCard}>
        {children}
      </Onborda>
    </OnboardingTourContext>
  );
};

export const TourCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  const { closeOnborda } = useOnborda();

  function handleClose() {
    closeOnborda();
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg max-w-md text-neutral-300">
      <span className="text-gray-800">{arrow}</span>
      <div className="flex gap-2 items-center">
        <div className="flex flex-1 gap-2 items-center">
          {step.icon ? (
            <span className="text-primary leading-none whitespace-nowrap block">
              {step.icon}
            </span>
          ) : null}
          <h1 className="text-neutral-100 font-semibold text-xl leading-none">
            {step.title}
          </h1>
        </div>
        <span className="text-gray-700 font-semibold text-xs leading-none">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>
      <main className="pt-4 pb-6 text-neutral-300 text-xs font-medium">
        <p>{step.content}</p>
      </main>
      <div className="flex justify-between items-center mt-4 gap-2">
        <Button
          onClick={() => prevStep()}
          disabled={currentStep === 0}
          variant="ghost"
          className="cursor-pointer"
        >
          Previous
        </Button>
        {currentStep + 1 !== totalSteps && (
          <Button onClick={() => nextStep()} className="cursor-pointer">
            Next
          </Button>
        )}
        {currentStep + 1 === totalSteps && (
          <Button onClick={handleClose} className="cursor-pointer">
            🎉 Finish!
          </Button>
        )}
      </div>
    </div>
  );
};
