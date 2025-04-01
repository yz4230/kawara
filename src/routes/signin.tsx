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
      throw redirect({
        to: REDIRECT_URL,
      });
    }
  },
});

function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-card flex flex-col items-center gap-8 rounded-xl border p-10">
        Logo here
        <div className="flex flex-col gap-2">
          <SignInButton
            provider="google"
            label="Google"
            className="bg-[#DB4437] hover:bg-[#DB4437]/80"
          />
        </div>
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
