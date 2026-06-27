export interface ApiBaseResponse<T, S extends boolean = true> {
  data: T;
  message: string;
  success: S;
}

export interface ApiBaseError {
  success: false;
  error: string;
  message: string;
  error_code?: string;
  /** ISO date (YYYY-MM-DD) emitted with PDF_EMITIDO_ANTES_DO_DECRETO. */
  data_corte?: string;
}

export interface Pagination {
  count: number;
  next: string | null;
  previous: string | null;
}

export type PaginatedResponse<T, E = unknown> = Pagination & {
  results: T[];
} & E;

export type PaginatedRequestParams = {
  page?: number;
  page_size?: number;
};

export type PaginatedRequest<T = unknown> =
  T extends Record<string, unknown>
    ? T & PaginatedRequestParams
    : PaginatedRequestParams;
