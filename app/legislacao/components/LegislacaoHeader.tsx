"use client";

import { useTranslations } from "next-intl";
import { Activity } from "@/components/ui/activity";
import { SpinCardTitle } from "../../components/spin-card-title/SpinCardTitle";
import { LegislacaoHeaderCard } from "./LegislacaoHeaderCard";
import { useEffect, useState } from "react";
import { LegislacaoCategory } from "@/types/legislacao";
import { LegislacaoRepository } from "@/repositories/legislacao/LegislacaoRepository";
import { Skeleton } from "@/components/ui/skeleton";

export const LegislacaoHeader = () => {
  const t = useTranslations();

  const [categories, setCategories] = useState<LegislacaoCategory[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  useEffect(() => {
    const legislacaoRepository = new LegislacaoRepository();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchingCategories(true);
    legislacaoRepository.getLegislacaoCategories().then((response) => {
      const sortedCategories = response.results.sort(
        (a, b) => a.ordem - b.ordem
      );
      setCategories(sortedCategories);
      setFetchingCategories(false);
    });
  }, []);

  return (
    <div className="relative pb-9">
      <div className="w-full flex flex-wrap gap-4  px-8">
        <div className="flex-1 flex-col flex border-gray-300 border bg-white/35 rounded-2xl shadow max-w-full">
          <SpinCardTitle title={t("legislacaoPage.subtitle")} centered />
          <div className="flex gap-2 p-4">
            <Activity mode={fetchingCategories ? "visible" : "hidden"}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="flex-1 h-40" />
              ))}
            </Activity>
            {categories.map((category) => (
              <LegislacaoHeaderCard
                key={category.uuid}
                uuid={category.uuid}
                title={category.nome}
                videoCount={category.videos_count}
                articleCount={category.artigos_count}
                icon={category.icone}
                backgroundImageUrl={category.imagem_capa}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
