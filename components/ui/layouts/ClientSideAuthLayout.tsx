"use client";

import { shouldHideMenu } from "@/lib/route-config";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { AuthStatusEnum } from "@/types/enums";
import { Menu } from "../menu/Menu";
import { AuthTerms } from "./AuthTerms";
import { Bg } from "./UnauthenticatedLayout";

export const AuthenticatedLayout = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const hideMenu = shouldHideMenu(pathname);

  const { me } = useAuth();

  return (
    <>
      <div className="flex flex-col relative min-h-svh authenticated-layout-bg">
        <Bg />
      </div>
      <div>
        {!hideMenu && (
          <>
            <Menu />
            <div className="flex-1 flex items-center justify-center">
              <ContainerWrapper>{children}</ContainerWrapper>
            </div>
          </>
        )}
        {hideMenu && <ContainerWrapper>{children}</ContainerWrapper>}
        {me?.terms_accepted === false && <AuthTerms />}
      </div>
    </>
  );
};

export const ContainerWrapper = ({ children }: PropsWithChildren) => {
  return <div className="relative ">{children}</div>;
};

export const GuestLayout = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

export const ClientSideAuthLayout = ({ children }: PropsWithChildren) => {
  const { authState } = useAuth();

  if (authState === AuthStatusEnum.Authenticated) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  return <GuestLayout>{children}</GuestLayout>;
};
