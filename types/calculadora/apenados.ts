import {
  ApiBaseResponse,
  PaginatedRequestParams,
  PaginatedResponse,
} from "../api/api";
import {
  ApenadoRegimeAtualEnum,
  CalculationResultEnum,
  CalculationStatusEnum,
} from "../enums";
import {
  ProcessResponseCrime,
  ProcessResponseMarcosTemporaisItem,
  ProcessResponseRawData,
  SeeuDate,
} from "./seeuReports";

export type ApenadosCreatePayload = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  numero_unico: string;
  regime_atual: string;
  status_execucao?: "ATIVO" | "EXTINTO" | null;
  total_dias_remidos?: number | null;
  raw_data: ProcessResponseRawData;
  crimes: Array<ProcessResponseCrime>;
  marcos_temporais: Array<ProcessResponseMarcosTemporaisItem>;
  variaveis: Record<string, unknown>;
  seeu_emission_date?: string | null;
  decreto_uuid?: string;
};

export type ApenadosUpdatePayload = {
  variaveis: Record<string, unknown>;
};

export type ApenadosUpdateVariaveisPayload = {
  variaveis: Record<string, unknown>;
  crimes: Array<{
    uuid: string;
    variaveis: Record<string, unknown>;
  }>;
};
export interface ApenadosMarcoTemporal {
  uuid: string;
  evento: string;
  data: string;
  cumprindo_pena: boolean;
}

export type ApenadosCreateResponseBase = {
  uuid: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  numero_unico: string;
  regime_atual: ApenadoRegimeAtualEnum | null;
  status_execucao: "ATIVO" | "EXTINTO" | null;
  total_dias_remidos: number | null;
  pena_total_dias: number;
  data_inicio_pena: string | null;
  tempo_cumprido_dias: number | null;
  total_crimes: number;
  raw_data: Record<string, unknown>;
  transformed_data: {
    calculos_pena: Record<string, unknown>;
    identificacao: Record<string, unknown>;
  };
  variaveis: Record<string, unknown>;
  marcos_temporais: Array<ApenadosMarcoTemporal>;
  crimes: Array<{
    uuid: string;
    numero_condenacao: string;
    dispositivo: string;
    diploma: string;
    data_cometimento: SeeuDate;
    data_sentenca: string | null;
    data_transito_julgado: string | null;
    pena_anos: number;
    pena_meses: number;
    pena_dias: number;
    pena_total_dias: number;
    com_violencia_ou_grave_ameaca: boolean;
    resultado_morte: boolean;
    reincidente_comum: boolean;
    reincidente_especifico: boolean;
    comando_organizacao_criminosa: boolean;
    hediondo_linha_tempo: boolean | null;
    regime_inicial: string | null;
    extinto: boolean;
    indultado: boolean;
    comutado: boolean;
    cumulacao: string | null;
    observacao: string | null;
    variaveis: Record<string, unknown> | null;
  }>;
  calculations: Array<{
    uuid: string;
    status: CalculationStatusEnum;
    resultado: CalculationResultEnum | null;
    decreto: string | null;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type ApenadosCreateResponse =
  ApiBaseResponse<ApenadosCreateResponseBase>;

export type ApenadoDetalhe = ApenadosCreateResponseBase;
export type GetApenadoByUuidResponse = ApiBaseResponse<ApenadoDetalhe>;
export type ListApenadosParams = PaginatedRequestParams & {
  search?: string;
  regime_atual?: ApenadoRegimeAtualEnum;
};

export type ApenadosListApenadoCalculation = {
  uuid: string;
  status: CalculationStatusEnum;
  resultado: CalculationResultEnum | null;
  decreto: string | null;
  created_at: string;
};

export type ApenadosListApenado = {
  uuid: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  numero_unico: string;
  regime_atual: ApenadoRegimeAtualEnum | null;
  pena_total_dias: number;
  data_inicio_pena: string | null;
  tempo_cumprido_dias: number | null;
  total_crimes: number;
  calculations: Array<ApenadosListApenadoCalculation>;
  created_at: string;
  is_active: boolean;
};

export type ApenadosListResponse = PaginatedResponse<ApenadosListApenado>;

export type ApenadosListMetadataResponse = ApiBaseResponse<{
  total_apenados: number;
  media_crimes_por_apenado: number;
  pena_media_por_apenado_anos: number;
}>;
