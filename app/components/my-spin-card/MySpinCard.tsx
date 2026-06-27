import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SmallCard } from "@/components/ui/small-card";
import { ClientRepository } from "@/repositories/client/ClientRepository";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { NewApenadoDialog } from "../new-apenado-dialog/NewApenadoDialog";
import { SpinCardTitle } from "../spin-card-title/SpinCardTitle";

export const MySpinCard = () => {
  const t = useTranslations("homePage");
  const tMySpin = useTranslations("homePage.mySpin");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  useEffect(() => {
    const clientRepository = new ClientRepository();
    let cancelled = false;

    const loadBalance = async () => {
      try {
        const response = await clientRepository.getCreditsBalance();
        if (!cancelled) {
          setRemainingCredits(response.data.balance);
        }
      } catch {
        if (!cancelled) {
          setRemainingCredits(0);
        }
      }
    };

    void loadBalance();
    return () => {
      cancelled = true;
    };
  }, []);

  const identifiedPenaltyTime = {
    years: 0,
    months: 0,
    days: 0,
  };
  const reviewedCasesCount = 0;
  const savedAnalysisTime = {
    hours: 0,
    minutes: 0,
  };

  return (
    <Card className="flex-1 max-w-5xl pt-0 pb-2">
      <SpinCardTitle title={t("mySpin.title")} centered />
      <CardContent>
        <div className="w-full flex items-center justify-between gap-4">
          <SmallCard
            icon={
              <span className="text-gray-600 text-2xl">
                <i className="material-symbols-outlined material-symbols-outlined-sized">
                  hourglass_top
                </i>
              </span>
            }
            value={tMySpin("cards.identifiedPenaltyTime.value", {
              years: identifiedPenaltyTime.years,
              months: identifiedPenaltyTime.months,
              days: identifiedPenaltyTime.days,
            })}
            subtitle={tMySpin("cards.identifiedPenaltyTime.subtitle")}
            className="flex-auto"
          />
          <SmallCard
            icon={
              <span className="text-blue-600 text-2xl">
                <i className="material-symbols-outlined material-symbols-outlined-sized">
                  file_open
                </i>
              </span>
            }
            value={tMySpin("cards.reviewedCases.value", {
              count: reviewedCasesCount,
            })}
            subtitle={tMySpin("cards.reviewedCases.subtitle")}
            className="flex-auto"
          />
          <SmallCard
            icon={
              <span className="text-green-500 text-2xl">
                <i className="material-symbols-outlined material-symbols-outlined-sized">
                  more_time
                </i>
              </span>
            }
            value={tMySpin("cards.savedAnalysisTime.value", {
              hours: savedAnalysisTime.hours,
              minutes: savedAnalysisTime.minutes,
            })}
            subtitle={tMySpin("cards.savedAnalysisTime.subtitle")}
            className="flex-auto"
          />
          <SmallCard
            icon={
              <span className="text-indigo-700 text-2xl">
                <i className="material-symbols-outlined material-symbols-outlined-sized">
                  calculate
                </i>
              </span>
            }
            value={
              remainingCredits === null
                ? "…"
                : tMySpin("cards.remainingCredits.value", {
                    count: remainingCredits,
                  })
            }
            subtitle={tMySpin("cards.remainingCredits.subtitle")}
            className="flex-auto"
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className="bg-emerald-500/10 border border-emerald-500/20 w-full rounded-sm px-2 py-2 flex gap-2 justify-between items-center">
          <div className="mb-0 flex items-center gap-2 leading-none text-emerald-400">
            <span className="material-symbols-outlined material-symbols-outlined-sized ml-2 leading-none">
              check_circle
            </span>
            <span className="text-xs font-medium">
              {t("useCalculationsPrompt")}
            </span>
          </div>
          <NewApenadoDialog
            trigger={
              <Button variant="success" size="sm" className="cursor-pointer">
                {t("performNewCalculation")}
                <ArrowRightIcon />
              </Button>
            }
          />
        </div>
      </CardFooter>
    </Card>
  );
};
