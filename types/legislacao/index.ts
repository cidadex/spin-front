import {
  ApiBaseResponse,
  PaginatedRequest,
  PaginatedResponse,
} from "../api/api";
import { LegislacaoTypeEnum } from "../enums";

export interface LegislacaoCategory {
  uuid: string;
  nome: string;
  icone: string;
  imagem_capa: string;
  ordem: number;
  artigos_count: number;
  videos_count: number;
}

export interface LegislacaoConteudo {
  uuid: string;
  categoria: string;
  titulo: string;
  resumo: string;
  imagem_capa: string | null;
  tipo: LegislacaoTypeEnum;
  video_url: string;
  data_publicacao: string;
  ordem: number;
  tag: string;
}

export interface LegislacaoConteudoDetalhado extends LegislacaoConteudo {
  conteudo: string;
}

export type GetLegislacaoCategoriesResponse =
  PaginatedResponse<LegislacaoCategory>;

export type GetLegislacaoConteudoPayload = PaginatedRequest<{
  categoria?: string;
  search?: string;
  tipo?: LegislacaoTypeEnum;
}>;

export type GetLegislacaoConteudoResponse = PaginatedResponse<
  LegislacaoConteudo,
  {
    total_artigos: number;
    total_videos: number;
  }
>;

export type GetLegislacaoConteudoDetalhadoResponse =
  ApiBaseResponse<LegislacaoConteudoDetalhado>;

export type LegislacaoGlossarioItem = {
  uuid: string;
  termo: string;
  definicao: string;
  ordem: number;
};

export type GetLegislacaoGlossarioResponse =
  PaginatedResponse<LegislacaoGlossarioItem>;

export type GetLegislacaoGlossarioPayload = PaginatedRequest;

export interface LegislacaoNoticia {
  uuid: string;
  titulo: string;
  resumo: string;
  imagem_capa: string | null;
  tag: string;
  data_publicacao: string;
}

export interface LegislacaoNoticiaDetalhada extends LegislacaoNoticia {
  conteudo: string;
}

export type GetLegislacaoNoticiasResponse =
  PaginatedResponse<LegislacaoNoticia>;

export type GetLegislacaoNoticiasPayload = PaginatedRequest;

export type GetLegislacaoNoticiaDetalhadaResponse =
  ApiBaseResponse<LegislacaoNoticiaDetalhada>;
