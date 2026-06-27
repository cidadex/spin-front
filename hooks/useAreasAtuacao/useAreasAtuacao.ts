import { ClientRepository } from "@/repositories/client/ClientRepository";
import { useCallback, useState } from "react";

export const useAreasAtuacao = () => {
  const [fetching, setFetching] = useState(false);
  const [areasAtuacao, setAreasAtuacao] = useState<
    Array<{ uuid: string; name: string }>
  >([]);

  const fetchAreasAtuacao = useCallback(async () => {
    setFetching(true);
    try {
      const clientRepository = new ClientRepository();
      const allAreasAtuacao: Array<{ uuid: string; name: string }> = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await clientRepository.getAreasAtuacao({ page });

        const pageData = response.results;

        if (pageData && pageData.length > 0) {
          allAreasAtuacao.push(...pageData);
          page++;

          hasMorePages = response.next !== null;
        } else {
          hasMorePages = false;
        }
      }

      setAreasAtuacao(allAreasAtuacao);
    } catch (error) {
      console.error("Erro ao buscar areas de atuação:", error);
    } finally {
      setFetching(false);
    }
  }, []);

  return {
    areasAtuacao,
    fetchingAreasAtuacao: fetching,
    fetchAreasAtuacao,
  };
};
