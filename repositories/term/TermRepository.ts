import { ApiClient } from "@/services/api/ApiClient";
import { PaginatedResponse } from "@/types/api/api";
import { TermTypeEnum } from "@/types/enums";
import { TermResponse } from "@/types/term";

export class TermRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  async getMoreRecentTerm(type: TermTypeEnum) {
    return this.apiClient.get<TermResponse>("/terms/", {
      useAuthHeader: true,
      queryParams: { type },
    });
  }

  async getAcceptanceTerms() {
    return this.apiClient.get<
      PaginatedResponse<{ uuid: string; term: TermResponse }>
    >("/terms/acceptance-terms/", {
      useAuthHeader: true,
    });
  }

  async acceptTerm(termUuid: string) {
    return this.apiClient.post(
      "/terms/acceptance-terms/",
      { term: termUuid },
      { useAuthHeader: true }
    );
  }
}
