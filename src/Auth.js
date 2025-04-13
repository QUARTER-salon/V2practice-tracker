/**
 * 美容師練習管理Webアプリ V2
 * 認証関連 GAS関数 (Auth.js)
 */

// ★★★ 将来的に DataAccess.js に移行する処理 ★★★
/**
 * 指定されたメールアドレスに紐づくスタッフ情報をスタッフマスターシートから検索する（内部関数）
 * @param {string} email - 検索するメールアドレス
 * @returns {object | null} スタッフ情報オブジェクト、見つからない場合は null
 * @throws {Error} シートが見つからない場合や必須列が見つからない場合
 */
function findStaffByEmail_(email) {
    if (!email || typeof email !== 'string') {
      Logger.log('findStaffByEmail_: 無効なメールアドレスです。 email=' + email);
      return null;
    }
    const lowerEmail = email.toLowerCase();
    Logger.log('findStaffByEmail_: 検索開始 - Email: ' + lowerEmail + ', SpreadsheetID: ' + SPREADSHEET_ID + ', SheetName: ' + STAFF_MASTER_SHEET_NAME);
  
    try {
      // スプレッドシートとシートを取得
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID); // 直接IDで開く方が確実
      const staffSheet = ss.getSheetByName(STAFF_MASTER_SHEET_NAME);
      if (!staffSheet) {
        Logger.log('findStaffByEmail_: エラー - スタッフマスターシートが見つかりません。シート名: ' + STAFF_MASTER_SHEET_NAME);
        throw new Error('スタッフマスターシートが見つかりません。管理者に確認してください。');
      }
  
      // 全データを取得
      const staffData = staffSheet.getDataRange().getValues();
      if (staffData.length < 2) { // ヘッダー + データ1行以上
        Logger.log('findStaffByEmail_: スタッフマスターシートにデータがありません（ヘッダーのみか空）。');
        return null;
      }
  
      // ヘッダー行から列インデックスを取得
      const headers = staffData[0].map(header => String(header).trim());
      const emailIndex = findColumnIndex(headers, 'メールアドレス'); // Utils.js の関数を想定
      const nameIndex = findColumnIndex(headers, '名前');
      const storeIndex = findColumnIndex(headers, '店舗');
      const roleIndex = findColumnIndex(headers, 'Role'); // REQUIREMENTS.txt に合わせた列名
      const employeeIdIndex = findColumnIndex(headers, '社員番号');
      const adminFlagIndex = findColumnIndex(headers, '管理者フラグ'); // Utils.js の isAdmin でも使う
  
      // 必須列の存在チェック
      if ([emailIndex, nameIndex, storeIndex, roleIndex, employeeIdIndex, adminFlagIndex].includes(-1)) {
        Logger.log('findStaffByEmail_: エラー - スタッフマスターに必要な列が見つかりません。確認した列: メールアドレス, 名前, 店舗, Role, 社員番号, 管理者フラグ');
        const missingColumns = [];
        if (emailIndex === -1) missingColumns.push('メールアドレス');
        if (nameIndex === -1) missingColumns.push('名前');
        if (storeIndex === -1) missingColumns.push('店舗');
        if (roleIndex === -1) missingColumns.push('Role');
        if (employeeIdIndex === -1) missingColumns.push('社員番号');
        if (adminFlagIndex === -1) missingColumns.push('管理者フラグ');
        throw new Error('スタッフマスターシートの列構成が正しくありません。不足列: ' + missingColumns.join(', ') + '。管理者に確認してください。');
      }
      Logger.log('findStaffByEmail_: 列インデックス確認OK - Email:'+emailIndex+', Name:'+nameIndex+', Store:'+storeIndex+', Role:'+roleIndex+', EmpID:'+employeeIdIndex+', Admin:'+adminFlagIndex);
  
  
      // データ行を検索
      for (let i = 1; i < staffData.length; i++) {
        const row = staffData[i];
        const sheetEmail = row[emailIndex] ? String(row[emailIndex]).trim().toLowerCase() : '';
  
        if (sheetEmail === lowerEmail) {
          Logger.log('findStaffByEmail_: メールアドレス一致 (行 ' + (i + 1) + ')');
          // 管理者フラグを判定 (Utils.isAdmin と同じロジックをここでも適用する)
          const isAdminFlagRaw = row[adminFlagIndex];
          const isAdminUser = (
            isAdminFlagRaw === true ||
            String(isAdminFlagRaw).trim().toUpperCase() === 'TRUE' ||
            isAdminFlagRaw === 1
          );
  
          const staffInfo = {
            employeeId: row[employeeIdIndex] ? String(row[employeeIdIndex]).trim() : '',
            name: row[nameIndex] ? String(row[nameIndex]).trim() : '',
            store: row[storeIndex] ? String(row[storeIndex]).trim() : '',
            role: row[roleIndex] ? String(row[roleIndex]).trim() : '',
            email: sheetEmail, // 元のメールアドレスではなく、シート上の（小文字化された）メールアドレス
            isAdmin: isAdminUser
          };
          Logger.log('findStaffByEmail_: スタッフ情報が見つかりました: ' + JSON.stringify(staffInfo));
          return staffInfo;
        }
      }
  
      Logger.log('findStaffByEmail_: 一致するメールアドレスが見つかりませんでした。');
      return null; // 見つからなかった場合
  
    } catch (e) {
      Logger.log('findStaffByEmail_: 重大なエラー発生 - ' + e.toString() + '\n' + e.stack);
      console.error('スタッフ情報検索エラー (findStaffByEmail_): ', e);
      // エラーを再スローして呼び出し元で処理するか、nullを返すかは設計による
      // ここではエラーを投げて、呼び出し元でハンドリングする
      throw new Error('スタッフ情報の検索中にエラーが発生しました。詳細: ' + e.message);
    }
  }
  // ★★★ ここまで将来的に DataAccess.js に移行する処理 ★★★
  
  
  /**
   * 現在のセッション状態（ログイン状態とユーザー情報）を確認する。
   * フロントエンドのページ読み込み時などに呼び出される想定。
   * @returns {object} { isLoggedIn: boolean, userInfo: object | null }
   *                   userInfo: { employeeId, name, store, role, email, isAdmin }
   */
  function checkSession() {
    Logger.log('checkSession: 開始');
    let userEmail = null;
    try {
      userEmail = Session.getActiveUser().getEmail();
      if (!userEmail) {
        Logger.log('checkSession: Googleセッションからメールアドレスを取得できませんでした。未ログイン状態。');
        return { isLoggedIn: false, userInfo: null };
      }
      Logger.log('checkSession: GoogleセッションEmail: ' + userEmail);
  
      // ★★★ 将来的には DataAccess.js の関数を呼び出す ★★★
      const staffInfo = findStaffByEmail_(userEmail);
      // ★★★ ここまで ★★★
  
      if (staffInfo) {
        Logger.log('checkSession: スタッフマスターに該当あり。ログイン状態。 userInfo=' + JSON.stringify(staffInfo));
        return { isLoggedIn: true, userInfo: staffInfo };
      } else {
        Logger.log('checkSession: スタッフマスターに該当なし。ユーザー登録されていないか、メールアドレス不一致。');
        // この場合も未ログインとして扱うか、エラーとして扱うかは要件による
        // ここでは未ログインとして扱う
        return { isLoggedIn: false, userInfo: null, error: 'スタッフ情報が見つかりません。登録されているか確認してください。' };
      }
  
    } catch (e) {
      Logger.log('checkSession: エラー発生 - ' + e.toString() + '\n' + e.stack);
      console.error('セッションチェックエラー (checkSession): ', e);
      return { isLoggedIn: false, userInfo: null, error: 'セッションの確認中にエラーが発生しました: ' + e.message };
    }
  }
  
  /**
   * ユーザー認証を行い、成功した場合ユーザー情報を返す。
   * executeAs=USER_ACCESSING の場合、この関数が呼ばれる時点でGoogle認証は済んでいるため、
   * 実質的には checkSession と同様にスタッフマスターとの照合を行う。
   * フロントエンドのログインボタン押下時などに呼び出される想定。
   * @returns {object} { success: boolean, userInfo: object | null, error: string | null }
   *                   userInfo: { employeeId, name, store, role, email, isAdmin }
   */
  function getAuthenticationInfo() {
    Logger.log('getAuthenticationInfo: 開始');
    try {
      const sessionResult = checkSession(); // 内部でスタッフマスター照合まで行う
  
      if (sessionResult.isLoggedIn) {
        Logger.log('getAuthenticationInfo: 認証成功（スタッフマスターに該当あり）。');
        return { success: true, userInfo: sessionResult.userInfo, error: null };
      } else {
        Logger.log('getAuthenticationInfo: 認証失敗（未ログインまたはスタッフマスターに該当なし）。');
        // sessionResult に error が含まれていればそれを使う
        const errorMessage = sessionResult.error || 'ログインに失敗しました。Googleアカウントを確認するか、管理者に連絡してください。';
        return { success: false, userInfo: null, error: errorMessage };
      }
    } catch (e) {
      // checkSession内で捕捉されなかった予期せぬエラー
      Logger.log('getAuthenticationInfo: 重大なエラー発生 - ' + e.toString() + '\n' + e.stack);
      console.error('認証情報取得エラー (getAuthenticationInfo): ', e);
      return { success: false, userInfo: null, error: '認証処理中に予期せぬエラーが発生しました: ' + e.message };
    }
  }
  
  /**
   * ログアウト処理（サーバーサイドでの明示的なセッション破棄は限定的）
   * クライアント側でログアウト状態に遷移させることを想定し、成功ステータスのみ返す。
   * @returns {object} { success: boolean }
   */
  function logout() {
    Logger.log('logout: 処理開始');
    // executeAs=USER_ACCESSING の場合、GAS側でユーザーのGoogleセッションを直接破棄することはできない。
    // アプリケーション独自のセッション情報（PropertiesServiceなど）を使っていれば、それをここで削除する。
    // 今回は特にアプリ独自セッションは使わない想定のため、何もせず成功を返す。
    Logger.log('logout: サーバー側での明示的なログアウト処理はなし。クライアント側での処理を想定。');
    return { success: true };
  }
  
  /* 不要な場合が多いが、GoogleログアウトURLを返す場合の例（参考）
  function getLogoutUrl() {
    // このURLは固定
    const logoutUrl = 'https://accounts.google.com/logout';
    Logger.log('getLogoutUrl: GoogleログアウトURLを返します: ' + logoutUrl);
    return { logoutUrl: logoutUrl };
  }
  */
  
  /**
   * 現在のユーザーが管理者権限を持っているか確認する。
   * @returns {object} { isAdmin: boolean, error: string | null }
   */
  function checkAdminStatus() {
    Logger.log('checkAdminStatus: 開始');
    try {
      const sessionResult = checkSession(); // ユーザー情報を取得
  
      if (!sessionResult.isLoggedIn) {
        Logger.log('checkAdminStatus: ユーザーがログインしていません。');
        // ログインしていない場合は管理者ではない
        return { isAdmin: false, error: 'ユーザーがログインしていません。' };
      }
  
      // userInfo が null でないことを確認（念のため）
      if (!sessionResult.userInfo) {
           Logger.log('checkAdminStatus: ログインしていますが、ユーザー情報が取得できませんでした。');
           return { isAdmin: false, error: 'ユーザー情報が取得できませんでした。' };
      }
  
      // Utils.jsのisAdminを直接呼び出すのではなく、取得済みのstaffInfo.isAdminを使う方が効率的
      const isAdminUser = sessionResult.userInfo.isAdmin;
      Logger.log('checkAdminStatus: 管理者ステータス = ' + isAdminUser);
      return { isAdmin: isAdminUser, error: null };
  
    } catch (e) {
      Logger.log('checkAdminStatus: エラー発生 - ' + e.toString() + '\n' + e.stack);
      console.error('管理者ステータス確認エラー (checkAdminStatus): ', e);
      return { isAdmin: false, error: '管理者ステータスの確認中にエラーが発生しました: ' + e.message };
    }
  }
  
  // --- 補助関数 (findColumnIndex) ---
  // Utils.js にある想定だが、Auth.js単体で動作確認する場合などに備えてここにも定義しておくか、
  // Utils.jsが必ず読み込まれることを保証する。
  // ここでは Utils.js にある前提とする。
  /*
  function findColumnIndex(headers, columnName) {
    // ... Utils.js と同じ実装 ...
  }
  */