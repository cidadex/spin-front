"use client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations("notFoundPage");
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          404 - {t("title")}
        </h1>
        <p className="mt-4 text-zinc-500 dark:text-zinc-400">
          {t("description")}
        </p>
        <Button
          onClick={() => {
            router.push("/");
          }}
          data-testid="back-to-home-button"
        >
          {t("backToHome")}
        </Button>
      </main>
    </div>
  );
}
