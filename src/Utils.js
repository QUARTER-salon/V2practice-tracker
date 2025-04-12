/**
 * 美容師練習管理Webアプリ V2
 * 共通ユーティリティ GAS関数
 */

/**
 * フロントエンドのJavaScriptから呼び出され、GASのログにメッセージを出力する。
 * フロントエンドからのログであることを区別するためにプレフィックスを付与する。
 * @param {string} message - ログに出力するメッセージ
 */
function logMessage(message) {
    try {
      // ログレベルを示すようなプレフィックスや、詳細情報を付加することも検討
      Logger.log('[Frontend] ' + message);
    } catch (e) {
      // Logger自体でエラーが起きることは稀だが念のため
      console.error('logMessage関数でのエラー:', e);
    }
  }
  
  /**
   * 指定されたメールアドレスがスタッフマスターシートで管理者権限を持つか確認する。
   * @param {string} email - 確認するユーザーのメールアドレス
   * @returns {boolean} 管理者であればtrue、そうでなければfalse
   */
  function isAdmin(email) {
    Logger.log('isAdmin: 開始 - 確認対象メールアドレス=[' + email + ']');
    if (!email || typeof email !== 'string') {
      Logger.log('isAdmin: メールアドレスが無効です。 -> false');
      return false;
    }
  
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet(); // スプレッドシートを一度だけ開く
      // const ss = SpreadsheetApp.openById(SPREADSHEET_ID); // 明示的にIDで開く場合
  
      const staffSheet = ss.getSheetByName(STAFF_MASTER_SHEET_NAME);
      if (!staffSheet) {
        Logger.log('isAdmin: スタッフマスターシートが見つかりません。シート名: ' + STAFF_MASTER_SHEET_NAME);
        // エラーを投げるか、falseを返すかは要件による
        throw new Error('スタッフマスターシートが見つかりません。');
        // return false;
      }
  
      const staffData = staffSheet.getDataRange().getValues();
      if (staffData.length < 2) { // ヘッダー行 + データ行1行以上
          Logger.log('isAdmin: スタッフマスターシートにデータがありません。');
          return false;
      }
      const headers = staffData[0].map(header => String(header).trim()); // ヘッダーを文字列・トリム
      const emailIndex = headers.indexOf('メールアドレス');
      const adminFlagIndex = headers.indexOf('管理者フラグ');
  
      Logger.log('isAdmin: 列インデックス - email=' + emailIndex + ', adminFlag=' + adminFlagIndex);
  
      if (emailIndex === -1 || adminFlagIndex === -1) {
        Logger.log('isAdmin: スタッフマスターシートに必要な列（メールアドレス or 管理者フラグ）が見つかりません。');
        throw new Error('スタッフマスターシートの列構成が正しくありません。');
        // return false;
      }
  
      // メールアドレスを小文字に統一して比較（大文字小文字を区別しない場合）
      const lowerEmail = email.toLowerCase();
  
      // ヘッダー行を除いて検索
      for (let i = 1; i < staffData.length; i++) {
        const row = staffData[i];
        const sheetEmail = row[emailIndex] ? String(row[emailIndex]).trim().toLowerCase() : '';
  
        // Logger.log(`isAdmin: 行 ${i + 1} のメールアドレス=[${sheetEmail}] と [${lowerEmail}] を比較`); // デバッグ用
  
        if (sheetEmail === lowerEmail) {
          Logger.log(`isAdmin: メールアドレス一致 (行 ${i + 1})`);
          const isAdminFlagRaw = row[adminFlagIndex];
          Logger.log(`isAdmin: 管理者フラグの値 = [${isAdminFlagRaw}] (${typeof isAdminFlagRaw})`);
  
          // 管理者フラグの判定 (TRUE, true, 1 を true とみなす)
          const isAdminResult = (
            isAdminFlagRaw === true ||
            String(isAdminFlagRaw).trim().toUpperCase() === 'TRUE' ||
            isAdminFlagRaw === 1
          );
  
          Logger.log('isAdmin: 判定結果 = ' + isAdminResult);
          return isAdminResult;
        }
      }
  
      Logger.log('isAdmin: 一致するメールアドレスが見つかりませんでした。 -> false');
      return false; // ループを抜けても見つからなかった場合
  
    } catch (e) {
      Logger.log('isAdmin: エラー発生 - ' + e.toString() + '\n' + e.stack);
      console.error('管理者判定エラー (isAdmin): ', e);
      // エラー発生時は安全のため false を返すか、エラーを上位に投げる
      return false;
    }
  }
  
  /**
   * 現在のセッションユーザーが管理者権限を持っているか確認する。
   * Auth.jsのcheckSession()に依存。
   * @returns {boolean} 管理者であればtrue、そうでなければfalse
   */
  function checkAdminAccess() {
    Logger.log('checkAdminAccess: 開始');
    try {
      // Auth.js に実装予定の関数を呼び出す
      // ★★★ 注意: 現時点では Auth.js と checkSession 関数は未実装 ★★★
      if (typeof checkSession !== 'function') {
          Logger.log('checkAdminAccess: checkSession関数が定義されていません。Auth.jsが未実装の可能性があります。');
          return false; // 依存関数がない場合は false を返す
      }
      const userSession = checkSession(); // Auth.js (予定)
  
      if (!userSession) {
        Logger.log('checkAdminAccess: セッション情報なし -> false');
        return false;
      }
  
      // スタッフマスターの列名に合わせてキーを指定
      const userEmail = userSession['メールアドレス'] || userSession.email; // userSessionの構造に依存
      if (!userEmail) {
          Logger.log('checkAdminAccess: セッションからメールアドレスを取得できませんでした。 -> false');
          return false;
      }
  
      const result = isAdmin(userEmail); // 上記の isAdmin 関数を呼び出す
      Logger.log('checkAdminAccess: isAdmin判定結果 = ' + result);
      return result;
  
    } catch (e) {
      Logger.log('checkAdminAccess: エラー発生 - ' + e.toString() + '\n' + e.stack);
      console.error('管理者アクセスチェックエラー (checkAdminAccess): ', e);
      return false; // エラー時も false
    }
  }
  
  
  // --- 他の共通ユーティリティ関数 (必要に応じて追加) ---
  
  /**
   * Dateオブジェクトまたは日付文字列をYYYY-MM-DD形式に変換する（サーバーサイド版）
   * クライアントサイド (script.html) にも同等の関数があるが、GAS側でも必要な場合があるため用意。
   * @param {Date|string|null} date - 変換対象の日付
   * @returns {string} YYYY-MM-DD形式の文字列、または空文字
   */
  function formatYmd(date) {
    if (!date) return '';
    try {
      let d;
      if (date instanceof Date) {
        d = date;
      } else {
        d = new Date(date);
      }
      if (isNaN(d.getTime())) return ''; // 無効な日付
  
      // Utilities.formatDate はタイムゾーンを考慮する必要がある
      // Session.getScriptTimeZone() でスクリプトのタイムゾーンを取得
      return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
    } catch (e) {
      Logger.log('formatYmd Error: ' + e);
      return '';
    }
  }
  
  /**
   * スプレッドシートのヘッダー行から指定した列名のインデックスを取得する
   * @param {Array<string>} headers - ヘッダー行の配列
   * @param {string} columnName - 検索する列名
   * @returns {number} 列のインデックス (0始まり)。見つからない場合は -1。
   */
  function findColumnIndex(headers, columnName) {
    if (!Array.isArray(headers) || typeof columnName !== 'string') {
      return -1;
    }
    // ヘッダー内の前後の空白をトリムして比較
    const trimmedHeaders = headers.map(h => String(h).trim());
    const trimmedColumnName = columnName.trim();
    return trimmedHeaders.indexOf(trimmedColumnName);
  }