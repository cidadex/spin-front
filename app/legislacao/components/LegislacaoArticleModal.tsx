import { Badge } from "@/components/ui/badge";
import { Activity } from "@/components/ui/activity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LegislacaoRepository } from "@/repositories/legislacao/LegislacaoRepository";
import {
  LegislacaoConteudo,
  LegislacaoConteudoDetalhado,
} from "@/types/legislacao";
import { useTranslations } from "next-intl";
import {
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";

export const LegislacaoArticleModal = ({
  children,
  article,
  categoryTitle,
  categoryIcon,
}: PropsWithChildren<{
  article: LegislacaoConteudo;
  categoryTitle: string;
  categoryIcon: string;
}>) => {
  const [open, setOpen] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [detail, setDetail] = useState<LegislacaoConteudoDetalhado | null>(
    null
  );
  const t = useTranslations();
  const dateFormatter = useMemo(
    () =>
      Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
    []
  );

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      setFetchingDetail(true);
      const legislacaoRepository = new LegislacaoRepository();
      const detail = await legislacaoRepository.getLegislacaoConteudoByUuid(
        article.uuid
      );

      setDetail(detail.data);
      setFetchingDetail(false);
    };

    fetchData();
  }, [open, article.uuid]);

  return (
    <Dialog open={open} onOpenChange={(openState) => setOpen(openState)}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-4xl! h-[90vh] overflow-hidden grid-rows-[auto_1fr] gap-2">
        <DialogHeader className="pb-1">
          <DialogTitle>
            <span className="flex items-center gap-2 font-bold text-lg">
              <i className="material-symbols-outlined text-[#ECD1A6]">
                {categoryIcon}
              </i>
              {categoryTitle}
            </span>
          </DialogTitle>
          <Separator />
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              <i className="material-symbols-outlined material-symbols-outlined-sized">
                chevron_left
              </i>
              {t("common.back")}
            </Button>
          </div>
        </DialogHeader>
        <section className="overflow-hidden">
          <ScrollArea className="h-full pr-2">
            <Activity mode={fetchingDetail ? "visible" : "hidden"}>
              <div className="flex flex-col gap-4">
                <Skeleton className="w-full h-[200px] rounded-lg" />
                <div className="flex justify-between items-baseline">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
                <Skeleton className="h-4 w-10" />
                {Array.from({ length: 50 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-full" />
                ))}
              </div>
            </Activity>
            <Activity mode={!fetchingDetail && detail ? "visible" : "hidden"}>
              {detail?.imagem_capa && (
                <div
                  className="rounded-lg bg-cover bg-center h-screen max-h-[200px] mb-4 w-full bg-primary"
                  style={{
                    backgroundImage: detail.imagem_capa
                      ? `url(${detail.imagem_capa})`
                      : undefined,
                  }}
                />
              )}
              <section className="flex justify-between items-baseline mb-4">
                <h1 className="text-gray-800 text-2xl font-semibold leading-none">
                  {detail?.titulo}
                </h1>
                <span className="text-xs text-gray-500 font-normal leading-none breaking-keep whitespace-nowrap">
                  {detail?.data_publicacao
                    ? dateFormatter.format(new Date(detail.data_publicacao))
                    : ""}
                </span>
              </section>
              {detail?.tag && (
                <div className="pb-4">
                  <Badge variant="primary" className="text-xs">
                    {detail?.tag}
                  </Badge>
                </div>
              )}
              <div
                className="html-rendered-content"
                dangerouslySetInnerHTML={{ __html: detail?.conteudo || "" }}
              />
            </Activity>
          </ScrollArea>
        </section>
      </DialogContent>
    </Dialog>
  );
};
