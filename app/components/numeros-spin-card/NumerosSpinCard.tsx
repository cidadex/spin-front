import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { SpinCardTitle } from "../spin-card-title/SpinCardTitle";

type NumerosSpinCardSubCardProps = {
  icon: ReactNode;
  value: string;
  subtitle: string;
};

const NumerosSpinCardSubCard = ({
  icon,
  value,
  subtitle,
}: NumerosSpinCardSubCardProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex gap-2 items-center">
        <div className="text-lg flex items-center gap-2">
          <span className="text-muted-foreground text-2xl leading-none">{icon}</span>
          <span className="text-foreground text-base font-semibold">{value}</span>
        </div>
      </span>
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
    </div>
  );
};

export const NumerosSpinCard = () => {
  const t = useTranslations("homePage.numbersSpinCard");
  const calculationsCount = 456;
  const timeSaved = {
    years: 489,
    months: 38,
    days: 12,
  };
  const usersCount = 213;

  return (
    <Card className="pt-0">
      <SpinCardTitle
        centered
        title={<span className="text-xs">{t("title")}</span>}
        icon={
          <span className="text-lg leading-none">
            <span className="material-symbols-outlined leading-none! material-symbols-outlined-sized">
              newspaper
            </span>
          </span>
        }
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="w-auto h-auto p-1">
                <i className="material-symbols-outlined material-symbols-outlined-sized">
                  info
                </i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("tooltip")}</TooltipContent>
          </Tooltip>
        }
      />
      <CardContent className="h-full">
        <div className="flex flex-col gap-4">
          <NumerosSpinCardSubCard
            icon={
              <i className="material-symbols-outlined material-symbols-outlined-sized">
                calculate
              </i>
            }
            value={t("stats.calculations.value", { count: calculationsCount })}
            subtitle={t("stats.calculations.subtitle")}
          />
          <Separator />
          <NumerosSpinCardSubCard
            icon={
              <i className="material-symbols-outlined material-symbols-outlined-sized">
                hourglass_top
              </i>
            }
            value={t("stats.timeSaved.value", {
              years: timeSaved.years,
              months: timeSaved.months,
              days: timeSaved.days,
            })}
            subtitle={t("stats.timeSaved.subtitle")}
          />
          <Separator />
          <NumerosSpinCardSubCard
            icon={
              <i className="material-symbols-outlined material-symbols-outlined-sized">
                groups
              </i>
            }
            value={t("stats.users.value", { count: usersCount })}
            subtitle={t("stats.users.subtitle")}
          />
          <Separator />
          <Alert variant="primary">
            <AlertCircleIcon />
            <AlertDescription>{t("cta")}</AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};
