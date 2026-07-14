"use client"

import '@shibaone/shibhubui/index.css';
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import {Suspense, useEffect} from "react";
import {ElectronAPI} from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/serviceworker/sw.js')
        .then(registration => console.log('scope is: ', registration.scope))
        .catch(e => {
          console.log("register.sw.catch:", e)
        })
        .finally(() => {
        });
    }
  }, []);

  return (
    <html lang="en">
    <body>
    <Suspense fallback={null}>
      {children}
    </Suspense>
    </body>
    </html>
  );
}