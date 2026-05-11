import { createFileRoute, redirect } from "@tanstack/react-router";
import { store } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const u = typeof window !== "undefined" ? store.getUser() : null;
    throw redirect({ to: u ? "/dashboard" : "/login" });
  },
  component: () => null,
});
