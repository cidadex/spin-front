"use client";
import dynamic from "next/dynamic";
import { PropsWithChildren } from "react";
export const AuthLayout = ({ children }: PropsWithChildren) => {
  return <ClientSideAuthLayout>{children}</ClientSideAuthLayout>;
};

const ClientSideAuthLayout = dynamic(
  () =>
    import("../layouts/ClientSideAuthLayout").then(
      (mod) => mod.ClientSideAuthLayout
    ),
  {
    ssr: false,
  }
);
