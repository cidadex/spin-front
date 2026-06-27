import { PaginatedResponse } from "../api/api";
import { DecretoStatusEnum } from "../enums";
export interface DecretoListItem {
  uuid: string;
  nome: string;
  data_corte: string;
  pedagio: string;
  pedagio_decimal: number;
  beneficios: Beneficio[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  descricao: string;
  focos: string[];
  resumo_executivo: string;
  comutacao_sobre_cumprido: boolean;
  data_assinatura: string | null;
  data_publicacao: string | null;
  status: DecretoStatusEnum;
}

export interface Beneficio {
  uuid: string;
  nome: string;
  taxa_reducao: string;
  taxa_reducao_decimal: number;
  requisito_temporal: string;
  requisito_temporal_decimal: number;
  ordem: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DecretosListResponse = PaginatedResponse<DecretoListItem>;
