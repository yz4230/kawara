# Kawara

Kawara は開発者向けのトレンドフィードアグリゲーターです。GitHub や Zenn などの人気のあるプラットフォームから最新のトレンド情報を収集し、一箇所で閲覧できます。さらに、Google の Gemini AI を使用して記事の要約を日本語で提供します。

## 特徴

- **複数ソースからのフィード**: GitHub Trending と Zenn の記事を自動的に収集
- **AI による要約**: Google Gemini AI を使用して記事の内容を日本語で要約
- **認証機能**: Better Auth を使用したセキュアなユーザー認証
- **自動更新**: Inngest を使用した定期的なフィード更新
- **モダンな UI**: React と Tailwind CSS を使用した美しいインターフェース

## 技術スタック

- [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)
- TanStack [Start](https://tanstack.com/start/latest) + [Router](https://tanstack.com/router/latest) + [Query](https://tanstack.com/query/latest)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Better Auth](https://www.better-auth.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Inngest](https://www.inngest.com/) (バックグラウンドジョブ)

## セットアップ

1. リポジトリをクローンします:

   ```bash
   git clone https://github.com/yourusername/kawara.git
   cd kawara
   ```

2. 依存関係をインストールします:

   ```bash
   bun install
   ```

3. `.env.example` をコピーして `.env` ファイルを作成し、必要な環境変数を設定します:

   ```bash
   cp .env.example .env
   ```

   以下の環境変数を設定する必要があります:
   - `DATABASE_URL`: PostgreSQL データベース接続文字列
   - `BETTER_AUTH_SECRET`: 認証用のシークレットキー
   - `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET`: Google OAuth 認証用
   - `GOOGLE_GENAI_API_KEY`: Google Gemini AI API キー
   - `INNGEST_EVENT_KEY` と `INNGEST_SIGNING_KEY`: Inngest 用のキー

4. データベーススキーマを作成します:

   ```bash
   bun db push
   ```

5. 開発サーバーを起動します:

   ```bash
   bun dev
   ```

   開発サーバーは [http://localhost:3000](http://localhost:3000) で実行されます。

6. Inngest 開発サーバーを別のターミナルで起動します:

   ```bash
   bun inngest:dev
   ```

## フィードプロバイダー

現在、以下のフィードプロバイダーがサポートされています:

- **GitHub Trending**: GitHub で人気のリポジトリを表示
- **Zenn トレンド**: Zenn で人気の技術記事を表示

新しいプロバイダーを追加するには、`src/lib/server/providers` ディレクトリに新しいプロバイダークラスを作成し、`all.ts` ファイルに追加します。

## AI 要約機能

Kawara は Google の Gemini AI を使用して、記事の内容を日本語で要約します。この機能を使用するには、`.env` ファイルに有効な `GOOGLE_GENAI_API_KEY` を設定する必要があります。

要約のプロンプトは `src/prompts/summerize.txt` で設定できます。

## デプロイ

本番環境へのデプロイについては、[TanStack Start のホスティングドキュメント](https://tanstack.com/start/latest/docs/framework/react/hosting)を参照してください。

## ライセンス

[MIT](LICENSE)
