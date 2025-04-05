import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import authClient from "~/lib/auth-client";
import { userQuery } from "../-queries";

export default function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useCallback(async () => {
    await authClient.signOut();
    await queryClient.invalidateQueries(userQuery());
    await router.invalidate();
    await router.navigate({ to: "/" });
  }, [queryClient, router]);
}
