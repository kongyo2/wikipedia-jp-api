/**
 * 動作テスト用スクリプト
 */

import { 
  callWikipediaApi, 
  getPage, 
  searchPages, 
  getCategoryMembers, 
  getSiteInfo
} from "./mod.ts";

console.log("=== 日本語版Wikipedia APIクライアント 動作テスト ===\n");

// テスト1: メインページのパース
console.log("テスト1: ページ情報を取得（日本）");
try {
  const result1 = await getPage("日本");
  console.log("✓ 成功:");
  console.log("  タイトル:", result1.parse?.title);
  console.log("  ページID:", result1.parse?.pageid);
  console.log("  最終更新日時:", result1.parse?.revid);
  console.log();
} catch (error) {
  console.error("✗ 失敗:", error);
  console.log();
}

// テスト2: ページの検索
console.log("テスト2: ページを検索（TypeScript）");
try {
  const result2 = await searchPages("TypeScript", 5);
  console.log("✓ 成功:");
  console.log("  検索結果数:", result2.query?.search?.length);
  if (result2.query?.search?.[0]) {
    console.log("  最初の結果:", result2.query.search[0].title);
    console.log("  スニペット:", result2.query.search[0].snippet?.substring(0, 100) + "...");
  }
  console.log();
} catch (error) {
  console.error("✗ 失敗:", error);
  console.log();
}

// テスト3: サイト情報の取得
console.log("テスト3: サイト情報を取得");
try {
  const result3 = await getSiteInfo();
  console.log("✓ 成功:");
  console.log("  サイト名:", result3.query?.general?.sitename);
  console.log("  ベースURL:", result3.query?.general?.base);
  console.log("  メインページ:", result3.query?.general?.mainpage);
  console.log("  WikiID:", result3.query?.general?.wikiid);
  console.log();
} catch (error) {
  console.error("✗ 失敗:", error);
  console.log();
}

// テスト4: カテゴリメンバーの取得
console.log("テスト4: カテゴリメンバーを取得（プログラミング言語）");
try {
  const result4 = await getCategoryMembers("プログラミング言語", 5);
  console.log("✓ 成功:");
  console.log("  カテゴリメンバー数:", result4.query?.categorymembers?.length);
  if (result4.query?.categorymembers?.[0]) {
    console.log("  最初のメンバー:", result4.query.categorymembers[0].title);
  }
  console.log();
} catch (error) {
  console.error("✗ 失敗:", error);
  console.log();
}

// テスト5: カスタムオプションの使用
console.log("テスト5: カスタムオプションのテスト");
try {
  const result5 = await callWikipediaApi(
    {
      action: "query",
      titles: "JavaScript",
      format: "json",
      prop: "info",
      inprop: "url|displaytitle"
    },
    {
      maxRetries: 2,
      timeout: 15000,
      userAgent: "custom-test-agent/1.0.0"
    }
  );
  console.log("✓ 成功: カスタムオプションが機能しています");
  console.log("  ページ情報:", Object.keys(result5.query?.pages?.[0] || {}));
  console.log();
} catch (error) {
  console.error("✗ 失敗:", error);
  console.log();
}

// テスト6: 低レベルAPI呼び出し
console.log("テスト6: 低レベルAPI呼び出し（直接callWikipediaApi使用）");
try {
  const result6 = await callWikipediaApi({
    action: "query",
    list: "random",
    rnlimit: 3,
    format: "json"
  });
  console.log("✓ 成功:");
  console.log("  ランダムページ数:", result6.query?.random?.length);
  result6.query?.random?.forEach((page: any, index: number) => {
    console.log(`    ${index + 1}. ${page.title} (ID: ${page.id})`);
  });
  console.log();
} catch (error) {
  console.error("✗ 失敗:", error);
  console.log();
}

// テスト7: エラーハンドリングのテスト
console.log("テスト7: エラーハンドリングのテスト（存在しないページ）");
try {
  const result7 = await getPage("存在しないページ名123456789");
  if (result7.parse?.missing === "") {
    console.log("✓ 成功: 存在しないページを正しく検出しました");
    console.log("  missingフラグ:", result7.parse.missing);
  } else {
    console.log("⚠ 予期しないレスポンス:", result7);
  }
  console.log();
} catch (error) {
  console.error("✗ 失敗:", error);
  console.log();
}

console.log("=== テスト完了 ===");
