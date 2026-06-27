import { AuthService } from "@/services/auth/AuthService";
import { AuthUser } from "@/types/auth";
import { AuthStatusEnum } from "@/types/enums/auth";
import { createContext, RefObject } from "react";

export interface IAuthContext {
  authService: RefObject<AuthService> | null;
  authState: AuthStatusEnum;
  me: AuthUser | null;
}

export const AuthContext = createContext<IAuthContext>({
  authService: null,
  me: null,
  authState: AuthStatusEnum.Unknown,
});
