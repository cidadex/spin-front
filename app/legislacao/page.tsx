"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useTranslations } from "next-intl";
import { PageMainContentWrapper } from "../components/page-main-content-wrapper/PageMainContentWrapper";
import { PageTitle } from "../components/page-title/PageTitle";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LegislacaoHeader } from "./components/LegislacaoHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { DecretoListItem } from "@/types/calculadora";
import { DecretoListLine } from "./components/DecretoListLine";
import { useDebounce } from "@/hooks/useDebounce";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      {<LegislacaoPage />}
    </ProtectedRoute>
  );
}

const LegislacaoPage = () => {
  const t = useTranslations();

  const [inputFilterText, setFilterText] = useState("");
  const filterText = useDebounce(inputFilterText, 500);

  const [fetching, setFetching] = useState(false);
  const [decretos, setDecretos] = useState<DecretoListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);
  const paginationTriggerRef = useRef<HTMLDivElement | null>(null);

  const getPage = useCallback(
    (pageNumber: number, filter?: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setPage(pageNumber);
      setFetching(true);
      if (pageNumber === 1) {
        setDecretos([]);
      }

      const calculadoraService = CalculadoraService.getInstance();
      calculadoraService
        .listDecretos(
          { page: pageNumber, page_size: pageSize, search: filter },
          abortControllerRef.current.signal
        )
        .then((response) => {
          setTotalPages(Math.ceil(response.count / pageSize));
          setDecretos((current) => [
            ...(pageNumber === 1 ? [] : current),
            ...(response.results || []),
          ]);
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
        })
        .finally(() => {
          setFetching(false);
        });
    },
    [pageSize]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getPage(1, filterText);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [getPage, filterText]);

  useLayoutEffect(() => {
    if (fetching) return;
    if (!paginationTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && page < totalPages) {
          getPage(page + 1, filterText);
        }
      },
      { threshold: 1 }
    );

    observer.observe(paginationTriggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [page, totalPages, fetching, getPage, filterText]);

  return (
    <div className="min-h-screen w-full flex flex-col gap-2">
      <div className="container">
        <PageTitle title={t("legislacaoPage.title")} />
        <LegislacaoHeader />
      </div>
      <PageMainContentWrapper>
        <div className="w-full max-w-full flex flex-col">
          <header className="flex gap-3 pb-6 pt-7 flex-wrap items-center">
            <h2 className="text-gray-900 font-semibold text-xl leading-none">
              {t("legislacaoPage.historySection.title")}
            </h2>
            <span className="dark text-foreground">
              <InputGroup className="bg-gray-600! min-w-[300px] max-w-full">
                <InputGroupInput
                  type="text"
                  value={inputFilterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={t(
                    "legislacaoPage.historySection.searchPlaceholder"
                  )}
                />
                <InputGroupAddon>
                  <span className="material-symbols-outlined text-inherit">
                    search
                  </span>
                </InputGroupAddon>
              </InputGroup>
            </span>
          </header>
          <div className="flex flex-col gap-2 pb-4">
            {decretos.map((decreto) => (
              <DecretoListLine key={decreto.uuid} decreto={decreto} />
            ))}
            {fetching &&
              Array(pageSize)
                .fill(null)
                .map((_, i) => (
                  <DecretoListItemSkeleton key={`loading_${i}`} />
                ))}
            <div ref={paginationTriggerRef} />
          </div>
        </div>
      </PageMainContentWrapper>
    </div>
  );
};

const DecretoListItemSkeleton = () => {
  return (
    <article className="bg-white/30 border group overflow-hidden relative border-gray-400 px-2 py-3 rounded-lg  min-w-full">
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full col-span-2 h-10" />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2 items-center">
        <div className="flex gap-2 py-2">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
        </div>
        <div className="flex gap-2 py-2">
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-full h-8" />
        </div>
        <div className="flex gap-2 justify-end">
          <Skeleton className="w-1/2 h-10" />
        </div>
      </div>
    </article>
  );
};
