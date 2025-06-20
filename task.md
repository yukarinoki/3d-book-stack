# 3D Book Stack - 実装タスク管理

## 実装の基本方針

1. **段階的リリース**: 各フェーズで動作する機能を完成させる
2. **基礎から構築**: 3D表示基盤 → データ管理 → 物理演算 → 高度な機能
3. **ユーザー価値の早期提供**: 最小限の機能でも価値を感じられる状態を目指す

## Phase 1: MVP - 基礎構築（1-2週間）

**パフォーマンス目標**: 最大20冊の本を60FPSで表示

### 1.1 プロジェクト基盤整備

- [x] プロジェクト構造の整理
  - [x] ディレクトリ構造の設計（components/, features/, utils/, types/）
  - [x] TypeScript設定の最適化
  - [x] ESLint/Prettier設定
- [x] 基本的なUIフレームワーク導入
  - [x] Tailwind CSS設定
  - [x] 基本レイアウトコンポーネント作成

### 1.2 3D表示基盤構築

- [x] Three.js/React Three Fiber環境構築
  - [x] 基本的なCanvasコンポーネント作成
  - [x] カメラ設定（OrbitControls）
  - [x] ライティング設定
- [x] 本の基本3Dモデル実装
  - [x] Box geometryベースの本モデル
  - [x] 基本的なマテリアル設定（単色またはプリセットテクスチャ）
  - [x] プリセット形状（文庫本、ハードカバー）のみ実装

### 1.3 データモデル設計

- [x] 本のデータ型定義（TypeScript interfaces）

  ```typescript
  interface Book {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    dimensions: { width: number; height: number; depth: number; };
    bookType: 'paperback' | 'hardcover' | 'softcover' | 'manga';
    pageCount?: number;
    publisher?: string;
    purchaseDate?: string;
    finishDate?: string;
    rating?: 'bad' | 'good' | 'very good';
    category?: string;
    comment?: string; // 最大140文字
    privacySetting?: 'public' | 'friends' | 'close_friends' | 'private';
    // ... その他のプロパティ
  }
  ```

- [x] モックデータの作成
- [x] ローカルステート管理（Zustand）のセットアップ

## Phase 2: 機能拡張（2-3週間）

**パフォーマンス目標**: 最大50冊の本を60FPSで表示

### 2.1 表示モードの拡張

- [x] 表紙並べモードの実装
- [x] 背表紙並べモード（本棚モード）の実装
  - [x] 本棚の両端の支え追加
- [x] モード切り替えトランジション
- [x] 時系列山積みモード（週/月/年単位）
- [x] 評価別表示モード（bad/good/very good）
- [x] 個別本表示モード

### 2.2 インタラクション機能の強化

- [x] ドラッグ&ドロップ実装（@use-gesture/react）
- [x] マウスオーバーで本の情報表示
- [x] 本のクリックで詳細情報表示
- [x] 複数選択と一括操作
- [x] WASDキーでの本の操作
- [x] 物理エンジンを使った本の操作モード

### 2.3 画像アップロード機能

- [x] 写真アップロード機能（File API）
- [x] 基本的な切り取り・調整ツール（Canvas API）
- [x] プレビュー機能
- [x] テクスチャの本への適用
- [ ] ISBN経由での表紙画像自動取得（将来実装）
- [ ] ジェネリックな表紙の自動生成（将来実装）

### 2.4 IndexedDBによる大容量ローカルストレージ

- [x] IndexedDBのセットアップ
- [x] 画像データの保存・読み込み
- [x] 本のメタデータ管理
- [x] オフラインキャッシュ機能

## Phase 3: クラウド対応（3-4週間）

**パフォーマンス目標**: サーバーとの連携を含めた上での安定性確保

### 3.1 バックエンドAPI構築

- [ ] Node.js + Express または FastAPIセットアップ
- [ ] AWS RDS（PostgreSQL）データベース設計
- [ ] 本のCRUD API
- [ ] JWT/OAuth2認証実装
- [ ] プライバシー設定API（有料機能）

### 3.2 AWS S3連携

- [ ] S3バケット設定
- [ ] 3Dモデルファイルの保存
- [ ] テクスチャ画像の保存
- [ ] CloudFront CDN設定

### 3.3 ユーザー機能・共有機能

- [ ] ユーザー登録・ログイン
- [ ] プロフィール機能
- [ ] フォロー機能（友達機能）
- [ ] 共有リンク生成
- [ ] OGP対応（SNS共有時のプレビュー）
- [ ] 本がドサッと落ちてくる共有演出
- [ ] 公開/限定公開設定
  - [ ] 全体公開/非公開（有料）
  - [ ] 個別本の公開設定（全員/友人/親しい友人/非公開）

### 3.4 モバイルセンサー対応

- [x] Device Orientation APIの実装
- [x] 加速度センサーでの本の操作
- [x] シェイクで跳ね上げ機能
- [x] タッチジェスチャーの完全サポート

## Phase 4: 最適化・公開（2-3週間）

**パフォーマンス目標**: 最大600冊の本を処理可能（表示最適化込み）

### 4.1 パフォーマンス最適化

- [ ] WebWorkerによる処理の並列化
- [ ] テクスチャ圧縮と最適化
- [ ] LOD（Level of Detail）実装
- [ ] メモリ使用量の最適化

### 4.2 埋め込み機能

- [ ] iframe用の軽量版ビューア作成
- [ ] 埋め込みコード生成UI
- [ ] カスタマイズオプション
- [ ] ウィジェットモード

### 4.3 モバイル最適化

- [ ] レスポンシブ3Dビューポート
- [ ] パフォーマンスの自動調整
- [ ] タッチ操作のUX最適化
- [ ] デバイス別最適化

### 4.4 PWA対応

- [x] Service Worker実装
- [x] オフライン動作の実現
- [x] アプリマニフェスト作成
- [x] インストールプロンプト

## Phase 5: 品質向上・リリース準備（1-2週間）

### 5.1 テスト

- [x] ユニットテスト作成
- [ ] E2Eテスト実装
- [ ] パフォーマンステスト
- [ ] ブラウザ互換性テスト

### 5.2 ドキュメント

- [ ] ユーザーマニュアル作成
- [ ] API ドキュメント
- [ ] デプロイメントガイド
- [ ] コントリビューションガイド

### 5.3 リリース準備

- [ ] 本番環境構築（AWS）
- [ ] CI/CD パイプライン設定
- [ ] モニタリング・ログ設定
- [ ] セキュリティ監査
- [ ] 有料プラン決済システム実装

### 5.4 拡張機能（オプション）

- [ ] AR対応（本棚を現実空間に表示）

## 優先度の考え方

### Phase 1 (MVP) - 必須機能

1. 基本的な3Dスタック表示（20冊まで）
2. プリセット形状の本（文庫本、ハードカバー）
3. 基本的な物理シミュレーション
4. ローカルストレージ保存

### Phase 2 - 重要機能

1. 複数の表示モード
2. 画像アップロード・テクスチャマッピング
3. ドラッグ&ドロップなどのインタラクション
4. IndexedDBによる大容量データ保存

### Phase 3-4 - 付加価値機能

1. クラウド連携・共有機能
2. モバイルセンサー対応
3. PWA対応
4. 埋め込み機能

## 技術的な注意点

1. **パフォーマンス**:
   - Phase 1: 20冊で60FPSを目標
   - Phase 2: 50冊で60FPSを目標
   - Phase 4: 最大600冊を処理可能（LODやページングで最適化）
2. **メモリ管理**: テクスチャやモデルのメモリ使用量に注意し、不要なリソースは解放
3. **プログレッシブエンハンスメント**: 基本機能は低スペックデバイスでも動作するように
4. **アクセシビリティ**: キーボード操作やスクリーンリーダー対応を考慮
5. **オフラインファースト**: IndexedDBとService Workerを活用したオフライン動作
6. **モバイル対応**: 完全対応を前提とし、パフォーマンスは考慮しない方針

## 開発の進め方

1. 各フェーズの完了時点で動作確認とフィードバック収集
2. 2週間ごとのスプリントで進捗管理
3. 定期的なコードレビューとリファクタリング
4. ユーザーテストを早期から実施
5. 各フェーズでパフォーマンス目標を達成してから次のフェーズへ進む
