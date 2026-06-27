"use client";

import { Activity } from "@/components/ui/activity";
import { LegislacaoHeaderCard } from "./LegislacaoHeaderCard";
import { useEffect, useState } from "react";
import { LegislacaoCategory } from "@/types/legislacao";
import { LegislacaoRepository } from "@/repositories/legislacao/LegislacaoRepository";
import { Skeleton } from "@/components/ui/skeleton";

export const LegislacaoHeader = () => {
  const [categories, setCategories] = useState<LegislacaoCategory[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  useEffect(() => {
    const legislacaoRepository = new LegislacaoRepository();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetchingCategories(true);
    legislacaoRepository
      .getLegislacaoCategories()
      .then((response) => {
        const sortedCategories = response.results.sort((a, b) => a.ordem - b.ordem);
        setCategories(sortedCategories);
      })
      .catch(() => {
        // silencia erros (ex: 401 por token expirado)
      })
      .finally(() => {
        setFetchingCategories(false);
      });
  }, []);

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
      <Activity mode={fetchingCategories ? "visible" : "hidden"}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-40 rounded-xl"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
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
  );
};
