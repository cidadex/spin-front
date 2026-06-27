import { useAuth } from "@/hooks/useAuth/useAuth";
import { AuthStatusEnum } from "@/types/enums/auth";
import { useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

interface IProtectedRouteProps extends PropsWithChildren {
  oneOfAuthState?: AuthStatusEnum[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  oneOfAuthState,
  children,
  redirectTo,
}: IProtectedRouteProps) => {
  const [ready, setReady] = useState(false);
  const { authState } = useAuth();
  const { push } = useRouter();

  useEffect(() => {
    if (oneOfAuthState && oneOfAuthState.length > 0) {
      const currentAuthState = authState;

      if (!oneOfAuthState.includes(currentAuthState)) {
        push(redirectTo || "/home");
        return;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [authState, oneOfAuthState, push, redirectTo]);

  if (!ready) {
    return <></>;
  }

  return <>{children}</>;
};
