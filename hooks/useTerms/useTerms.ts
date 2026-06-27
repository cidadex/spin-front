import { AuthService } from "@/services/auth/AuthService";
import { TermResponse } from "@/types/term";
import { useCallback, useState } from "react";

export const useTerms = () => {
  const [sending, setSending] = useState<boolean>(false);
  const [latestTerms, setLatestTerms] = useState<Array<TermResponse>>([]);
  const [acceptedTerms, setAcceptedTerms] = useState<Array<string>>([]);
  const fetchLatestTerms = useCallback(() => {
    const authService = AuthService.getInstance();
    authService.getLatestTerms().then(setLatestTerms);
  }, []);

  const fetchAcceptanceTerms = useCallback(() => {
    const authService = AuthService.getInstance();
    authService.getAcceptanceTerms().then((terms) => {
      const acceptedTermIds = terms.results.map(
        (acceptance) => acceptance.term.uuid
      );
      setAcceptedTerms(acceptedTermIds);
    });
  }, []);

  const acceptTerm = useCallback(
    async (termUuid: string) => {
      const authService = AuthService.getInstance();
      setSending(true);
      try {
        await authService.acceptTerm(termUuid);
        fetchAcceptanceTerms();
        fetchLatestTerms();
      } catch (error) {
        console.error("Error accepting term:", error);
      } finally {
        setSending(false);
      }
    },
    [fetchAcceptanceTerms, fetchLatestTerms]
  );

  const pendingTerms = latestTerms.filter((term) => {
    return !acceptedTerms.includes(term.uuid);
  });

  return {
    sending,
    pendingTerms,
    acceptTerm,
    fetchLatestTerms,
    fetchAcceptanceTerms,
    latestTerms,
  };
};
