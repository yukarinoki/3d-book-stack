# Z-Index レベルデザイン

## z-index階層の定義

アプリケーション内の各要素のz-index値を以下のように定義します：

### レベル1: ベースレイヤー (z-index: 0-9)

- **3D View (Canvas)**: z-index: auto (デフォルト)
- **通常のコンテンツ**: z-index: auto

### レベル2: フローティング要素 (z-index: 10-99)

- **SelectionControls**: z-index: 40
- **PWAInstallButton**: z-index: 50
- **その他のフローティングUI**: z-index: 10-90

### レベル3: モーダル (z-index: 100-999)

- **BookDetail モーダル**: z-index: 100
- **その他のモーダル背景**: z-index: 100-199

### レベル4: 最上位モーダル (z-index: 1000-9999)

- **BookTextureUpload モーダル背景**: z-index: 1000
- **BookTextureUpload モーダルコンテンツ**: z-index: 1001
- **ImageEditor キャンバス**: z-index: 1 (相対的、モーダルコンテンツ内で使用)

### レベル5: 画像編集モーダル (z-index: 2000-2999)

- **ImageCropModal 背景**: z-index: 2000
- **ImageCropModal コンテンツ**: z-index: 2001

### レベル6: デバッグ・管理ツール (z-index: 10000+)

- **Leva コントロールパネル**: z-index: 10000+ (外部ライブラリ制御)

## 設計原則

1. **階層の明確化**: 各レベルは明確な役割を持つ
2. **余裕のある間隔**: 将来の拡張のため、各レベル間に十分な間隔を設ける
3. **相対的なz-index**: モーダル内の要素は相対的なz-indexを使用
4. **一貫性**: 同じ種類の要素は同じレベルに配置

## 実装ガイドライン

- Tailwindのz-indexクラスを使用する場合は、カスタム値を定義
- インラインスタイルは最小限に抑える
- 新しい要素を追加する際は、このドキュメントを更新する
