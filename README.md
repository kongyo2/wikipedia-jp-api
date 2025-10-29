# Wikipedia JP API Client

日本語版WikipediaのMediaWiki APIへの接続を容易にするTypeScriptライブラリです。

## 特徴

- **タイプセーフ**: TypeScriptで完全な型定義を提供
- **リトライ機能**: ネットワークエラー時に自動リトライ
- **柔軟な設定**: タイムアウト、ユーザーエージェント等をカスタマイズ可能
- **ヘルパー関数**: よく使うAPI操作を簡素化する関数を提供
- **エラーハンドリング**: 詳細なエラー情報を提供

## インストール

```bash
# Denoの場合
deno add @your-username/wikipedia-jp-api

# npmの場合
npx jsr add @your-username/wikipedia-jp-api

# pnpmの場合
pnpm add jsr:@your-username/wikipedia-jp-api

# yarnの場合
yarn add jsr:@your-username/wikipedia-jp-api
```

## 基本的な使用方法

### 低レベルAPI呼び出し

```typescript
import { callWikipediaApi } from "@your-username/wikipedia-jp-api";

// ページ情報を取得
const result = await callWikipediaApi({
  action: "parse",
  page: "日本",
  format: "json"
});

console.log(result.parse?.title); // "日本"
```

### ページ情報の取得

```typescript
import { getPage } from "@your-username/wikipedia-jp-api";

const page = await getPage("TypeScript");
console.log(page.parse?.title);
console.log(page.parse?.text); // ページのHTMLコンテンツ
```

### ページ検索

```typescript
import { searchPages } from "@your-username/wikipedia-jp-api";

const searchResult = await searchPages("プログラミング言語", 10);
console.log(`検索結果: ${searchResult.query?.search?.length}件`);

searchResult.query?.search?.forEach((result) => {
  console.log(`- ${result.title}: ${result.snippet}`);
});
```

### カテゴリ情報の取得

```typescript
import { getCategoryMembers } from "@your-username/wikipedia-jp-api";

const members = await getCategoryMembers("プログラミング言語", 5);
members.query?.categorymembers?.forEach((member) => {
  console.log(`- ${member.title}`);
});
```

### サイト情報の取得

```typescript
import { getSiteInfo } from "@your-username/wikipedia-jp-api";

const siteInfo = await getSiteInfo();
console.log("サイト名:", siteInfo.query?.general?.sitename);
console.log("Wiki ID:", siteInfo.query?.general?.wikiid);
```

## 高度な使用方法

### カスタムオプションの使用

```typescript
import { callWikipediaApi } from "@your-username/wikipedia-jp-api";

const result = await callWikipediaApi(
  {
    action: "query",
    titles: "JavaScript",
    format: "json"
  },
  {
    maxRetries: 5,        // リトライ回数を5回に設定
    timeout: 15000,       // タイムアウトを15秒に設定
    userAgent: "MyApp/1.0.0"   // カスタムユーザーエージェント
  }
);
```

## APIリファレンス

### `callWikipediaApi(params, options?)`

基本的なMediaWiki API呼び出し関数。

**パラメータ:**
- `params`: `MediaWikiParams` - MediaWiki APIパラメータ
- `options?`: `WikipediaApiOptions` - オプション設定

**オプション:**
- `maxRetries?: number` - リトライ回数（デフォルト: 3）
- `timeout?: number` - タイムアウト時間（ミリ秒、デフォルト: 10000）
- `userAgent?: string` - ユーザーエージェント文字列

### ヘルパー関数

- `getPage(title, options?)` - ページ情報を取得
- `searchPages(query, limit?, options?)` - ページを検索
- `getCategoryMembers(category, limit?, options?)` - カテゴリメンバーを取得
- `getSiteInfo(options?)` - サイト情報を取得

## よく使用するMediaWiki APIパラメータ

### ページ情報取得
```typescript
// 基本的なページ情報
{
  action: "parse",
  page: "ページ名",
  format: "json"
}

// 詳細なページ情報
{
  action: "parse",
  page: "ページ名",
  prop: "text|categories|links|images|templates",
  format: "json"
}
```

### ページ検索
```typescript
{
  action: "query",
  list: "search",
  srsearch: "検索キーワード",
  srlimit: 10,
  format: "json"
}
```

### カテゴリ情報
```typescript
{
  action: "query",
  list: "categorymembers",
  cmtitle: "Category:カテゴリ名",
  cmlimit: 10,
  format: "json"
}
```

## エラーハンドリング

```typescript
import { callWikipediaApi } from "@your-username/wikipedia-jp-api";

try {
  const result = await callWikipediaApi({
    action: "parse",
    page: "存在しないページ",
    format: "json"
  });
  
  if (result.parse?.missing) {
    console.log("ページが存在しません");
  }
} catch (error) {
  console.error("API呼び出しエラー:", error.message);
}
```

## MediaWiki APIについて

このライブラリはMediaWiki APIのラッパーです。詳細なAPIドキュメントについては以下を参照してください：

- [MediaWiki API Documentation](https://www.mediawiki.org/wiki/API:Main_page)
- [日本語Wikipedia APIヘルプ](https://ja.wikipedia.org/w/api.php)

## 制限事項

- このライブラリは読み取り専用APIを想定しています
- ログインや編集操作には対応していません
- Wikipediaの利用規約とAPIポリシーに従ってご利用ください
- 過度なリクエストは避けてください

## ライセンス

MIT License

## 貢献

バグ報告や機能要望はGitHub Issuesで受け付けています。

## 更新履歴

### v1.0.0
- 初回リリース
- 基本的なMediaWiki API機能をサポート
- TypeScriptで完全な型定義を提供
