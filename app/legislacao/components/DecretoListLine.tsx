"use client";

import { useTranslations } from "next-intl";
import { PropsWithChildren, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DecretoListItemModal } from "./DecretoListItemModal";
import { DecretoListItem } from "@/types/calculadora";
import { DecretoStatusEnum } from "@/types/enums";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlossarySection } from "./GlossarySection";
import { seeuDateConverter } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export const DecretoListItemFocusBadge = ({ label }: { label: string }) => {
  return (
    <div className="text-xs leading-none font-medium px-2.5 py-1.5 bg-indigo-100 text-indigo-800 rounded-sm">
      {label}
    </div>
  );
};

export const DecretoListLine = ({ decreto }: { decreto: DecretoListItem }) => {
  const publicationDate = useMemo(
    () =>
      decreto.data_publicacao
        ? seeuDateConverter.toDate(decreto.data_publicacao)
        : null,
    [decreto.data_publicacao]
  );

  const signatureDate = useMemo(
    () =>
      decreto.data_assinatura
        ? seeuDateConverter.toDate(decreto.data_assinatura)
        : null,
    [decreto.data_assinatura]
  );

  const dateFormatter = useMemo(
    () =>
      Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
    []
  );

  const t = useTranslations();
  return (
    <article className="bg-white border group overflow-hidden relative border-gray-400 px-2 py-3 rounded-lg hover:border-purple-600 hover:shadow-lg transition-all duration-300">
      <div className="grid grid-cols-3 template-rows-[auto_auto] gap-0">
        <header className="border-b border-r pb-4 pr-4">
          <div className="flex gap-2 items-center justify-between">
            <section className="flex items-center gap-1 pt-2">
              <i className="material-symbols-outlined text-sm text-gray-400">
                calculate
              </i>
              <span className="font-bold text-lg text-gray-900 leading-none">
                {decreto.nome}
              </span>
            </section>
            {decreto.status === DecretoStatusEnum.Ativo && (
              <Badge variant="secondary-success" className="text-xs">
                {t("legislacaoPage.decretoListItem.statusActive")}
              </Badge>
            )}
            {decreto.status === DecretoStatusEnum.Concluido && (
              <Badge variant="secondary" className="text-xs">
                {t("legislacaoPage.decretoListItem.statusConcluded")}
              </Badge>
            )}
          </div>
        </header>
        <section className="flex col-span-2 flex-2 flex-col gap-2 border-b border-l text-gray-800 pb-2 pl-4 pt-4">
          <p className="mb-0 text-xs">{decreto.descricao}</p>
        </section>
        <footer className="flex gap-2 px-2 pt-2 text-gray-800 items-center font-medium text-xs border-r border-t">
          <span className="flex gap-2 items-center">
            <span className="leading-none">
              {"·"}{" "}
              {t("legislacaoPage.decretoListItem.signatureDate", {
                date: signatureDate ? dateFormatter.format(signatureDate) : "",
              })}
            </span>
          </span>
          <Separator orientation="vertical" />
          <span className="flex gap-2 items-center">
            <span className="leading-none">
              {"·"}{" "}
              {t("legislacaoPage.decretoListItem.publicationDate", {
                date: publicationDate
                  ? dateFormatter.format(publicationDate)
                  : "",
              })}
            </span>
          </span>
        </footer>
        <footer className="border-l border-t flex gap-2 col-span-2 pt-2 pl-4 items-center">
          <span className="leading-none text-gray-900 text-sm font-medium">
            {t("legislacaoPage.decretoListItem.focus")}:
          </span>
          <section className="flex gap-1 flex-1">
            {decreto.focos.map((foco) => (
              <DecretoListItemFocusBadge key={foco} label={foco} />
            ))}
          </section>
          <DecretoListItemModal
            trigger={
              <DecretoDetailModal decreto={decreto}>
                <Button variant="outline" className="cursor-pointer">
                  <i className="material-symbols-outlined text-blue-500">
                    description
                  </i>
                  {t("legislacaoPage.decretoListItem.viewDetails")}
                </Button>
              </DecretoDetailModal>
            }
          />
        </footer>
      </div>
      <span className="absolute top-0 left-0 h-full w-2 bg-purple-200 border-r border-purple-800 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
    </article>
  );
};

export const DecretoDetailModal = ({
  children,
  decreto,
}: PropsWithChildren<{
  decreto: DecretoListItem;
}>) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={(openState) => setOpen(openState)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex h-[90vh] w-full max-w-4xl! flex-col gap-2 overflow-hidden">
        <DialogHeader className="shrink-0 pb-1">
          <DialogTitle>
            <span className="flex items-center gap-2 font-bold text-lg">
              <i className="material-symbols-outlined text-indigo-800">
                menu_book
              </i>
              {decreto.nome}
            </span>
          </DialogTitle>
          <Separator />
        </DialogHeader>
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="min-h-0 flex-1 pr-2">
            <div className="flex items-center gap-2 text-lg leading-none pb-2 pt-2">
              <i className="material-symbols-outlined material-symbols-outlined-sized text-indigo-800">
                assignment
              </i>
              <h2 className="text-gray-800 text-xl font-bold leading-none">
                {t("legislacaoPage.decretoDetailModal.executiveSummary")}
              </h2>
            </div>
            <div
              className="p-4 mt-2 rounded-xl bg-blue-50 border border-blue-200 html-rendered-content"
              dangerouslySetInnerHTML={{
                __html: decreto?.resumo_executivo || "",
              }}
            />
            <GlossarySection />
            <Alert variant="warning" className="mt-4">
              <AlertCircleIcon />
              <AlertTitle>
                {t("legislacaoPage.decretoDetailModal.warningTitle")}
              </AlertTitle>
              <AlertDescription>
                {t("legislacaoPage.decretoDetailModal.warningDescription")}
              </AlertDescription>
            </Alert>
            <div className="h-4 shrink-0" aria-hidden />
          </ScrollArea>
          <aside
            className="mt-2 shrink-0 rounded-lg border border-amber-200 bg-amber-50 p-4"
            role="note"
          >
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <AlertCircleIcon className="size-6 shrink-0 self-center text-amber-600" />
              <p className="self-center text-sm font-bold leading-snug text-amber-950">
                {t("legislacaoPage.decretoDetailModal.disclaimerTitle")}
              </p>
              <p className="col-start-2 text-sm font-normal leading-snug text-amber-950/90">
                {t("legislacaoPage.decretoDetailModal.disclaimerBody")}
              </p>
            </div>
          </aside>
        </section>
      </DialogContent>
    </Dialog>
  );
};
