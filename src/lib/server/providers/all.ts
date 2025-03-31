import type { Provider } from "./base";
import { GithubTrendingProvider } from "./github-trending";
import { ZennTrendingProvider } from "./zenn-trending";

export const providers: Provider[] = [
  new GithubTrendingProvider(),
  new ZennTrendingProvider(),
];
