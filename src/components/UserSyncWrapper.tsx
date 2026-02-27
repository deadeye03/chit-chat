"use client";

import { useUserSync } from "@/hooks/useUserSync";

export default function UserSyncWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will automatically sync the user when they're authenticated
  useUserSync();

  return <>{children}</>;
}
