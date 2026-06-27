import { ApiClient } from "@/services/api/ApiClient";
import { AuthUser } from "@/types/auth";

export class AuthRepository {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }
  async login(email: string, password: string) {
    return this.apiClient.post<
      { access: string; refresh: string },
      { email: string; password: string }
    >("/token/", { email, password }, { useAuthHeader: false });
  }

  async loginWithCode(code: string) {
    return this.apiClient.post<
      { access: string; refresh: string },
      { code: string }
    >("/access/validate/", { code }, { useAuthHeader: false });
  }

  async refreshToken(refreshToken: string) {
    return this.apiClient.post<
      { access: string; refresh: string },
      { refresh: string }
    >("/token/refresh/", { refresh: refreshToken }, { useAuthHeader: false });
  }

  async getMe() {
    return this.apiClient.get<AuthUser>("/me/");
  }
}
