import { ApiClient } from "@/services/api/ApiClient";
import {
  ApiBaseResponse,
  PaginatedRequest,
  PaginatedResponse,
} from "@/types/api/api";

export class ClientRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  async getAreasAtuacao(params?: PaginatedRequest) {
    return this.apiClient.get<
      PaginatedResponse<{ uuid: string; name: string }>
    >("/client/areas-atuacao/", {
      useAuthHeader: true,
      queryParams: params,
    });
  }

  async getEstados() {
    return this.apiClient.get<Array<{ value: string; label: string }>>(
      "/client/estados/",
      { useAuthHeader: true }
    );
  }

  async getCreditsBalance() {
    return this.apiClient.get<ApiBaseResponse<{ balance: number }>>(
      "/client/credits/balance/",
      { useAuthHeader: true }
    );
  }
}
