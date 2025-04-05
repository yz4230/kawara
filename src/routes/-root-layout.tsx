import { PopoverClose, PopoverTrigger } from "@radix-ui/react-popover";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LogInIcon, LogOutIcon, UserIcon } from "lucide-react";
import { type PropsWithChildren } from "react";
import ThemeButton from "~/lib/components/ThemeButton";
import { Avatar, AvatarFallback, AvatarImage } from "~/lib/components/ui/avatar";
import { Button } from "~/lib/components/ui/button";
import { Popover, PopoverContent } from "~/lib/components/ui/popover";
import useSignOut from "./-hooks/useSignOut";
import { userQuery } from "./-queries";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between border-b px-4">
        <Link to="/">
          <h1 className="text-4xl font-bold">Kawara</h1>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeButton />
          <User />
        </div>
      </header>
      <main className="grow">{children}</main>
      <footer className="bg-muted flex h-12 items-center justify-center text-sm">
        <span>
          Powered by{" "}
          <a
            className="text-muted-foreground hover:text-foreground underline"
            href="https://github.com/dotnize/react-tanstarter"
            target="_blank"
            rel="noreferrer noopener"
          >
            dotnize/react-tanstarter
          </a>
        </span>
      </footer>
    </div>
  );
}

function User() {
  const { data: user } = useQuery(userQuery());
  const signOut = useSignOut();

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar key={user?.id}>
          {user?.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback>
            <UserIcon className="text-primary size-5" />
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8}>
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="text-sm">Signed in as {user.name}</div>
            <PopoverClose asChild>
              <Button size="sm" variant="outline" onClick={signOut}>
                <LogOutIcon />
                <span>Sign out</span>
              </Button>
            </PopoverClose>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-sm">You are not signed in</div>
            <PopoverClose asChild>
              <Button size="sm" variant="outline" asChild>
                <Link to="/signin">
                  <LogInIcon />
                  <span>Sign in</span>
                </Link>
              </Button>
            </PopoverClose>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
