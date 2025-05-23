import { SelectTrigger, type SelectProps } from "@radix-ui/react-select";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useEffect } from "react";
import useTheme from "~/routes/-hooks/useTheme";
import ClientOnly from "./client-only";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem } from "./ui/select";

export function updateTheme() {
  const theme = localStorage.getItem("theme");
  const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && preferDark);
  document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeButton() {
  return (
    <ClientOnly fallback={<Button variant="outline" size="icon" type="button" />}>
      <ThemeButtonClient />
    </ClientOnly>
  );
}

export function ThemeButtonClient() {
  const [theme, setTheme] = useTheme();

  useEffect(() => updateTheme(), [theme]);

  return (
    <Select
      value={theme}
      onValueChange={setTheme as SelectProps["onValueChange"]}
      defaultValue="system"
    >
      <SelectTrigger asChild>
        <Button variant="outline" size="icon" type="button">
          <span className="animate-in fade-in">
            {theme === "system" && <MonitorIcon />}
            {theme === "light" && <SunIcon />}
            {theme === "dark" && <MoonIcon />}
          </span>
        </Button>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="system">System</SelectItem>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </SelectContent>
    </Select>
  );
}
