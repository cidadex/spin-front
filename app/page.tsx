"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { MySpinCard } from "./components/my-spin-card/MySpinCard";
import { NewsCard } from "./components/news-card/NewsCard";
import { PageTitle } from "./components/page-title/PageTitle";
import { PageMainContentWrapper } from "./components/page-main-content-wrapper/PageMainContentWrapper";
import { NumerosSpinCard } from "./components/numeros-spin-card/NumerosSpinCard";
import { RankingCard } from "./components/ranking-card/RankingCard";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Authenticated]}
      redirectTo="/login"
    >
      {<HomePage />}
    </ProtectedRoute>
  );
}

const HomePage = () => {
  const t = useTranslations("homePage");
  const { me } = useAuth();

  return (
    <div className="main-content-min-height w-full flex flex-col gap-4">
      <div className="container">
        <PageTitle
          title={t("title", {
            firstName: me?.first_name || "usuário",
          })}
        />
        <div className="w-full flex flex-wrap items-center justify-center gap-4  px-8">
          <MySpinCard />
        </div>
      </div>
      <div className="text-center pt-5 font-medium leading-none text-sm mb-24">
        {t("controlPanel")}
      </div>
      <PageMainContentWrapper>
        <div className="w-full -mt-30 flex items-start pt-8 gap-4 content-start pb-10 flex-wrap justify-center">
          <NumerosSpinCard />
          <RankingCard />
          <NewsCard />
        </div>
      </PageMainContentWrapper>
    </div>
  );
};
