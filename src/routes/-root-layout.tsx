import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import ThemeButton from "~/lib/components/ThemeButton";
import { Avatar, AvatarFallback, AvatarImage } from "~/lib/components/ui/avatar";
import { userQuery } from "./-queries";

export default function RootLayout({ children }: PropsWithChildren) {
  const { data: user } = useQuery(userQuery());

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between border-b px-4">
        <Link to="/">
          <h1 className="text-4xl font-bold">Kawara</h1>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeButton />
          <Avatar>
            {user?.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>
              <UserIcon className="size-5" />
            </AvatarFallback>
          </Avatar>
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
