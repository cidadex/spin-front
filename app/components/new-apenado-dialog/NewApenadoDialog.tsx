import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CheckIcon, IdCardIcon, XIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NewApenadoAutomaticForm } from "../new-apenado-automatic-form/NewApenadoAutomaticForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";

export const NewApenadoDialog = ({ trigger }: { trigger: ReactNode }) => {
  const t = useTranslations("newApenadoDialog");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-2xl! overflow-hidden grid-rows-[auto_1fr] px-0 pt-0 pb-0"
      >
        <DialogHeader className="bg-[#152030] border-b border-white/10 pt-6 pb-4 px-5 flex-row">
          <DialogTitle className="flex-1 flex items-center justify-center w-full gap-2">
            <span className="material-symbols-outlined text-[#ECD1A6] leading-none">
              person_add
            </span>
            {t("title")}
          </DialogTitle>
          <span>
            <Button
              size="icon"
              variant="ghost"
              className=" cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <XIcon />
            </Button>
          </span>
        </DialogHeader>
        <div className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex gap-4 h-full items-stretch">
              <NewApenadoAutomaticForm />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const NewApenadoManuallyForm = () => {
  const t = useTranslations("newApenadoDialog.manualForm");

  return (
    <Card className="flex-1">
      <CardHeader>
        <span className="flex gap-4 items-center">
          <span className="p-4 rounded-full bg-blue-100">
            <IdCardIcon className="text-blue-800" />
          </span>
          <section className="flex flex-col">
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </section>
        </span>
      </CardHeader>
      <Separator />
      <CardContent className="h-full">
        <div className="flex flex-col gap-2 items-center justify-center content-center p-4">
          <span className="p-4 rounded-full bg-blue-100">
            <IdCardIcon className="text-blue-800 w-12 h-12" />
          </span>
          <CardTitle className="mb-2 text-center">{t("wizardTitle")}</CardTitle>
          <CardDescription className="text-center">
            {t("subtitle")}
          </CardDescription>
        </div>
        <ul>
          <li className="flex gap-2 items-center content-start justify-start">
            <CheckCircle className="w-4 h-4" /> {t("benefits.personalData")}
          </li>
          <li className="flex gap-2 items-center content-start justify-start">
            <CheckCircle className="w-4 h-4" /> {t("benefits.sentenceInfo")}
          </li>
          <li className="flex gap-2 items-center content-start justify-start">
            <CheckCircle className="w-4 h-4" />{" "}
            {t("benefits.automatedCalculation")}
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <CheckIcon />
          {t("buttonLabel")}
        </Button>
      </CardFooter>
    </Card>
  );
};
