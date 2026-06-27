import { AuthService } from "@/services/auth/AuthService";
import { ApiBaseError } from "@/types/api/api";

interface IApiClientOptions {
  options?: RequestInit;
  useAuthHeader?: boolean;
  queryParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  responseType?: "json" | "blob";
}

const defaultApiClientOptions: IApiClientOptions = {
  useAuthHeader: true,
  responseType: "json",
};
export class ApiClient {
  private static instance: ApiClient;
  private _apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || "";

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async _getAuthToken() {
    const authService = AuthService.getInstance();
    return authService.getToken();
  }

  private _parseQueryParams(
    params: Record<string, string | number | boolean | undefined>
  ): Record<string, string> {
    const parsedParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        parsedParams[key] = String(value);
      }
    }
    return parsedParams;
  }

  private _getUrl(url: string, options?: IApiClientOptions): string {
    const isAbsoluteUrl =
      url.startsWith("http://") || url.startsWith("https://");
    if (isAbsoluteUrl) {
      return url;
    }

    const queryParams = new URLSearchParams(
      this._parseQueryParams(options?.queryParams || {})
    );

    const queryParamsAsString = queryParams.toString();

    if (queryParamsAsString) {
      url += `?${queryParamsAsString}`;
    }

    return this._apiBaseUrl + url;
  }

  private async _getFetchOptions(
    apiOptions: IApiClientOptions
  ): Promise<RequestInit> {
    const fetchOptions: RequestInit = apiOptions.options || {};
    if (apiOptions.useAuthHeader) {
      const token = await this._getAuthToken();
      if (token) {
        fetchOptions.headers = {
          ...(fetchOptions.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    }
    if (apiOptions.signal) {
      fetchOptions.signal = apiOptions.signal;
    }
    return fetchOptions;
  }

  async post<R, B>(
    url: string,
    body: B,
    apiOptions: IApiClientOptions = defaultApiClientOptions
  ): Promise<R> {
    const fetchOptions = await this._getFetchOptions(apiOptions);
    fetchOptions.method = "POST";

    const baseOptions = fetchOptions.headers || {};

    if (body instanceof FormData) {
      fetchOptions.body = body;
      fetchOptions.headers = {
        ...baseOptions,
      };
    } else {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers = {
        ...baseOptions,
        "Content-Type": "application/json",
      };
    }

    return this._fetch<R>(url, fetchOptions);
  }

  async patch<R, B>(
    url: string,
    body: B,
    apiOptions: IApiClientOptions = defaultApiClientOptions
  ): Promise<R> {
    const fetchOptions = await this._getFetchOptions(apiOptions);
    fetchOptions.method = "PATCH";

    const baseOptions = fetchOptions.headers || {};

    if (body instanceof FormData) {
      fetchOptions.body = body;
      fetchOptions.headers = {
        ...baseOptions,
      };
    } else {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers = {
        ...baseOptions,
        "Content-Type": "application/json",
      };
    }

    return this._fetch<R>(url, fetchOptions);
  }

  async get<R>(
    url: string,
    apiOptions: IApiClientOptions = defaultApiClientOptions
  ): Promise<R> {
    const fetchOptions = await this._getFetchOptions(apiOptions);
    fetchOptions.method = "GET";
    return this._fetch<R>(url, fetchOptions, apiOptions);
  }

  async _fetch<T>(
    url: string,
    options: RequestInit,
    apiOptions?: IApiClientOptions
  ): Promise<T> {
    const response = await fetch(this._getUrl(url, apiOptions), options);
    if (!response.ok) {
      throw new ApiClientError(
        `HTTP error! status: ${response.status}`,
        response
      );
    }
    if (apiOptions?.responseType === "blob") {
      return (await response.blob()) as unknown as T;
    }
    return (await response.json()) as T;
  }

  static isApiClientError<AE = unknown>(
    error: unknown
  ): error is ApiClientError<AE> {
    return error instanceof ApiClientError;
  }
}

export class ApiClientError<AE = unknown> extends Error {
  rawError?: unknown;
  constructor(message: string, rawError?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.rawError = rawError;
  }

  get statusCode(): number | null {
    if (this.rawError && this.rawError instanceof Response) {
      return this.rawError.status;
    }
    return null;
  }

  get details(): Promise<AE> | undefined {
    try {
      if (this.rawError && this.rawError instanceof Response) {
        return this.rawError.json();
      }
    } catch {
      return undefined;
    }
  }

  static detailHasErrorInformation<AE>(
    details: AE
  ): details is AE & ApiBaseError {
    try {
      if (!details) {
        throw new Error("No details available");
      }
      if (
        details.hasOwnProperty("error") &&
        details.hasOwnProperty("message")
      ) {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }
}
