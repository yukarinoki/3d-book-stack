# テスト駆動開発ガイド

## 概要

このプロジェクトはVitestを使用したテスト駆動開発（TDD）を採用しています。

## ディレクトリ構造

```
src/
├── __tests__/              # アプリケーションレベルのテスト
├── components/
│   └── __tests__/          # コンポーネントのテスト
├── hooks/
│   └── __tests__/          # カスタムフックのテスト
├── utils/
│   └── __tests__/          # ユーティリティ関数のテスト
└── test/
    └── setup.ts            # テスト環境のセットアップ
```

## テストの実行

```bash
# テストの実行
npm run test

# UIモードでテストを実行
npm run test:ui

# カバレッジレポート付きでテストを実行
npm run test:coverage
```

## TDDワークフロー

1. **Red**: 失敗するテストを書く
2. **Green**: テストが通る最小限のコードを実装
3. **Refactor**: コードをリファクタリング

## テストの書き方

### コンポーネントテスト

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### ユーティリティ関数テスト

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '../myFunction'

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction(input)
    expect(result).toBe(expectedValue)
  })
})
```

## モックの使用

Three.js関連のAPIは`src/test/setup.ts`でモック化されています。必要に応じて追加のモックを設定してください。

## ベストプラクティス

1. テストは独立して実行可能にする
2. テストは予測可能で再現可能にする
3. 1つのテストで1つの機能をテスト
4. テスト名は何をテストしているか明確にする
5. Arrange-Act-Assertパターンを使用する