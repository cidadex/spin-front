import {
  ProcessResponseCrime,
  ProcessResponseIdentificacao,
} from "./seeuReports";

export type ImpeditivosAvaliarPayload = {
  decreto: "2024";
  identificacao: Pick<
    ProcessResponseIdentificacao,
    "nome" | "cpf" | "data_nascimento"
  >;
  crimes: Array<ProcessResponseCrime>;
};

export interface ImpeditivosAvaliarLog {
  timestamp: string;
  tipo: string;
  etapa?: string;
  descricao: string;
  detalhes?: Record<string, unknown>;
}

export interface ImpeditivosAvaliarResponse {
  decreto: "2024";
  log: ImpeditivosAvaliarLog[];
  crimes_impedidos: Array<{
    condenacao_numero: number;
    crime_principal: ProcessResponseCrime;
    crime_cumulativo?: ProcessResponseCrime;
    crime_impeditivo: {
      id: string;
      descricao: string;
      categoria: string;
    };
    razao: string;
    detalhes?: Record<string, unknown>;
    log_decisao: ImpeditivosAvaliarLog[];
  }>;
  crimes_indultaveis: Array<{
    condenacao_numero: number;
    crime_principal: ProcessResponseCrime;
    crime_cumulativo?: ProcessResponseCrime;
    crime_impeditivo: {
      id: string;
      descricao: string;
      categoria: string;
    };
    razao: string;
    detalhes?: Record<string, unknown>;
    log_decisao: ImpeditivosAvaliarLog[];
  }>;
  crimes_com_perguntas: Array<{
    condenacao_numero: number;
    crime_principal: ProcessResponseCrime;
    crime_cumulativo?: ProcessResponseCrime;
    crime_impeditivo: {
      id: string;
      descricao: string;
      categoria: string;
    };
    razao: string;
    detalhes?: Record<string, unknown>;
    log_decisao: ImpeditivosAvaliarLog[];
    pergunta: {
      id: string;
      pergunta: string;
      tipo_input: string;
      resposta_bloqueadora: boolean;
      contexto: string;
    };
  }>;
}
