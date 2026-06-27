import { LegislacaoRepository } from "@/repositories/legislacao/LegislacaoRepository";
import { LegislacaoGlossarioItem } from "@/types/legislacao";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const GlossarySection = () => {
  const t = useTranslations();

  const [items, setItems] = useState<LegislacaoGlossarioItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);
  const paginationTriggerRef = useRef<HTMLDivElement | null>(null);

  const getPage = useCallback(
    (pageNumber: number) => {
      const legislacaoRepository = new LegislacaoRepository();

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setPage(pageNumber);
      setFetching(true);
      if (pageNumber === 1) {
        setItems([]);
      }

      legislacaoRepository
        .getLegislacaoGlossario(
          { page: pageNumber, page_size: pageSize },
          abortControllerRef.current.signal
        )
        .then((response) => {
          setTotalPages(Math.ceil(response.count / pageSize));
          setItems((current) => [
            ...(pageNumber === 1 ? [] : current),
            ...(response.results || []),
          ]);
          setFetching(false);
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            return;
          }
          setFetching(false);
        });
    },
    [pageSize]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getPage(1);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [getPage]);

  useLayoutEffect(() => {
    if (fetching) return;
    if (!paginationTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && page < totalPages) {
          getPage(page + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(paginationTriggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [page, totalPages, fetching, getPage]);

  return (
    <>
      <div className="flex items-center gap-2 text-lg leading-none pt-5 pb-4">
        <i className="material-symbols-outlined material-symbols-outlined-sized text-indigo-800">
          info
        </i>
        <h2 className="text-gray-800 text-xl font-bold leading-none">
          {t("legislacaoPage.glossarySection.title")}
        </h2>
      </div>
      <div className="p-4 mt-2 rounded-xl bg-gray-50 border border-gray-200 flex flex-col gap-3">
        {items.map((item) => (
          <GlossaryTermItem
            key={item.uuid}
            term={item.termo}
            definition={item.definicao}
          />
        ))}
        {fetching &&
          Array(pageSize)
            .fill(null)
            .map((_, i) => (
              <Skeleton className="h-14 w-full" key={`loading_${i}`} />
            ))}
        <div ref={paginationTriggerRef} />
      </div>
    </>
  );
};

export const GlossaryTermItem = ({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) => {
  return (
    <div className="px-2 py-3 bg-white border border-gray-200 flex flex-col gap-1 rounded-lg">
      <h3 className="text-blue-700 text-xs font-bold leading-none">{term}</h3>
      <p className="text-gray-700 text-xs font-normal">{definition}</p>
    </div>
  );
};
