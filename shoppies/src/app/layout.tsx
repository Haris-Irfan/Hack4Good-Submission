"use client";

import React from "react";
import { AuthProvider } from "./AuthProvider"; // Update the path based on your structure

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
       <body>
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
