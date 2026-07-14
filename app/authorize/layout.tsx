"use client"

import AuthSdkWrapper from "@/components/AuthSdkWrapper";

export default function Layout({children}: Readonly<{ children: React.ReactNode, }>) {
  return (
    <AuthSdkWrapper>
      {children}
    </AuthSdkWrapper>
  );
}
