"use client";

import { ReactNode } from "react";
import dynamic from "next/dynamic";

const SessionProviderInner = dynamic(
  () => import("next-auth/react").then((mod) => mod.SessionProvider),
  { ssr: false },
);

interface SessionWrapperProps {
  children: ReactNode;
}

export function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProviderInner refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      {children}
    </SessionProviderInner>
  );
}
