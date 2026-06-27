export interface AuthUser {
  email: string;
  first_name: string;
  last_name: string;
  terms_accepted: boolean;
}

export type LoginPayload =
  | {
      email: string;
      password: string;
    }
  | {
      code: string;
    };
