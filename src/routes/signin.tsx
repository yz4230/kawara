import { createFileRoute, redirect } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import authClient from "~/lib/auth-client";
import { Button } from "~/lib/components/ui/button";
import { cn } from "~/lib/utils";

const REDIRECT_URL = "/dashboard";

export const Route = createFileRoute("/signin")({
  component: AuthPage,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({ to: REDIRECT_URL });
    }
  },
});

function AuthPage() {
  return (
    <div className="bg-card mx-auto mt-10 flex w-xs flex-col items-center gap-8 rounded-xl border p-10">
      <h2 className="text-xl font-bold">Sign in to your account</h2>
      <div className="flex w-full flex-col gap-2">
        <SignInButton
          provider="google"
          label="Google"
          className="bg-[#DB4437] hover:bg-[#DB4437]/80"
        />
      </div>
    </div>
  );
}

interface SignInButtonProps extends ComponentProps<typeof Button> {
  provider: "google";
  label: string;
}

function SignInButton({ provider, label, className, ...props }: SignInButtonProps) {
  return (
    <Button
      onClick={() =>
        authClient.signIn.social({
          provider,
          callbackURL: REDIRECT_URL,
        })
      }
      type="button"
      size="lg"
      className={cn("text-white hover:text-white", className)}
      {...props}
    >
      Sign in with {label}
    </Button>
  );
}
