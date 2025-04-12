# 美容師練習管理Webアプリ

## 概要

Googleフォームで行っていた美容師（主にアシスタント）の練習記録管理を効率化するためのWebアプリケーション（Google Apps Script製）です。

## 背景と目的

現在Googleフォームを利用して複数店舗（4店舗）のアシスタントの練習記録を管理していますが、入力の手間、機能的な制約、集計・分析の準備負荷といった課題がありました。

本アプリは、以下の実現により、練習記録管理の効率化と利便性向上を目指します。

*   ログイン機能による記録者特定と、名前・店舗などの自動入力
*   スタッフマスター情報との連携
*   店舗、役職、技術カテゴリーに応じた入力項目の動的表示
*   ウィッグ在庫の簡易管理機能
*   スマートフォンからの入力操作性向上
*   保守性・拡張性を考慮したデータ形式での記録収集

## ドキュメント構成

本プロジェクトは、デバイドアンドコンカー（分割統治）のアプローチを採用し、以下のドキュメント構成で開発を進めます。詳細は各ファイルを参照してください。

*   **全体ドキュメント:**
    *   `docs/REQUIREMENTS.txt`: アプリケーション全体の機能・データ・非機能要件を定義。
    *   `docs/DEVELOPMENT_GUIDE.txt`: 開発環境セットアップ、Git/claspフロー、テスト、デプロイ、保守手順など、開発・運用に関する共通ルールを定義。**開発者は必ず参照してください。**
    *   `docs/CODING_STANDARD.txt`: コーディング規約（命名規則、コメントスタイルなど）。
    *   `docs/API_SPEC.txt`: フロントエンドとバックエンド間の連携（`google.script.run` 呼び出し）に関するAPI仕様。
*   **機能別詳細仕様書 (`docs/specs/`):**
    *   `00_common_spec.txt`: 共通基盤（Utils, Styles等）の仕様。
    *   `01_auth_spec.txt`: 認証機能（ログイン/ログアウト）の仕様。
    *   `02_record_spec.txt`: 練習記録機能（app画面）の仕様。
    *   `03_admin_master_spec.txt`: 管理者画面（マスター管理）の仕様。
    *   `04_admin_inventory_spec.txt`: 管理者画面（在庫管理）の仕様。
    *   *(他機能があれば追加)*
*   **機能別開発ガイド (`docs/dev/`) (任意):**
    *   各機能開発時の注意点、テスト方法、依存関係などのメモ。

*(注意: 上記ドキュメントファイルは `docs` ディレクトリ内にテキスト形式 (`.txt`) で配置されている想定です)*

## 開発環境セットアップ (概要)

ローカル環境での開発を推奨します。詳細な手順は `docs/DEVELOPMENT_GUIDE.txt` の「3. 開発プロジェクトの準備」セクションを参照してください。

### 前提ツール

*   [Node.js](https://nodejs.org/) (LTS推奨)
*   [Git](https://git-scm.com/)
*   [clasp](https://github.com/google/clasp) (`npm install -g @google/clasp`)
*   [VS Code](https://code.visualstudio.com/) (推奨)
*   Googleアカウント (開発権限を持つもの)

### 新規プロジェクトセットアップ手順の概要

1.  **ローカル開発フォルダの作成:** PC上に新しいプロジェクト用フォルダを作成します。
2.  **Gitリポジトリ初期化:** 作成したフォルダ内で `git init` を実行します。
3.  **GASプロジェクトの作成:** Google Apps Script ダッシュボードで新しいプロジェクトを作成（テスト用）。
4.  **Googleアカウント認証:** `clasp login` を実行します。
5.  **GASプロジェクトとの紐付け:** `clasp clone <スクリプトID> --rootDir ./src` を実行します。
6.  **.gitignore設定:** `.clasp.json` などをGit管理対象外に設定します。
7.  **スプレッドシートID等の設定:** `src/code.js` 内の定数（`SPREADSHEET_ID` など）を適切に設定します。
8.  **初期コードのPush:** `clasp push` でローカルのコードをGASプロジェクトに反映します。

## 主な技術スタック

*   **バックエンド:** Google Apps Script (JavaScriptベース)
*   **フロントエンド:** HTML, CSS, JavaScript (Google Apps Script の `HtmlService` を使用)
*   **データベース:** Google スプレッドシート
*   **開発ツール:** Visual Studio Code, Git, GitHub (任意), clasp