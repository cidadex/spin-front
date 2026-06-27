import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { NewApenadoDialog } from "../new-apenado-dialog/NewApenadoDialog";

export const NewApenadoCard = () => {
  const t = useTranslations("newApenadoCard");

  return (
    <Card className="col-span-2" id="tour-2">
      <CardContent className="flex flex-col gap-4 items-center h-full justify-center">
        <div className="bg-blue-100 rounded-full p-4 text-blue-800">
          <PlusIcon />
        </div>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <NewApenadoDialog
          trigger={
            <Button className="cursor-pointer">{t("buttonLabel")}</Button>
          }
        ></NewApenadoDialog>
      </CardContent>
    </Card>
  );
};
