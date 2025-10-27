"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface SessionWrapperProps {
  children: ReactNode;
}

export function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
