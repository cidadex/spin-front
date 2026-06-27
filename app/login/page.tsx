"use client";

import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { AuthStatusEnum } from "@/types/enums/auth";
import { LoginForm } from "./components/LoginForm";
import { useSearchParams } from "next/navigation";
import { LoginWithCodeForm } from "./components/LoginWithCodeForm";

export default function Page() {
  return (
    <ProtectedRoute
      oneOfAuthState={[AuthStatusEnum.Unauthenticated]}
      redirectTo="/planos"
    >
      <LoginPage />
    </ProtectedRoute>
  );
}
const LoginPage = () => {
  const queryParams = useSearchParams();
  const code = queryParams.get("code");
  const email = queryParams.get("email");
  const shouldLoginWithCode = queryParams.get("loginWithCode") === "true";

  if (email || code || shouldLoginWithCode) {
    return <LoginWithCodeForm email={email} code={code} />;
  }

  return <LoginForm />;
};
