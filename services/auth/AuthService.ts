import { AuthRepository } from "@/repositories/auth/AuthRepository";
import { AuthServiceErrorType, AuthStatusEnum } from "@/types/enums/auth";
import { BehaviorSubject } from "rxjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthUser, LoginPayload } from "@/types/auth";
import { authPayloadIsLoginWithPassword } from "@/lib/utils";
import { TermRepository } from "@/repositories/term/TermRepository";
import { TermTypeEnum } from "@/types/enums";
import { ApiClient } from "../api/ApiClient";

export class AuthService {
  private localStorageAccessTokenKey = "S.accessToken";
  private localStorageRefreshTokenKey = "S.refreshToken";
  private localStorageMeKey = "S.me";
  private static instance: AuthService;
  private authRepository: AuthRepository;
  private termRepository: TermRepository;

  private _accessToken: string | null = null;
  private _refreshToken: string | null = null;
  private _initialized = false;
  private _meObservable = new BehaviorSubject<AuthUser | null>(null);

  private _authStateObservable = new BehaviorSubject<AuthStatusEnum>(
    AuthStatusEnum.Unknown
  );

  get me() {
    return this._meObservable.value;
  }

  get meObservable() {
    return this._meObservable.asObservable();
  }

  get isAuthenticated() {
    return this._authStateObservable.value === AuthStatusEnum.Authenticated;
  }

  get authStateObservable() {
    return this._authStateObservable.asObservable();
  }

  private constructor() {
    this.authRepository = new AuthRepository();
    this.termRepository = new TermRepository();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async init() {
    if (this._initialized) return;
    this._initialized = true;
    this._loadTokensFromLocalStorage();
    this._loadMeFromLocalStorage();
    if (this._accessToken) {
      this._authStateObservable.next(AuthStatusEnum.Authenticated);
      await this.refreshMe();
    } else {
      this.logout();
    }
  }

  _loadTokensFromLocalStorage() {
    this._accessToken =
      localStorage.getItem(this.localStorageAccessTokenKey) || null;
    this._refreshToken =
      localStorage.getItem(this.localStorageRefreshTokenKey) || null;
  }

  _loadMeFromLocalStorage() {
    const meString = localStorage.getItem(this.localStorageMeKey);
    try {
      const me = meString ? JSON.parse(meString) : null;
      this._meObservable.next(me);
    } catch (_) {
      console.error("Failed to parse user data from localStorage", _);
      if (this._accessToken) {
        this.logout();
      }
    }
  }

  _saveTokensToLocalStorage(
    accessToken: string | null,
    refreshToken: string | null
  ) {
    if (accessToken) {
      this._accessToken = accessToken;
      localStorage.setItem(this.localStorageAccessTokenKey, accessToken);
    } else {
      this._accessToken = null;
      localStorage.removeItem(this.localStorageAccessTokenKey);
    }

    if (refreshToken) {
      this._refreshToken = refreshToken;
      localStorage.setItem(this.localStorageRefreshTokenKey, refreshToken);
    } else {
      this._refreshToken = null;
      localStorage.removeItem(this.localStorageRefreshTokenKey);
    }
  }

  _saveMeToLocalStorage(me: AuthUser | null) {
    if (me) {
      this._meObservable.next(me);
      localStorage.setItem(this.localStorageMeKey, JSON.stringify(me));
    } else {
      this._meObservable.next(null);
      localStorage.removeItem(this.localStorageMeKey);
    }
  }

  _shouldRefreshToken(): boolean {
    const jwtPayload = jwt.decode(this._accessToken || "") as JwtPayload;

    if (jwtPayload && jwtPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = jwtPayload.exp - currentTime;
      // Refresh if less than 5 minutes left
      return timeLeft < 300;
    }

    return false;
  }

  async getToken(): Promise<string | null> {
    if (this._shouldRefreshToken()) {
      try {
        await this.refreshToken();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        this.logout();
        return null;
      }
    }
    return this._accessToken;
  }

  async getMe() {
    try {
      const response = await this.authRepository.getMe();
      return response;
    } catch (error) {
      if (ApiClient.isApiClientError(error)) {
        if (error.statusCode === 401) {
          this.logout();
          return null;
        }
      }
    }
  }

  async refreshMe() {
    const me = await this.getMe();
    if (!me) {
      return;
    }
    this._saveMeToLocalStorage(me);
    return me;
  }

  async login(payload: LoginPayload) {
    const isLoginWithPassword = authPayloadIsLoginWithPassword(payload);

    let accessToken: string;
    let refreshToken: string;
    if (isLoginWithPassword) {
      const { email, password } = payload;
      const response = await this.authRepository.login(email, password);
      accessToken = response.access;
      refreshToken = response.refresh;
    } else {
      const response = await this.authRepository.loginWithCode(payload.code);
      accessToken = response.access;
      refreshToken = response.refresh;
    }
    this._saveTokensToLocalStorage(accessToken, refreshToken);

    const me = await this.refreshMe();

    if (me) {
      this._authStateObservable.next(AuthStatusEnum.Authenticated);
    } else {
      this.logout();
    }
  }

  async logout() {
    this._saveTokensToLocalStorage(null, null);
    this._saveMeToLocalStorage(null);
    this._authStateObservable.next(AuthStatusEnum.Unauthenticated);
  }

  async refreshToken() {
    if (!this._refreshToken) {
      throw new AuthServiceError(
        AuthServiceErrorType.NoRefreshToken,
        "No refresh token available"
      );
    }
    const response = await this.authRepository.refreshToken(this._refreshToken);
    this._saveTokensToLocalStorage(response.access, response.refresh);
  }

  async getLatestTerms() {
    const promises = [];
    promises.push(this.termRepository.getMoreRecentTerm(TermTypeEnum.Privacy));
    promises.push(this.termRepository.getMoreRecentTerm(TermTypeEnum.Use));

    return Promise.all(promises);
  }

  async getAcceptanceTerms() {
    return this.termRepository.getAcceptanceTerms();
  }

  async acceptTerm(termUuid: string) {
    const response = await this.termRepository.acceptTerm(termUuid);
    await this.refreshMe();
    return response;
  }

  async updateMe(data: { first_name?: string; last_name?: string }) {
    const updated = await this.authRepository.updateMe(data);
    if (updated) {
      this._saveMeToLocalStorage(updated);
    }
    return updated;
  }

  cleanUp() {
    this._authStateObservable.complete();
    this._meObservable.complete();
  }
}

export class AuthServiceError extends Error {
  type: AuthServiceErrorType;
  constructor(type: AuthServiceErrorType, message: string) {
    super(message);
    this.name = "AuthServiceError";
    this.type = type;
  }
}
