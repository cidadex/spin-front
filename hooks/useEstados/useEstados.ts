import { ClientRepository } from "@/repositories/client/ClientRepository";
import { useCallback, useState } from "react";

export const useEstados = () => {
  const [fetching, setFetching] = useState(false);
  const [estados, setEstados] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const fetchEstados = useCallback(async () => {
    setFetching(true);
    try {
      const clientRepository = new ClientRepository();
      const estadosData = await clientRepository.getEstados();
      setEstados(estadosData);
    } catch (error) {
      console.error("Erro ao buscar estados:", error);
    } finally {
      setFetching(false);
    }
  }, []);

  return {
    estados,
    fetchingEstados: fetching,
    fetchEstados,
  };
};
