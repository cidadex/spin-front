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
    <div
      className="text-xs leading-none font-medium px-2.5 py-1.5 rounded-md"
      style={{ background: "rgba(99,102,241,0.18)", color: "rgba(165,180,252,0.9)" }}
    >
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
    <article
      className="rounded-xl px-4 py-4 group relative overflow-hidden transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
      }}
    >
      {/* Top row: name + badge */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="material-symbols-outlined text-base leading-none shrink-0"
            style={{ color: "rgba(139,92,246,0.75)" }}
          >
            calculate
          </span>
          <span className="font-bold text-white leading-snug truncate">
            {decreto.nome}
          </span>
        </div>
        <div className="shrink-0">
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
      </div>

      {/* Description */}
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        {decreto.descricao}
      </p>

      {/* Bottom row: dates + focus badges + action */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Dates */}
        <span className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span>
            {t("legislacaoPage.decretoListItem.signatureDate", {
              date: signatureDate ? dateFormatter.format(signatureDate) : "—",
            })}
          </span>
          <Separator orientation="vertical" className="h-3 opacity-30" />
          <span>
            {t("legislacaoPage.decretoListItem.publicationDate", {
              date: publicationDate ? dateFormatter.format(publicationDate) : "—",
            })}
          </span>
        </span>

        {/* Focus badges */}
        {decreto.focos.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {decreto.focos.map((foco) => (
              <DecretoListItemFocusBadge key={foco} label={foco} />
            ))}
          </div>
        )}

        {/* View details button — pushed to the right */}
        <div className="ml-auto">
          <DecretoListItemModal
            trigger={
              <DecretoDetailModal decreto={decreto}>
                <Button variant="outline" className="cursor-pointer" size="sm">
                  <i className="material-symbols-outlined material-symbols-outlined-sized text-blue-400">
                    description
                  </i>
                  {t("legislacaoPage.decretoListItem.viewDetails")}
                </Button>
              </DecretoDetailModal>
            }
          />
        </div>
      </div>

      {/* Left accent bar on hover */}
      <span className="absolute top-0 left-0 h-full w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: "rgba(139,92,246,0.6)" }}
      />
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
