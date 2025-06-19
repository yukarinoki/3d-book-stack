import { describe, it, expect } from 'vitest';
import { positionBooksForMode, positionBooksByTimeline } from '../bookPositioning';
import type { Book } from '@/types';

const createMockBook = (id: string, finishDate: string | null = null, purchaseDate: string | null = null): Book => ({
  id,
  title: `Book ${id}`,
  author: `Author ${id}`,
  dimensions: { width: 100, height: 150, depth: 20 },
  bookType: 'paperback',
  finishDate,
  purchaseDate,
});

describe('bookPositioning', () => {
  describe('positionBooksForMode', () => {
    it('timelineモードで正しく本を配置する', () => {
      const books: Book[] = [
        createMockBook('1', '2024-01-15'),
        createMockBook('2', '2024-01-20'),
        createMockBook('3', '2024-02-10'),
      ];

      const positioned = positionBooksForMode(books, 'timeline');
      
      expect(positioned).toHaveLength(3);
      expect(positioned[0].id).toBe('1');
      expect(positioned[1].id).toBe('2');
      expect(positioned[2].id).toBe('3');
    });
  });

  describe('positionBooksByTimeline', () => {
    it('同じ週の本は同じスタックに配置される', () => {
      const books: Book[] = [
        createMockBook('1', '2024-01-15'), // 月曜日
        createMockBook('2', '2024-01-17'), // 水曜日（同じ週）
        createMockBook('3', '2024-01-19'), // 金曜日（同じ週）
      ];

      const positioned = positionBooksByTimeline(books, 'week');
      
      // 同じ週なので、X座標が同じになるはず
      expect(positioned[0].position[0]).toBe(positioned[1].position[0]);
      expect(positioned[1].position[0]).toBe(positioned[2].position[0]);
      
      // Y座標（高さ）は積み上げられるので異なる
      expect(positioned[1].position[1]).toBeGreaterThan(positioned[0].position[1]);
      expect(positioned[2].position[1]).toBeGreaterThan(positioned[1].position[1]);
    });

    it('異なる週の本は異なるスタックに配置される', () => {
      const books: Book[] = [
        createMockBook('1', '2024-01-15'), // 第3週
        createMockBook('2', '2024-01-22'), // 第4週
        createMockBook('3', '2024-01-29'), // 第5週
      ];

      const positioned = positionBooksByTimeline(books, 'week');
      
      // 異なる週なので、X座標が異なる
      expect(positioned[0].position[0]).not.toBe(positioned[1].position[0]);
      expect(positioned[1].position[0]).not.toBe(positioned[2].position[0]);
      
      // それぞれのスタックの最初の本なので、Y座標は同じ
      expect(positioned[0].position[1]).toBe(positioned[1].position[1]);
      expect(positioned[1].position[1]).toBe(positioned[2].position[1]);
    });

    it('月単位で本をグループ化する', () => {
      const books: Book[] = [
        createMockBook('1', '2024-01-15'),
        createMockBook('2', '2024-01-30'),
        createMockBook('3', '2024-02-10'),
        createMockBook('4', '2024-02-20'),
      ];

      const positioned = positionBooksByTimeline(books, 'month');
      
      // 同じ月の本は同じX座標
      expect(positioned[0].position[0]).toBe(positioned[1].position[0]);
      expect(positioned[2].position[0]).toBe(positioned[3].position[0]);
      
      // 異なる月の本は異なるX座標
      expect(positioned[0].position[0]).not.toBe(positioned[2].position[0]);
    });

    it('年単位で本をグループ化する', () => {
      const books: Book[] = [
        createMockBook('1', '2023-06-15'),
        createMockBook('2', '2023-12-30'),
        createMockBook('3', '2024-02-10'),
        createMockBook('4', '2024-08-20'),
      ];

      const positioned = positionBooksByTimeline(books, 'year');
      
      // 同じ年の本は同じX座標
      expect(positioned[0].position[0]).toBe(positioned[1].position[0]);
      expect(positioned[2].position[0]).toBe(positioned[3].position[0]);
      
      // 異なる年の本は異なるX座標
      expect(positioned[0].position[0]).not.toBe(positioned[2].position[0]);
    });

    it('finishDateがない本は購入日を使用する', () => {
      const books: Book[] = [
        createMockBook('1', null, '2024-01-15'),
        createMockBook('2', '2024-01-20'),
      ];

      const positioned = positionBooksByTimeline(books, 'week');
      
      // 両方とも同じ週なので、同じX座標になるはず
      expect(positioned[0].position[0]).toBe(positioned[1].position[0]);
    });

    it('日付がない本は最後に配置される', () => {
      const books: Book[] = [
        createMockBook('1', null, null),
        createMockBook('2', '2024-01-20'),
        createMockBook('3', '2024-02-10'),
      ];

      const positioned = positionBooksByTimeline(books, 'week');
      
      // 日付がない本は最後のグループに配置される
      const lastBookX = positioned[positioned.length - 1].position[0];
      const noDateBook = positioned.find(b => b.id === '1');
      expect(noDateBook?.position[0]).toBe(lastBookX);
    });

    it('古い本から新しい本の順に並べられる', () => {
      const books: Book[] = [
        createMockBook('1', '2024-03-15'),
        createMockBook('2', '2024-01-20'),
        createMockBook('3', '2024-02-10'),
      ];

      const positioned = positionBooksByTimeline(books, 'month');
      
      // X座標が時系列順になっているか確認
      const janBook = positioned.find(b => b.id === '2');
      const febBook = positioned.find(b => b.id === '3');
      const marBook = positioned.find(b => b.id === '1');
      
      expect(janBook!.position[0]).toBeLessThan(febBook!.position[0]);
      expect(febBook!.position[0]).toBeLessThan(marBook!.position[0]);
    });

    it('スタック間の間隔が適切に設定される', () => {
      const books: Book[] = [
        createMockBook('1', '2024-01-15'),
        createMockBook('2', '2024-01-22'),
        createMockBook('3', '2024-01-29'),
      ];

      const positioned = positionBooksByTimeline(books, 'week');
      
      // スタック間の間隔をチェック
      const spacing = positioned[1].position[0] - positioned[0].position[0];
      expect(spacing).toBeGreaterThan(0.2); // 最小間隔は20cm
      expect(spacing).toBeLessThan(1.0); // 最大間隔は1m
    });

    it('各スタックにラベル情報が含まれる', () => {
      const books: Book[] = [
        createMockBook('1', '2024-01-15'),
        createMockBook('2', '2024-02-20'),
      ];

      const positioned = positionBooksByTimeline(books, 'month');
      
      // ラベル情報の確認
      expect(positioned[0].groupLabel).toBe('2024年1月');
      expect(positioned[1].groupLabel).toBe('2024年2月');
    });
  });
});