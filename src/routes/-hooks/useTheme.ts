import { identity } from "es-toolkit";
import { useLocalStorage } from "usehooks-ts";
import { enum_, safeParse } from "valibot";

export const Theme = {
  system: "system",
  light: "light",
  dark: "dark",
} as const;

export type Theme = (typeof Theme)[keyof typeof Theme];

export default function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(
    "theme",
    () => (document.documentElement.classList.contains("dark") ? "dark" : "system"),
    {
      serializer: identity,
      deserializer: parseThemeValue,
      initializeWithValue: false,
    },
  );

  return [theme, setTheme] as const;
}

function parseThemeValue(value: string) {
  const result = safeParse(enum_(Theme), value);
  return result.success ? result.output : Theme.system;
}
