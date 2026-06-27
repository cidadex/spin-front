import { ApiClient } from "@/services/api/ApiClient";
import {
  GetLegislacaoCategoriesResponse,
  GetLegislacaoConteudoDetalhadoResponse,
  GetLegislacaoConteudoPayload,
  GetLegislacaoConteudoResponse,
  GetLegislacaoGlossarioPayload,
  GetLegislacaoGlossarioResponse,
} from "@/types/legislacao";

export class LegislacaoRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  getLegislacaoCategories() {
    return this.apiClient.get<GetLegislacaoCategoriesResponse>(
      "/legislacao/categorias/",
      {
        useAuthHeader: true,
      }
    );
  }

  getLegislacaoConteudo(
    params: GetLegislacaoConteudoPayload,
    signal?: AbortSignal
  ) {
    return this.apiClient.get<GetLegislacaoConteudoResponse>(
      "/legislacao/conteudos/",
      {
        useAuthHeader: true,
        queryParams: params,
        signal,
      }
    );
  }

  getLegislacaoConteudoByUuid(uuid: string, signal?: AbortSignal) {
    return this.apiClient.get<GetLegislacaoConteudoDetalhadoResponse>(
      `/legislacao/conteudos/${uuid}/`,
      {
        useAuthHeader: true,
        signal,
      }
    );
  }

  getLegislacaoGlossario(
    payload: GetLegislacaoGlossarioPayload,
    signal?: AbortSignal
  ) {
    return this.apiClient.get<GetLegislacaoGlossarioResponse>(
      "/legislacao/glossario/",
      {
        useAuthHeader: true,
        signal,
        queryParams: payload,
      }
    );
  }

  getLegislacaoNoticias(
    payload: GetLegislacaoConteudoPayload,
    signal?: AbortSignal
  ) {
    return this.apiClient.get<GetLegislacaoConteudoResponse>(
      "/legislacao/noticias/",
      {
        useAuthHeader: true,
        signal,
        queryParams: payload,
      }
    );
  }

  getLegislacaoNoticiaByUuid(uuid: string, signal?: AbortSignal) {
    return this.apiClient.get<GetLegislacaoConteudoDetalhadoResponse>(
      `/legislacao/noticias/${uuid}/`,
      {
        useAuthHeader: true,
        signal,
      }
    );
  }
}
