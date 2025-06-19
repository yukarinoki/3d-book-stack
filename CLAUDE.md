# CLAUDE.md

必ず日本語で回答すること
実装が終わったらnpm run buildを必ずしてエラーが出ないことを確認すること。
言われたことだけをしろ、コードを勝手に書き換えるな。
デバッグ出力を勝手に消すな

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 3D book visualization application built with React, TypeScript, and Three.js. It renders interactive 3D books with physics simulation capabilities using React Three Fiber and Rapier physics engine.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Architecture

The application uses:

- **React Three Fiber** (@react-three/fiber) for 3D rendering
- **Drei** (@react-three/drei) for Three.js utilities
- **Rapier** (@react-three/rapier) for physics simulation
- **Leva** for runtime GUI controls
- **Vite** as the build tool
- **TypeScript** for type safety

Main components:

- `src/App.tsx`: Contains the main scene setup and the Book component that renders 3D book meshes with configurable dimensions and binding types (paperback/hardcover)
- Physics simulation can be toggled on/off, allowing books to drop and interact with a floor plane
- All dimensions are specified in millimeters and converted to meters for the physics engine

## 画像トリミング時の回転機能 要件定義

### 概要

画像をアップロードしてトリミングする際に、画像を90度単位で回転できる機能を追加する。特に背表紙など、撮影時の向きが異なる画像を適切な向きに調整できるようにする。

### 背景

- 本の各面（表紙、背表紙、裏表紙、天地）にテクスチャを設定できるが、背表紙は縦長の形状のため、横向きで撮影された画像を使用する場合がある
- 現在はテクスチャ側で回転を適用しているが、UVマッピングの制約により理想的な表示ができない
- トリミング段階で画像を回転させることで、より自然な表示を実現する

### 機能要件

1. **回転ボタンの追加**
   - ImageCropModalコンポーネント内に回転ボタンを配置
   - ボタンクリックで時計回りに90度回転（0° → 90° → 180° → 270° → 0°）
   - 視覚的にわかりやすい回転アイコンを使用

2. **回転処理**
   - 回転角度のstateを管理（0、90、180、270度）
   - 画像表示時にCSS transformまたはCanvas APIで回転を適用
   - react-image-cropライブラリとの互換性を維持

3. **トリミング座標の調整**
   - 回転後の画像に対して正しくトリミング領域を計算
   - 最終的な画像生成時に回転を含めた処理を実行

4. **アスペクト比の考慮**
   - 90度・270度回転時はアスペクト比を入れ替える
   - トリミング枠が画像の向きに適応する

### 技術的実装方針

1. **ImageCropModalコンポーネントの拡張**

   ```typescript
   const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
   ```

2. **回転の適用方法**
   - 初期表示: CSS transformで視覚的に回転
   - 最終出力: Canvas APIで実際に画像データを回転

3. **UI配置**
   - モーダル内の適切な位置に回転ボタンを配置
   - プレビューエリアの近くに配置して操作しやすくする

## 知見管理システム

このプロジェクトでは以下のファイルで知見を体系的に管理しています：

### `.claude/context.md`

- プロジェクトの背景、目的、制約条件
- 技術スタック選定理由
- ビジネス要件や技術的制約

### `.claude/project-knowledge.md`

- 実装パターンや設計決定の知見
- アーキテクチャの選択理由
- 避けるべきパターンやアンチパターン

### `.claude/project-improvements.md`

- 過去の試行錯誤の記録
- 失敗した実装とその原因
- 改善プロセスと結果

### `.claude/common-patterns.md`

- 頻繁に使用するコマンドパターン
- 定型的な実装テンプレート

**重要**: 新しい実装や重要な決定を行った際は、該当するファイルを更新してください。
