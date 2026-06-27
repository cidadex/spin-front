"use client";
import { PropsWithChildren, useState } from "react";
import { Activity } from "@/components/ui/activity";
import { NovoCalculoStepperSidebar } from "./components/NovoCalculoStepperSidebar";
import Image from "next/image";
import logoSrc from "../../../public/logo-header.svg";
import { Button } from "@/components/ui/button";
import { CalculadoraService } from "@/services/calculadora/CalculadoraService";
import { showCalculoCancelSuccessToast } from "@/lib/toast/showCalculoCancelSuccessToast";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NovoCalculoStepperRightSidebar } from "./components/NovoCalculoStepperRightSidebar";
import { NovoCalculoContextProvider } from "@/contexts/novo-calculo/Provider";
import { shouldHideSidebars } from "@/lib/route-config";

export default function NovoCalculoLayout({ children }: PropsWithChildren) {
  const path = usePathname();
  const shouldShowSidebar = !shouldHideSidebars(path);

  return (
    <NovoCalculoContextProvider>
      <div className="flex flex-col min-h-svh max-h-svh" style={{ background: "linear-gradient(180deg, #071421 0%, #0d1d30 100%)" }}>
        <NovoCalculoHeader />
        <div className="flex-1 flex relative min-w-full overflow-y-hidden">
          <Activity mode={shouldShowSidebar ? "visible" : "hidden"}>
            <aside className="flex flex-col w-3xs border-r border-white/8 bg-[#1c2a39] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
              <NovoCalculoStepperSidebar />
            </aside>
          </Activity>
          <div className="flex-1 flex px-8 pt-8 pb-6 overflow-y-auto max-h-full [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
            {children}
          </div>
          <Activity mode={shouldShowSidebar ? "visible" : "hidden"}>
            <aside className="flex flex-col w-3xs border-l border-white/8 bg-[#1c2a39] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
              <NovoCalculoStepperRightSidebar />
            </aside>
          </Activity>
        </div>
      </div>
    </NovoCalculoContextProvider>
  );
}

export const NovoCalculoHeader = () => {
  const commonT = useTranslations("common");
  const { push } = useRouter();
  return (
    <header className="flex backdrop-blur-md bg-[#071421]/80 border-b border-white/8 items-center">
      <section className="w-3xs px-4">
        <Button
          variant="ghost"
          className="cursor-pointer text-white hover:text-white hover:bg-white/10"
          onClick={() => {
            const calculadoraService = CalculadoraService.getInstance();
            calculadoraService.clearTempCalculationData();
            push("/");
          }}
        >
          <i className="material-symbols-outlined">chevron_left</i>
          {commonT("back")}
        </Button>
      </section>
      <section className="flex-1 flex items-center justify-center py-3">
        <Image src={logoSrc} alt="Spin Logo" className="h-6 w-auto brightness-0 invert" />
      </section>
      <section className="w-3xs px-4 flex items-center justify-center">
        <CancelCalculoDialog />
      </section>
    </header>
  );
};

export const CancelCalculoDialog = () => {
  const t = useTranslations("calculo.novoCalculo");
  const { push } = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link-destructive" className="cursor-pointer">
          {t("cancel")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="hidden">
          {t("cancelCalculoDialog.title")}
        </DialogTitle>
        <div className="flex flex-col py-4 gap-2 items-center">
          <div className="text-3xl">
            <i className="material-symbols-outlined material-symbols-outlined-sized text-muted-foreground">
              error
            </i>
          </div>
          <div className="flex flex-col">
            <strong className="text-center font-bold text-foreground">
              {t("cancelCalculoDialog.title")}
            </strong>
            <p className="text-muted-foreground text-sm text-center font-medium">
              {t("cancelCalculoDialog.description")}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="cursor-pointer"
          >
            {t("cancelCalculoDialog.goBackToCalculo")}
          </Button>
          <Button
            onClick={() => {
              const calculadoraService = CalculadoraService.getInstance();
              void calculadoraService
                .cancelTempSeeuResponse()
                .then((result) => {
                  if (result?.success) {
                    showCalculoCancelSuccessToast(
                      result.message?.trim() ||
                        t("cancelCalculoDialog.successToastFallback"),
                      { dismissLabel: t("cancelCalculoDialog.closeToast") }
                    );
                  }
                })
                .finally(() => {
                  push("/");
                });
            }}
            variant="destructive"
            className="cursor-pointer"
          >
            {t("cancelCalculoDialog.yesCancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
