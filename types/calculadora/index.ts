import {
  ApiBaseResponse,
  PaginatedRequest,
  PaginatedResponse,
} from "../api/api";
import {
  ApenadoRegimeAtualEnum,
  CalculationResultEnum,
  CalculationStatusEnum,
  CalculationVariavelEscopoEnum,
  CalculationVariavelTypeEnum,
} from "../enums";
import { ApenadosCreateResponseBase } from "./apenados";
import { ImpeditivosAvaliarLog } from "./impeditivos";
import {
  ProcessResponseCrime,
  ProcessResponseMarcosTemporaisItem,
  SeeuDate,
} from "./seeuReports";

export * from "./seeuReports";
export * from "./apenados";
export * from "./impeditivos";
export * from "./decretos";

export interface CalculadoraCalculateMetadata {
  hoje?: string;
  reducao_arredondamento?: "ceil";
  distribuir_cumprido?: boolean;
  dias_cumpridos_manual?: number;
  penas_para_cumprido?: string[];
  /** F4.3/F4.4: incisos selecionados pelo advogado para variáveis checkbox-group.
   *  Chave = identificador completo da variável (ex: "apenado.condicao_medica").
   *  Valor = array de labels selecionados (ex: ["Inc. I — ...", "Inc. IV — ..."]).
   *  Não enviado ao backend (ignorado); apenas usado na UI do relatório. */
  incisos_selecionados?: Record<string, string[]>;
}
export interface CalculadoraCalculatePayload {
  apenado_id: string;
  decreto_id: string;
  metadata: CalculadoraCalculateMetadata;
}

export interface CalculadoraVariavelPendiente {
  identificador: string;
  escopo: CalculationVariavelEscopoEnum;
  tipo: CalculationVariavelTypeEnum;
  pergunta: string;
  tooltip: string | null;
  seeu: boolean;
  uuid: string;
  ref_id: Array<string> | string;
  opcoes: Array<{ valor: string }>;
}

export interface CalculadoraVariavelRespondida extends CalculadoraVariavelPendiente {
  valor: unknown;
}

export type CalculadoraCalculateResponse = CalculadoraCalculateResponseBase;

export interface CalculadoraGetCalculationMarcosTemporaisDetalhe extends ProcessResponseMarcosTemporaisItem {
  tipo: string;
  motivo: string;
  dias: number;
  porcentagem: number;
}

export type CalculadoraGetCalculationResponseBase = {
  uuid?: string;
  decreto?: string | null;
  status?: CalculationStatusEnum;
  resultado?: CalculationResultEnum | null;
  resultado_detalhado?: CalculadoraCalculateResponseBase;
  apenado: ApenadosCreateResponseBase;
  relatorio?: CalculadoraRelatorioDoCalculo | null;
  metadata: null | CalculadoraCalculateMetadata;
  detalhes_marcos_temporais: {
    total_em_cumprimento: number;
    total_em_liberdade: number;
    marcos: CalculadoraGetCalculationMarcosTemporaisDetalhe[];
  };
};

export type CalculadoraGetCalculationResponse =
  ApiBaseResponse<CalculadoraGetCalculationResponseBase>;

export interface CalculadoraCalculationsSummaryResponseBase {
  total: number;
  elegiveis_indulto: number;
  elegiveis_comutacao: number;
  nao_elegiveis: number;
  pendentes_conclusao: number;
}

export type CalculadoraCalculationsSummaryResponse =
  ApiBaseResponse<CalculadoraCalculationsSummaryResponseBase>;
export interface CalculadoraCalculateResponseCrime {
  crime_id: string;
  dias?: number;
  is_impeditivo?: boolean;
  reducao_dias?: number;
  dias_cumprido?: number;
  dias_restantes?: number;
  reducoes?: unknown[];
  variaveis_pendentes: unknown[];
  variaveis_respondidas: CalculadoraVariavelRespondida[];
}
export interface CalculadoraCalculateResponseBase {
  pedagio_cumprido: boolean;
  missing_decreto_requirements: boolean;
  blocked_by_decreto_requirements: boolean;
  blocked_by_impeditivo_pergunta: boolean;
  impeditivos_check: {
    success: boolean;
    message: string;
    data: {
      decreto_uuid: string;
      decreto_nome: string;
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
      divergencias_hediondidade: Array<{
        condenacao_numero: number;
        tipo: "SEEU_HEDIONDO_SISTEMA_PERMITIU" | "SISTEMA_HEDIONDO_SEEU_OMITIU";
        crime_dispositivo: string;
        crime_diploma: string;
        cumulacao_com: string | null;
        mensagem: string;
      }>;
      log: ImpeditivosAvaliarLog[];
    };
  };
  total_dias: number;
  lowerbound: {
    crimes: CalculadoraCalculateResponseCrime[];
    estatisticas: {
      total_dias: number;
      total_reducao_dias: number;
      total_dias_cumprido: number;
      saldo_dias: number;
    };
  };
  upperbound: {
    crimes: CalculadoraCalculateResponseCrime[];
    estatisticas: {
      total_dias: number;
      total_reducao_dias: number;
      total_dias_cumprido: number;
      saldo_dias: number;
    };
  };
  variaveis_pendentes: CalculadoraVariavelPendiente[];
  variaveis_respondidas: CalculadoraVariavelRespondida[];
  relatorio: CalculadoraRelatorioDoCalculo;
}

export interface CalculadoraRelatorioDoCalculo {
  decreto: {
    uuid: string;
    nome: string;
    data_corte: SeeuDate;
  };
  data_gerado: SeeuDate;
  identificacao: {
    nome: string;
    cpf: string;
    data_nascimento: SeeuDate;
    processos: string[];
  };
  condenacoes: { nome: string; data: SeeuDate; pena: string }[];
  resumo_execucao_unificada: {
    pena_total_unificada: string;
    data_inicio_execucao: SeeuDate;
    regime_inicial: ApenadoRegimeAtualEnum | null;
    regime_atual: ApenadoRegimeAtualEnum;
    tempo_pena_cumprida: number;
    percentual_cumprido: number;
  };
  calculo_tempo_cumprido: {
    data_primeiro_marco: SeeuDate;
    data_referencia: SeeuDate;
    tempo_corrido: number;
    tempo_interrupcao: number;
    dias_cumpridos_manual: number;
    tempo_pena_cumprida: number;
  };
  analise_elegibilidade: {
    crime_impeditivo: boolean;
    percentual_cumprido: number;
    percentual_requerido: number;
    gatilhos_exclusao_absolutos: {
      nao_cumpriu_pedagio: boolean;
      todos_crimes_impeditivos: boolean;
    };
    elegivel_para_indulto: boolean;
    elegivel_para_indulto_motivo: string;
  };
  requer_comprovacao: [];
  processos_excluidos_por_sentenca_posterior: {
    numero_condenacao: string;
    data_sentenca: SeeuDate;
  }[];
  justificativa?: CalculadoraJustificativa | null;
  /** Respostas completas do questionário dinâmico, separadas por escopo e por processo. */
  respostas_questionario?: {
    apenado: CalculadoraVariavelRespondida[];
    crimes: {
      crime_id: string;
      numero_condenacao: string;
      dispositivo: string;
      diploma: string;
      respostas: CalculadoraVariavelRespondida[];
    }[];
  };
}

export interface CalculadoraJustificativaFonte {
  origem: string;
  campo: string;
  valor?: string | number | boolean | null;
  referencia?: string | null;
}

export interface CalculadoraJustificativaNo {
  id: string;
  tipo: string;
  escopo: string;
  crime_id?: string | null;
  resultado: string;
  titulo: string;
  explicacao: string;
  fundamentacao_legal: Record<string, unknown>;
  fonte: CalculadoraJustificativaFonte[];
}

export interface CalculadoraJustificativa {
  conclusao: {
    resultado: string;
    resultado_label: string;
    resumo: string;
    itens_determinantes: string[];
  };
  itens: CalculadoraJustificativaNo[];
}
export interface CalculadoraCalculationsGroupedListItem {
  cpf: string;
  nome: string;
  total_calculations: number;
  latest_created_at: string;
  latest_status: CalculationStatusEnum;
  latest_resultado: CalculationResultEnum | null;
  latest_calculation_uuid: string;
  latest_calculation_created_at: string;
  latest_decreto_uuid: string;
  latest_decreto_nome: string;
}

/** Contagens por status para os filtros da listagem agrupada (mesmos filtros da query). */
export interface CalculadoraCalculationsGroupedListTotais {
  todos: number;
  em_aberto: number;
  concluidos: number;
  cancelados: number;
}

export type CalculadoraCalculationsGroupedStatusGroup =
  keyof CalculadoraCalculationsGroupedListTotais;

export type CalculadoraCalculationsGroupedListResponse =
  PaginatedResponse<CalculadoraCalculationsGroupedListItem> & {
    success?: boolean;
    message?: string;
    totais?: CalculadoraCalculationsGroupedListTotais;
  };

export type CalculadoraCalculationsGroupedListPayload = PaginatedRequest<{
  cpf?: string;
  search?: string;
  created_at_after?: string;
  created_at_before?: string;
  status?: CalculationStatusEnum;
  status_group?: CalculadoraCalculationsGroupedStatusGroup;
}>;

export type CalculadoraCalculationsListPayload = PaginatedRequest<{
  cpf?: string;
  search?: string;
  created_at_after?: string;
  created_at_before?: string;
  status?: CalculationStatusEnum;
}>;

export type CalculadoraCalculationsListItem = {
  uuid: string;
  apenado: string;
  apenado_nome: string;
  created_at: string;
  resultado: CalculationResultEnum | null;
  status: CalculationStatusEnum;
};

export type CalculadoraCalculationsListResponse =
  PaginatedResponse<CalculadoraCalculationsListItem>;

export interface PeticaoDataDados {
  nome_sentenciado: string;
  numero_processo: string;
  regime_atual: ApenadoRegimeAtualEnum;
  pena_total_dias: number;
  decreto_nome: string;
  data_referencia: string;
  pedagio_fracao: string;
  pedagio_cumprido: boolean;
  total_reducao_dias: number;
  condicao_juridica: string;
  crimes_em_execucao: string[];
  crimes_impeditivos: string[];
  crimes_permissivos: string[];
  crimes_contemplados: string[];
  pena_crimes_permissivos: number;
  pena_crimes_impeditivos: number;
  pedagio_valor_dias: number;
  tempo_cumprido: number;
  artigo_aplicavel: string;
  fracao_cumprida: string;
  cidade: string | null;
  estado: string | null;
  advogado_nome: string;
  advogado_oab: string;
  requisitos_especificos: unknown[];
}
export interface PeticaoData {
  dados: PeticaoDataDados;
  peticao_html: string;
  beneficios_aplicados: Array<{
    beneficio_nome: string;
    beneficio_id: string;
    reducao_dias: number;
  }>;
  peticao_completa: boolean;
}

export type GetPetitionDataResponse = ApiBaseResponse<PeticaoData>;

export interface CalculadoraCancelCalculationResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}
