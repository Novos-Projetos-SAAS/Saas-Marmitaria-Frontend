// src/components/Can/Can.js
"use client";

import { useAuthContext } from "@/context/AuthContext.js";

export default function Can({ perform, fallback = null, children }) {
  const { hasPermission, isReady } = useAuthContext();

  if (!isReady) return null;

  if (!hasPermission(perform)) {
    return fallback;
  }

  return <>{children}</>;
}