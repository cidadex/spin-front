import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TermTypeEnum } from "@/types/enums";
import { TermResponse } from "@/types/term";
import { useTranslations } from "next-intl";
import { useState } from "react";

export const TermButton = ({ term }: { term: TermResponse }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="cursor-pointer" variant="outline">
            <div className="text-lg whitespace-nowrap leading-none">
              {term.type === TermTypeEnum.Use ? (
                <span className="material-symbols-outlined material-symbols-outlined-sized text-blue-500">
                  description
                </span>
              ) : (
                <span className="material-symbols-outlined material-symbols-outlined-sized text-purple-500">
                  calculate
                </span>
              )}
            </div>
            {term.type === TermTypeEnum.Use
              ? t("terms.useTerm")
              : t("terms.privacyPolicy")}
          </Button>
        </DialogTrigger>
        <ModalTermModal term={term} />
      </Dialog>
    </>
  );
};
export const ModalTermModal = ({
  term,
  canAccept = false,
  onAccept,
}: {
  term: TermResponse;
  canAccept?: boolean;
  onAccept?: () => Promise<void>;
}) => {
  const [accepting, setAccepting] = useState(false);
  const [checked] = useState(true);
  const t = useTranslations();

  return (
    <>
      <DialogContent
        className="w-full max-w-4xl! overflow-hidden px-0 pt-0"
        showCloseButton={!canAccept}
      >
        <DialogTitle className="border-b border-white/10 pt-6 pb-4 px-6 bg-[#152030] flex items-center gap-2">
          <span className="material-symbols-outlined material-symbols-outlined-sized text-[#ECD1A6]">
            docs
          </span>
          {term.type === TermTypeEnum.Use
            ? t("terms.useTerm")
            : t("terms.privacyPolicy")}
        </DialogTitle>
        <div className="overflow-hidden h-[70vh]">
          <ScrollArea className="h-full ">
            <div className="px-6 py-2 text-xs">
              <div
                className="bg-gray-50 border-gray-200 border rounded-lg p-4 html-rendered-content"
                dangerouslySetInnerHTML={{ __html: term.content }}
              ></div>
            </div>
          </ScrollArea>
        </div>
        {canAccept && (
          <DialogFooter>
            <div className="flex flex-col gap-4 w-full px-6">
              <div className="flex items-center gap-4">
                <div className="text-green-700 bg-green-100 flex-1 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  <p className="leading-none text-sm font-medium">
                    {t("terms.acceptMessage")}
                  </p>
                </div>
                <Button
                  className="cursor-pointer"
                  variant="success"
                  disabled={accepting || !checked}
                  onClick={async () => {
                    setAccepting(true);
                    await onAccept?.();
                    setAccepting(false);
                  }}
                >
                  {t("terms.acceptButtonText")}
                  <span className="material-symbols-outlined">
                    arrow_right_alt
                  </span>
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </>
  );
};
