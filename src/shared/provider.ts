export const ProviderId = {
  GithubTrending: "github-trending",
  ZennTrending: "zenn-trending",
  Gihyo: "gihyo",
} as const;

export const providerIds = [
  ProviderId.GithubTrending,
  ProviderId.ZennTrending,
  ProviderId.Gihyo,
] as const;

export type ProviderId = (typeof providerIds)[number];

type ProviderMeta = {
  id: ProviderId;
  name: string;
  description: string;
  icon: string;
};

export const providerMetas: ProviderMeta[] = [
  {
    id: ProviderId.GithubTrending,
    name: "GitHub Trending",
    description: "See what the GitHub community is most excited about today.",
    icon: "https://avatars.githubusercontent.com/u/9919",
  },
  {
    id: ProviderId.ZennTrending,
    name: "Zennのトレンド",
    description: "現在Zennでトレンドとなっている投稿のRSSフィードです",
    icon: "https://static.zenn.studio/images/logo-only-dark.png",
  },
  {
    id: ProviderId.Gihyo,
    name: "gihyo.jp",
    description:
      "gihyo.jpは、技術評論社が運営しているWebメディアです。エンジニアやデザイナー向けの記事のほか、" +
      "ビジネスシーンを含めITを活用している人向けの記事を掲載しています。",
    icon: "https://gihyo.jp/favicon.svg",
  },
];
