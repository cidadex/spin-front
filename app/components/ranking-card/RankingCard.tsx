import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { SpinCardTitle } from "../spin-card-title/SpinCardTitle";

const rankinData = [
  {
    position: 1,
    timeSaved: "120 anos 3 meses 12 dias",
    lawyerName: "Advogado 1",
    processes: 10,
  },
  {
    position: 2,
    timeSaved: "98 anos 5 meses 20 dias",
    lawyerName: "Advogado 2",
    processes: 8,
  },
  {
    position: 3,
    timeSaved: "75 anos 2 meses 5 dias",
    lawyerName: "Advogado 3",
    processes: 6,
  },
  {
    position: 4,
    timeSaved: "60 anos 1 mês 15 dias",
    lawyerName: "Advogado 4",
    processes: 5,
  },
  {
    position: 5,
    timeSaved: "45 anos 4 meses 10 dias",
    lawyerName: "Advogado 5",
    processes: 4,
  },
  {
    position: 6,
    timeSaved: "30 anos 6 meses 25 dias",
    lawyerName: "Advogado 6",
    processes: 3,
  },
  {
    position: 7,
    timeSaved: "20 anos 3 meses 5 dias",
    lawyerName: "Advogado 7",
    processes: 2,
  },
  {
    position: 8,
    timeSaved: "15 anos 2 meses 10 dias",
    lawyerName: "Advogado 8",
    processes: 1,
  },
  {
    position: 9,
    timeSaved: "10 anos 1 mês 20 dias",
    lawyerName: "Advogado 9",
    processes: 1,
  },
  {
    position: 10,
    timeSaved: "5 anos 4 meses 15 dias",
    lawyerName: "Advogado 10",
    processes: 1,
  },
];

export const RankingCard = () => {
  const t = useTranslations("homePage.rankingCard");

  return (
    <Card className="flex-1 pt-0 pb-2 gap-0">
      <SpinCardTitle
        centered
        title={<span className="text-xs">{t("title")}</span>}
        icon={
          <span className="text-lg leading-none">
            <span className="material-symbols-outlined leading-none! material-symbols-outlined-sized">
              trophy
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
      <CardContent className="h-full px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.position")}</TableHead>
              <TableHead>{t("table.totalYearsSaved")}</TableHead>
              <TableHead>{t("table.lawyerName")}</TableHead>
              <TableHead>{t("table.processes")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankinData.map((item) => (
              <TableRow key={item.position} className="odd:bg-white/5 border-white/5">
                <TableCell className="text-muted-foreground font-bold py-0">
                  {item.position}º
                </TableCell>
                <TableCell className="text-foreground font-bold py-0">
                  {item.timeSaved}
                </TableCell>
                <TableCell className="text-muted-foreground py-0">
                  {item.lawyerName}
                </TableCell>
                <TableCell className="text-muted-foreground py-1">
                  <span className="px-2 py-1 border border-white/10 w-full block text-center rounded">
                    {item.processes}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
