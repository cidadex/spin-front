"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useTranslations } from "next-intl";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LegislacaoRepository } from "@/repositories/legislacao/LegislacaoRepository";
import { LegislacaoConteudo } from "@/types/legislacao";
import { LegislacaoTypeEnum } from "@/types/enums";
import { Skeleton } from "@/components/ui/skeleton";
import { LegislacaoArticleModal } from "./LegislacaoArticleModal";
import { LegislacaoVideoModal } from "./LegislacaoVideoModal";
import { useDebounce } from "@/hooks/useDebounce";

const ReadMoreButton = () => {
  const t = useTranslations();

  return (
    <Button variant="primary" size="sm" className="cursor-pointer" asChild>
      <span className="flex items-center gap-2">
        <span className="leading-none">
          {t("legislacaoPage.modal.article.readMore")}
        </span>
        <span className="text-sm leading-none">
          <i className="material-symbols-outlined material-symbols-outlined-sized">
            arrow_forward
          </i>
        </span>
      </span>
    </Button>
  );
};

const LegislacaoHeaderCardModalListArticleThumbnail = ({
  conteudo,
}: {
  conteudo: LegislacaoConteudo;
}) => {
  if (conteudo.tipo === LegislacaoTypeEnum.Video) {
    return (
      <div
        className="rounded-lg bg-cover bg-center w-[280px] bg-white overflow-hidden"
        style={{
          backgroundImage: conteudo.imagem_capa
            ? `url(${conteudo.imagem_capa})`
            : undefined,
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 min-h-[200px] text-[100px] bg-linear-to-br from-slate-900 via-slate-800/75 to-zinc-900">
          <i className="material-symbols-outlined material-symbols-outlined-sized text-white/75">
            play_circle
          </i>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg bg-cover bg-center w-[280px] bg-white"
      style={{
        backgroundImage: conteudo.imagem_capa
          ? `url(${conteudo.imagem_capa})`
          : undefined,
      }}
    />
  );
};
const LegislacaoHeaderCardModalListArticle = ({
  conteudo,
  categoryTitle,
  categoryIcon,
}: {
  conteudo: LegislacaoConteudo;
  categoryTitle: string;
  categoryIcon: string;
}) => {
  const dateFormatter = useMemo(
    () =>
      Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
    []
  );
  return (
    <div className="bg-gray-50 border border-gray-300 mb-2 rounded-lg p-2 flex items-stretch justify-stretch">
      <LegislacaoHeaderCardModalListArticleThumbnail conteudo={conteudo} />
      <section className="flex-1 self-stretch flex flex-col gap-2 px-4 py-2">
        <h4 className="text-gray-800 font-semibold">{conteudo.titulo}</h4>
        <p className="text-xs text-gray-700 flex-1">{conteudo.resumo}</p>
        <footer className="flex items-center justify-between">
          {conteudo.tag && (
            <Badge variant="primary" className="text-xs">
              {conteudo.tag}
            </Badge>
          )}
          <span className="text-xs text-gray-500">
            {dateFormatter.format(new Date(conteudo.data_publicacao))}
          </span>
          {conteudo.tipo === LegislacaoTypeEnum.Video ? (
            <LegislacaoVideoModal
              article={conteudo}
              categoryIcon={categoryIcon}
              categoryTitle={categoryTitle}
            >
              <ReadMoreButton />
            </LegislacaoVideoModal>
          ) : (
            <LegislacaoArticleModal
              article={conteudo}
              categoryIcon={categoryIcon}
              categoryTitle={categoryTitle}
            >
              <ReadMoreButton />
            </LegislacaoArticleModal>
          )}
        </footer>
      </section>
    </div>
  );
};

const LegislacaoHeaderCardModal = ({
  isOpen,
  onOpenChange,
  categoryIcon,
  categoryTitle,
  categoyUuid,
}: {
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  categoyUuid: string;
  categoryIcon: string;
  categoryTitle: string;
}) => {
  const t = useTranslations();

  const [articles, setArticles] = useState<LegislacaoConteudo[]>([]);
  const [tipo, setTipo] = useState<LegislacaoTypeEnum | undefined>(undefined);
  const [fetchingArticles, setFetchingArticles] = useState(false);

  const [inputFilterText, setFilterText] = useState("");
  const filterText = useDebounce(inputFilterText, 500);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [{ total_artigos, total_videos }, setTotals] = useState({
    total_artigos: 0,
    total_videos: 0,
  });
  const getPageAbortController = useRef<AbortController | null>(null);
  const paginationTriggerRef = useRef<HTMLDivElement | null>(null);

  const getPage = useCallback(
    (
      pageNumber: number,
      {
        tipo,
        search,
      }: {
        tipo?: LegislacaoTypeEnum;
        search: string;
      }
    ) => {
      const legislacaoRepository = new LegislacaoRepository();

      if (getPageAbortController.current) {
        getPageAbortController.current.abort();
      }
      getPageAbortController.current = new AbortController();
      setPage(pageNumber);
      setFetchingArticles(true);
      if (pageNumber === 1) {
        setArticles([]);
      }

      legislacaoRepository
        .getLegislacaoConteudo(
          {
            categoria: categoyUuid,
            page_size: pageSize,
            page: pageNumber,
            tipo,
            search,
          },
          getPageAbortController.current.signal
        )
        .then((response) => {
          setTotalPages(Math.ceil(response.count / pageSize));
          setTotals({
            total_artigos: response.total_artigos,
            total_videos: response.total_videos,
          });
          setArticles((currentList) => {
            return [
              ...(pageNumber === 1 ? [] : currentList),
              ...(response.results || []),
            ];
          });
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            return;
          }
        })
        .finally(() => {
          setFetchingArticles(false);
        });
    },
    [categoyUuid, pageSize]
  );

  useEffect(() => {
    if (!isOpen) {
      if (getPageAbortController.current) {
        getPageAbortController.current.abort();
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setArticles([]);
      setPage(1);
      setTotalPages(1);
      return;
    }
    getPage(1, { tipo, search: filterText });
  }, [getPage, isOpen, tipo, filterText]);

  useLayoutEffect(() => {
    if (fetchingArticles) return;
    if (!paginationTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && page < totalPages) {
          getPage(page + 1, { tipo, search: filterText });
        }
      },
      { threshold: 1 }
    );

    observer.observe(paginationTriggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [page, totalPages, fetchingArticles, getPage, tipo, filterText]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl! h-[90vh] overflow-hidden grid-rows-[auto_1fr]">
        <DialogHeader className="">
          <DialogTitle>
            <span className="flex items-center gap-2 font-bold text-lg">
              <i className="material-symbols-outlined text-indigo-800">
                {categoryIcon}
              </i>
              {categoryTitle}
            </span>
          </DialogTitle>
          <Separator />
          <header className="flex gap-3 pt-4 pb-2 flex-wrap items-center justify-between">
            <h2 className="text-gray-900 font-semibold text-xl leading-none">
              {t("legislacaoPage.historySection.content")}
            </h2>
            <span className="">
              <InputGroup className=" min-w-[300px] max-w-full">
                <InputGroupInput
                  type="text"
                  placeholder={t(
                    "legislacaoPage.historySection.searchPlaceholder"
                  )}
                  value={inputFilterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
                <InputGroupAddon>
                  <span className="material-symbols-outlined text-inherit">
                    search
                  </span>
                </InputGroupAddon>
              </InputGroup>
            </span>
            <ButtonGroup className="rounded-md">
              <Button
                variant={!tipo ? "outline-tertiary-alt" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setTipo(undefined);
                }}
              >
                {t("legislacaoPage.historySection.filters.all", {
                  count: articles.length,
                })}
              </Button>
              <Button
                variant={
                  tipo === LegislacaoTypeEnum.Artigo
                    ? "outline-tertiary-alt"
                    : "outline"
                }
                onClick={() => {
                  setTipo(LegislacaoTypeEnum.Artigo);
                }}
                className="cursor-pointer"
              >
                {t("legislacaoPage.historySection.filters.articles", {
                  count: total_artigos,
                })}
              </Button>
              <Button
                variant={
                  tipo === LegislacaoTypeEnum.Video
                    ? "outline-tertiary-alt"
                    : "outline"
                }
                onClick={() => {
                  setTipo(LegislacaoTypeEnum.Video);
                }}
                className="cursor-pointer"
              >
                {t("legislacaoPage.historySection.filters.videos", {
                  count: total_videos,
                })}
              </Button>
            </ButtonGroup>
          </header>
        </DialogHeader>
        <div className=" overflow-hidden">
          <ScrollArea className="h-full pb-1">
            {articles.map((article, index) => (
              <LegislacaoHeaderCardModalListArticle
                key={index}
                conteudo={article}
                categoryTitle={categoryTitle}
                categoryIcon={categoryIcon}
              />
            ))}
            {fetchingArticles &&
              Array(pageSize)
                .fill(null)
                .map((_, i) => (
                  <Skeleton className="h-50 w-full mb-2" key={`loading_${i}`} />
                ))}
            <div className="h-4" ref={paginationTriggerRef}></div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const LegislacaoHeaderCardContent = ({
  title,
  videoCount,
  articleCount,
  icon,
  backgroundImageUrl,
  onOpenChange,
}: {
  title: string;
  videoCount: number;
  articleCount: number;
  icon: string;
  backgroundImageUrl: string;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}) => {
  const t = useTranslations();
  return (
    <button
      onClick={() => onOpenChange(true)}
      className="bg-white cursor-pointer group flex-1 rounded-lg relative overflow-hidden bg-cover bg-center h-40 border border-gray-400 shadow-none transition-all duration-500 hover:border-purple-400 hover:shadow-lg"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <span className="pointer-events-none absolute top-0 left-0 w-full h-full bg-linear-to-r via-20% to-90%  from-[rgba(96,97,98,0.46)] via-[rgba(35, 30, 62, 0.77)] to-[#332753] group-hover:from-[rgba(255,255,255,0.88)] group-hover:via-white group-hover:to-white transition-all duration-500"></span>
      <section className="absolute pointer-events-none top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white p-4 transition-all duration-500 group-hover:text-gray-900">
        <section className="flex-1 flex flex-col items-center justify-center  pb-1">
          <span className="text-3xl">
            <i className="material-symbols-outlined material-symbols-outlined-sized text-gray-400 group-hover:text-purple-800 transition-all duration-500">
              {icon}
            </i>
          </span>
          <h3 className="font-semibold text-sm text-center">{title}</h3>
          <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-500 transition-all duration-500">
            {t("legislacaoPage.seeMore")}
          </span>
        </section>
        <footer className="border-t w-full border-gray-600 text-gray-500 pt-2 flex items-center justify-between leading-none transition-all duration-500 group-hover:text-gray-900 group-hover:border-purple-300">
          <div className="flex items-center justify-start gap-1">
            <span className="text-md leading-none">
              <i className="material-symbols-outlined material-symbols-outlined-sized transition-all duration-500 group-hover:text-purple-800">
                article
              </i>
            </span>
            <span className="text-xs font-medium">
              {t("legislacaoPage.articlesCount", { count: articleCount })}
            </span>
          </div>
          <div className="flex items-center justify-start gap-1">
            <span className="text-md leading-none">
              <i className="material-symbols-outlined material-symbols-outlined-sized transition-all duration-500 group-hover:text-purple-800">
                slow_motion_video
              </i>
            </span>
            <span className="text-xs font-medium">
              {t("legislacaoPage.videoCount", { count: videoCount })}
            </span>
          </div>
        </footer>
      </section>
    </button>
  );
};

export const LegislacaoHeaderCard = ({
  title,
  videoCount,
  articleCount,
  icon,
  backgroundImageUrl,
  uuid,
}: {
  uuid: string;
  title: string;
  videoCount: number;
  articleCount: number;
  icon: string;
  backgroundImageUrl: string;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <LegislacaoHeaderCardContent
        title={title}
        videoCount={videoCount}
        articleCount={articleCount}
        icon={icon}
        backgroundImageUrl={backgroundImageUrl}
        onOpenChange={(open) => {
          setModalOpen(open);
        }}
      />
      <LegislacaoHeaderCardModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        categoryIcon={icon}
        categoryTitle={title}
        categoyUuid={uuid}
      />
    </>
  );
};
