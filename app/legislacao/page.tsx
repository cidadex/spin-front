"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useTranslations } from "next-intl";
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
    <div className="relative w-full min-h-[calc(100svh-60px)] flex flex-col" style={{ zIndex: 1 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="w-full px-6 md:px-10 pt-10 pb-8">
        <p className="text-sm font-medium mb-1" style={{ color: "rgba(236,209,166,0.7)" }}>
          Base Jurídica
        </p>
        <h1 className="text-2xl font-bold text-white">
          {t("legislacaoPage.title")}
        </h1>
        <p className="text-sm mt-2 mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          {t("legislacaoPage.subtitle")}
        </p>
        <LegislacaoHeader />
      </section>

      {/* ── Decretos list ───────────────────────────────────── */}
      <div className="flex-1 px-6 md:px-10 pb-10">
        {/* Toolbar */}
        <div className="flex gap-3 pb-5 flex-wrap items-center justify-between">
          <h2 className="text-white font-semibold text-base leading-none">
            {t("legislacaoPage.historySection.title")}
          </h2>
          <span className="dark text-foreground">
            <InputGroup>
              <InputGroupInput
                type="text"
                value={inputFilterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={t("legislacaoPage.historySection.searchPlaceholder")}
              />
              <InputGroupAddon>
                <span className="material-symbols-outlined text-inherit">search</span>
              </InputGroupAddon>
            </InputGroup>
          </span>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2 pb-4">
          {decretos.map((decreto) => (
            <DecretoListLine key={decreto.uuid} decreto={decreto} />
          ))}
          {fetching &&
            Array(pageSize)
              .fill(null)
              .map((_, i) => <DecretoListItemSkeleton key={`loading_${i}`} />)}
          <div ref={paginationTriggerRef} />
        </div>
      </div>
    </div>
  );
};

const DecretoListItemSkeleton = () => {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-48 h-5" style={{ background: "rgba(255,255,255,0.08)" }} />
        <Skeleton className="w-16 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
      <Skeleton className="w-full h-4 mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />
      <Skeleton className="w-3/4 h-4 mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="flex gap-2">
        <Skeleton className="w-24 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <Skeleton className="w-24 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        <Skeleton className="w-28 h-8 rounded-lg ml-auto" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
    </div>
  );
};
