/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeftIcon, ChevronRightIcon, MoveRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { SpinCardTitle } from "../spin-card-title/SpinCardTitle";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LegislacaoConteudoDetalhado,
  LegislacaoNoticia,
} from "@/types/legislacao";
import { LegislacaoRepository } from "@/repositories/legislacao/LegislacaoRepository";
import { Skeleton } from "@/components/ui/skeleton";

type NewsPaginationItemProps = {
  active?: boolean;
};

const NewsPaginationItem = ({ active = false }: NewsPaginationItemProps) => {
  return (
    <span
      className={`rounded-full h-1.5 ${active ? "bg-primary w-5" : "bg-gray-300 w-1.5"}`}
    />
  );
};

export const NewsCard = () => {
  const t = useTranslations("homePage.newsCard");

  const [news, setNews] = useState<LegislacaoNoticia[]>([]);
  const [fetching, setFetching] = useState(false);
  const [pageSize] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const legislacaoRepository = new LegislacaoRepository();
      setFetching(true);
      try {
        const response = await legislacaoRepository.getLegislacaoNoticias(
          {
            page: 1,
            page_size: pageSize,
          },
          undefined
        );
        setNews(response.results);
      } catch {
        setNews([]);
      }
      setFetching(false);
    };

    fetchData();
  }, [pageSize]);

  return (
    <Card className="flex-1 pt-0 gap-1">
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
      <CardContent className="h-full px-2">
        {news.length === 0 && !fetching && (
          <div className="w-full h-full flex items-center justify-center min-w-[250px] min-h-[250px] p-4">
            <span className="text-gray-500 text-sm">{t("noNews")}</span>
          </div>
        )}
        {fetching && (
          <div className="flex flex-col gap-2">
            <Skeleton className="w-full h-32 rounded-t-lg" />
            <Skeleton className="w-full h-8 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <div className="flex items-center justify-between">
              <Skeleton className="w-20 h-6 rounded" />
              <Skeleton className="w-16 h-6 rounded" />
              <Skeleton className="w-20 h-6 rounded" />
            </div>
          </div>
        )}
        {!fetching && news.length > 0 && (
          <NewsCardItem newsItem={news[currentIndex]} />
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Separator />
        <div className="flex gap-4 justify-between">
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            disabled={news.length === 0}
            onClick={() => {
              setCurrentIndex((currentIndex) => {
                const finalIndex = currentIndex - 1;
                if (finalIndex < 0) {
                  return news.length - 1;
                }
                return finalIndex;
              });
            }}
          >
            <ChevronLeftIcon />
          </Button>
          <div className="flex gap-2 items-center justify-center">
            {news.map((item, index) => {
              return (
                <NewsPaginationItem
                  key={item.uuid}
                  active={index === currentIndex}
                />
              );
            })}
          </div>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            disabled={news.length === 0}
            onClick={() => {
              setCurrentIndex((currentIndex) => {
                const finalIndex = currentIndex + 1;
                if (finalIndex >= news.length) {
                  return 0;
                }
                return finalIndex;
              });
            }}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export const NewsCardItem = ({ newsItem }: { newsItem: LegislacaoNoticia }) => {
  const dateFormattter = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);
  const t = useTranslations("homePage.newsCard");
  return (
    <>
      <div
        className="h-32 mb-4 mt-1 rounded-t-lg bg-cover bg-no-repeat bg-center bg-gray-100"
        style={{
          backgroundImage: newsItem.imagem_capa
            ? `url('${newsItem.imagem_capa}')`
            : ``,
        }}
      ></div>
      <article className="flex flex-col gap-2 px-4">
        <header className="flex gap-4 items-center pb-4">
          <h2 className="font-bold text-md flex-1">{newsItem.titulo}</h2>
        </header>
      </article>
      <CardDescription className="px-4 h-30 overflow-hidden text-ellipsis relative">
        {newsItem.resumo}
        <div className="absolute w-full left-0 bottom-0 h-20 bg-linear-to-t from-white to-transparent" />
      </CardDescription>
      <CardDescription className="flex px-4 py-1 gap-2 mt-2 items-center justify-between">
        <div className="flex-1">
          <Badge variant="primary" className="uppercase rounded">
            {newsItem.tag || "-"}
          </Badge>
        </div>
        <span className="text-center text-[11px] text-gray-500 flex-1">
          {dateFormattter.format(new Date(newsItem.data_publicacao))}
        </span>
        <div className="flex-1 flex justify-end">
          <NewsDetailDialog noticiaUuid={newsItem.uuid}>
            <Button variant="secondary" className="text-primary cursor-pointer">
              {t("readMore")}
              <MoveRightIcon />
            </Button>
          </NewsDetailDialog>
        </div>
      </CardDescription>
    </>
  );
};

export const NewsDetailDialog = ({
  noticiaUuid,
  children,
}: PropsWithChildren<{
  noticiaUuid: string;
}>) => {
  const t = useTranslations("homePage.newsCard");

  const [noticiaDetalhada, setNoticiaDetalhada] =
    useState<LegislacaoConteudoDetalhado | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [open, setOpen] = useState(false);

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const legislacaoRepository = new LegislacaoRepository();
      try {
        setFetchingDetail(true);
        const response =
          await legislacaoRepository.getLegislacaoNoticiaByUuid(noticiaUuid);
        setNoticiaDetalhada(response.data);
      } catch {
        setNoticiaDetalhada(null);
      } finally {
        setFetchingDetail(false);
      }
    };
    if (open) {
      fetchData();
    }
  }, [noticiaUuid, open]);

  return (
    <Dialog open={open} onOpenChange={(openState) => setOpen(openState)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="px-0 w-full max-w-4xl!">
        <DialogTitle className="border-b px-4 pb-2 flex items-center gap-2 font-bold">
          <span className="material-symbols-outlined leading-none! material-symbols-outlined-sized text-indigo-800">
            newspaper
          </span>
          {t("title")}
        </DialogTitle>
        <div className="overflow-hidden h-[70vh]">
          <ScrollArea className="h-full ">
            <div className="px-4 py-2 text-xs">
              {fetchingDetail && (
                <div className="flex flex-col gap-2">
                  <Skeleton className="w-full h-32 rounded-t-lg" />
                  <Skeleton className="w-full h-8 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                  <Skeleton className="w-full h-4 rounded" />
                </div>
              )}
              {!fetchingDetail && noticiaDetalhada?.imagem_capa && (
                <img
                  src={noticiaDetalhada?.imagem_capa || ""}
                  alt={noticiaDetalhada?.titulo}
                  className="w-full h-auto rounded-lg mb-4 max-h-[50svh] object-contain"
                />
              )}
              {!fetchingDetail && (
                <>
                  <header className="flex items-baseline gap-2">
                    <h2 className="font-semibold text-gray-800 text-xl leading-none">
                      {noticiaDetalhada?.titulo}
                    </h2>
                    <span className="text-gray-500 text-[11px]">
                      {noticiaDetalhada?.data_publicacao
                        ? dateFormatter.format(
                            new Date(noticiaDetalhada?.data_publicacao)
                          )
                        : ""}
                    </span>
                  </header>
                  <div className="pt-2 pb-4">
                    <Badge variant="primary" className="uppercase rounded">
                      {noticiaDetalhada?.tag || "-"}
                    </Badge>
                  </div>
                  <div
                    className="html-rendered-content"
                    dangerouslySetInnerHTML={{
                      __html: noticiaDetalhada?.conteudo || "",
                    }}
                  />
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
