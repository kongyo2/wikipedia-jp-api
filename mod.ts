/**
 * 日本語版Wikipedia APIクライアント
 *
 * MediaWiki APIへの接続を容易にするTypeScriptライブラリです。
 * @module
 */

/**
 * 日本語版WikipediaのAPIエンドポイント
 */
const WIKIPEDIA_API_ENDPOINT = "https://ja.wikipedia.org/w/api.php";

/**
 * MediaWiki APIのパラメータを表す型
 */
export type MediaWikiParams = Record<string, string | number | boolean>;

/**
 * API呼び出しのオプション
 */
export interface WikipediaApiOptions {
  /**
   * リトライ回数（デフォルト: 3）
   */
  maxRetries?: number;

  /**
   * リクエストのタイムアウト時間（ミリ秒、デフォルト: 10000）
   */
  timeout?: number;

  /**
   * ユーザーエージェント文字列（デフォルト: ライブラリ名）
   */
  userAgent?: string;
}

/**
 * 単一のエンドポイントに対してリトライ付きでAPIリクエストを実行
 */
async function fetchWithRetry(
  endpoint: string,
  params: MediaWikiParams,
  options: WikipediaApiOptions
): Promise<any> {
  const maxRetries = options.maxRetries ?? 3;
  const timeout = options.timeout ?? 10000;
  const userAgent = options.userAgent ?? "wikipedia-jp-api/1.0.0";

  const url = new URL(endpoint);

  // デフォルトパラメータを設定
  const defaultParams = {
    format: "json",
    formatversion: "2",
    origin: "*",
  };

  // パラメータをURLに追加
  const allParams = { ...defaultParams, ...params };
  Object.entries(allParams).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": userAgent,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Content-Typeに応じて適切にパース
      const contentType = response.headers.get("content-type");
      let result: any;

      if (contentType?.includes("application/json")) {
        result = await response.json();
      } else if (contentType?.includes("text/xml") || contentType?.includes("application/xml")) {
        result = await response.text();
      } else {
        result = await response.text();
      }

      return result;
    } catch (error) {
      // 最後のリトライでもエラーの場合は例外を投げる
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // リトライの前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error("All retries failed");
}

/**
 * 日本語版WikipediaのMediaWiki APIを呼び出す
 *
 * @param params MediaWiki APIパラメータ（action, format等）
 * @param options APIオプション
 * @returns APIのレスポンス
 * @throws API呼び出しが失敗した場合にエラーをスロー
 *
 * @example
 * ```typescript
 * // ページ情報を取得
 * const result = await callWikipediaApi({
 *   action: "parse",
 *   page: "日本",
 *   format: "json"
 * });
 *
 * // ページを検索
 * const searchResult = await callWikipediaApi({
 *   action: "query",
 *   list: "search",
 *   srsearch: " TypeScript",
 *   format: "json"
 * });
 * ```
 */
export async function callWikipediaApi(
  params: MediaWikiParams,
  options: WikipediaApiOptions = {}
): Promise<any> {
  try {
    const result = await fetchWithRetry(WIKIPEDIA_API_ENDPOINT, params, options);
    return result;
  } catch (error) {
    throw new Error(
      `Wikipedia API call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Wikipediaページの情報を取得するヘルパー関数
 */
export async function getPage(
  title: string,
  options: WikipediaApiOptions = {}
): Promise<any> {
  return callWikipediaApi({
    action: "parse",
    page: title,
    prop: "text|categories|links|images|templates",
    format: "json",
  }, options);
}

/**
 * Wikipediaでページを検索するヘルパー関数
 */
export async function searchPages(
  query: string,
  limit: number = 10,
  options: WikipediaApiOptions = {}
): Promise<any> {
  return callWikipediaApi({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: limit,
    format: "json",
  }, options);
}

/**
 * Wikipediaのカテゴリ情報を取得するヘルパー関数
 */
export async function getCategoryMembers(
  category: string,
  limit: number = 10,
  options: WikipediaApiOptions = {}
): Promise<any> {
  return callWikipediaApi({
    action: "query",
    list: "categorymembers",
    cmtitle: `Category:${category}`,
    cmlimit: limit,
    format: "json",
  }, options);
}

/**
 * Wikipediaのサイト情報を取得するヘルパー関数
 */
export async function getSiteInfo(
  options: WikipediaApiOptions = {}
): Promise<any> {
  return callWikipediaApi({
    action: "query",
    meta: "siteinfo",
    format: "json",
  }, options);
}

/**
 * デフォルトエクスポート
 */
export default callWikipediaApi;
