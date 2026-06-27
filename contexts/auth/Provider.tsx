"use client";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { AuthContext } from "./context";
import { AuthService } from "@/services/auth/AuthService";
import { AuthStatusEnum } from "@/types/enums/auth";
import { AuthUser } from "@/types/auth";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const authService = useRef(AuthService.getInstance());
  const [authState, setAuthState] = useState(AuthStatusEnum.Unknown);
  const [me, setMe] = useState<AuthUser | null>(null);

  useEffect(() => {
    const authServiceInstance = authService.current;
    authServiceInstance.init();

    const subscription = authServiceInstance.authStateObservable.subscribe(
      (newAuthState) => {
        setAuthState(newAuthState);
      }
    );

    const meSubscription = authServiceInstance.meObservable.subscribe(
      (newMe) => {
        setMe(newMe);
      }
    );

    return () => {
      subscription.unsubscribe();
      meSubscription.unsubscribe();
      // Não chamamos cleanUp() aqui para não completar os BehaviorSubjects
      // O AuthService é singleton e os subjects precisam continuar ativos
    };
  }, []);

  return (
    <AuthContext value={{ authService, authState, me }}>{children}</AuthContext>
  );
};
