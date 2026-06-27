import { Tour } from "onborda/dist/types";
import { createContext } from "react";

export interface IOnboardingTourContext {
  steps: Tour[];
}

export const OnboardingTourContext = createContext<IOnboardingTourContext>({
  steps: [],
});
