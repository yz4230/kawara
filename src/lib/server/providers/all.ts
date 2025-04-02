import type { Provider } from "./base";
import { GihyoProvider } from "./gihyo";
import { GithubTrendingProvider } from "./github-trending";
import { ZennTrendingProvider } from "./zenn-trending";

export const providers: Provider[] = [
  new GithubTrendingProvider(),
  new ZennTrendingProvider(),
  new GihyoProvider(),
];
