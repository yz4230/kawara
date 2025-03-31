export const ProviderId = {
  GithubTrending: "github-trending",
  ZennTrending: "zenn-trending",
} as const;

export const providerIds = [ProviderId.GithubTrending, ProviderId.ZennTrending] as const;
export type ProviderId = (typeof providerIds)[number];

type ProviderMeta = {
  name: string;
  description: string;
  icon: string;
};

export const providerMetas: Record<ProviderId, ProviderMeta> = {
  [ProviderId.GithubTrending]: {
    name: "GitHub Trending",
    description: "See what the GitHub community is most excited about today.",
    icon: "https://avatars.githubusercontent.com/u/9919",
  },
  [ProviderId.ZennTrending]: {
    name: "Zennのトレンド",
    description: "現在Zennでトレンドとなっている投稿のRSSフィードです",
    icon: "https://static.zenn.studio/images/logo-only-dark.png",
  },
};
