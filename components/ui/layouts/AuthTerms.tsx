import { useEffect } from "react";
import { useTerms } from "@/hooks/useTerms/useTerms";
import { Dialog } from "../dialog";
import { ModalTermModal } from "@/app/components/terms";

export const AuthTerms = () => {
  const { pendingTerms, acceptTerm, fetchLatestTerms, fetchAcceptanceTerms } =
    useTerms();

  const firstTerm = pendingTerms[0];

  useEffect(() => {
    fetchLatestTerms();
  }, [fetchLatestTerms]);

  useEffect(() => {
    fetchAcceptanceTerms();
  }, [fetchAcceptanceTerms]);

  if (!firstTerm) {
    return null;
  }
  return (
    <Dialog open defaultOpen>
      <ModalTermModal
        term={firstTerm}
        canAccept
        onAccept={() => acceptTerm(firstTerm.uuid)}
      />
    </Dialog>
  );
};
