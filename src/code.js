/**
 * 美容師練習管理Webアプリ V2
 * メインGASファイル
 */

// --- 環境設定 ---
const IS_PRODUCTION = false; // 開発中は false

// スプレッドシートIDの設定
const PROD_SPREADSHEET_ID = '14YeLbX6mXYZZ5jHfF2cH-xI9V9HQ7WXrLdevGypGfn8'; // 例: 14YeLbX6mXYZZ5jHfF2cH-xI9V9HQ7WXrLdevGypGfn8
const TEST_SPREADSHEET_ID = '1Ujtq1qTlxPKeHUoHN_qpM0jLLWimyd61UfHgqltnczg'; // ★★★ ここを必ず設定してください ★★★

const SPREADSHEET_ID = IS_PRODUCTION ? PROD_SPREADSHEET_ID : TEST_SPREADSHEET_ID;

// シート名の設定 (必要に応じて実際のシート名に合わせる)
const STAFF_MASTER_SHEET_NAME = 'スタッフマスター';
const PRACTICE_RECORD_SHEET_NAME = 'アプリ練習記録_RAW'; // 新しい記録シート名
const INVENTORY_SHEET_NAME = 'ウィッグ在庫';
const STORE_MASTER_SHEET_NAME = '店舗マスター';
const ROLE_MASTER_SHEET_NAME = '役職マスター';
const TRAINER_MASTER_SHEET_NAME = 'トレーナーマスター';
const TECH_CATEGORY_SHEET_NAME = '技術カテゴリーマスター';
const TECH_DETAIL_SHEET_NAME = '詳細技術項目マスター';

/**
 * Webアプリケーションとして公開された際に呼び出されるメイン関数
 * @param {Object} e - イベントオブジェクト
 * @return {HtmlOutput} HTMLページ
 */
function doGet(e) {
  Logger.log('doGet V2: 開始, パラメータ: ' + JSON.stringify(e.parameter));
  // TODO: 認証ロジックやページルーティングを実装する
  // 現時点では簡単なHTMLを返す
  try {
    // 将来的に index.html を読み込むように変更します
    // 現時点では動作確認用に単純なテキストを返します
    return HtmlService.createHtmlOutput('<p>美容師練習管理アプリ V2 へようこそ！ (開発中)</p>')
           .setTitle('美容師練習管理アプリ V2');
  } catch (err) {
     Logger.log('doGet V2 Error: ' + err);
     return HtmlService.createHtmlOutput('<h1>エラー</h1><p>ページの読み込みに失敗しました。</p>')
                      .setTitle('エラー - 美容師練習管理アプリ V2');
  }
}

/**
 * HTMLファイルをインクルードするための関数 (テンプレート内で使用)
 * @param {string} filename - インクルードするHTMLファイル名 (拡張子なし)
 * @return {string} ファイルの内容
 */
function include(filename) {
  try {
    // .getContent() を使ってHTML文字列を取得
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    const errorMsg = 'include Error (' + filename + '): ' + e;
    console.error(errorMsg); // ブラウザコンソールにも出力
    Logger.log(errorMsg);    // GASログにも出力
    // エラーが発生したことを示すコメントを返す
    return '<!-- Error including file: ' + filename + '. Check logs. -->';
  }
}

// --- 共通ユーティリティ関数などをここに追加していく ---

// 例：ログ出力関数 (Utils.js に移動予定)
function logMessage(message) {
  Logger.log(message);
}