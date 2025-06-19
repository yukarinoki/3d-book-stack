import { describe, it, expect } from 'vitest';
import { positionBooksByRating } from '../bookPositioning';
import type { Book } from '@/types';

const createMockBook = (id: string, rating?: 'bad' | 'good' | 'very good'): Book => ({
  id,
  title: `Book ${id}`,
  author: `Author ${id}`,
  dimensions: { width: 100, height: 150, depth: 20 },
  bookType: 'paperback',
  rating,
});

describe('positionBooksByRating', () => {
  it('評価ごとに本をグループ化する', () => {
    const books: Book[] = [
      createMockBook('1', 'bad'),
      createMockBook('2', 'good'),
      createMockBook('3', 'very good'),
      createMockBook('4', 'good'),
      createMockBook('5', 'bad'),
    ];

    const positioned = positionBooksByRating(books);

    // bad評価の本が同じX座標に配置される
    const badBooks = positioned.filter(b => books.find(book => book.id === b.id)?.rating === 'bad');
    expect(badBooks[0].position[0]).toBe(badBooks[1].position[0]);

    // good評価の本が同じX座標に配置される
    const goodBooks = positioned.filter(b => books.find(book => book.id === b.id)?.rating === 'good');
    expect(goodBooks[0].position[0]).toBe(goodBooks[1].position[0]);

    // 異なる評価の本は異なるX座標に配置される
    expect(badBooks[0].position[0]).not.toBe(goodBooks[0].position[0]);
  });

  it('評価がない本は未評価グループに配置される', () => {
    const books: Book[] = [
      createMockBook('1', 'good'),
      createMockBook('2'), // 評価なし
      createMockBook('3'), // 評価なし
      createMockBook('4', 'bad'),
    ];

    const positioned = positionBooksByRating(books);

    // 評価なしの本が同じX座標に配置される
    const unratedBooks = positioned.filter(b => {
      const book = books.find(book => book.id === b.id);
      return !book?.rating;
    });
    expect(unratedBooks[0].position[0]).toBe(unratedBooks[1].position[0]);
  });

  it('評価の順序はbad -> good -> very good -> 未評価', () => {
    const books: Book[] = [
      createMockBook('1', 'very good'),
      createMockBook('2', 'bad'),
      createMockBook('3', 'good'),
      createMockBook('4'), // 未評価
    ];

    const positioned = positionBooksByRating(books);

    // X座標でソートして順序を確認
    const sortedByX = [...positioned].sort((a, b) => a.position[0] - b.position[0]);
    
    const badBook = books.find(b => b.id === '2');
    const goodBook = books.find(b => b.id === '3');
    const veryGoodBook = books.find(b => b.id === '1');
    const unratedBook = books.find(b => b.id === '4');

    // bad -> good -> very good -> 未評価の順序を確認
    const badIndex = sortedByX.findIndex(b => b.id === badBook!.id);
    const goodIndex = sortedByX.findIndex(b => b.id === goodBook!.id);
    const veryGoodIndex = sortedByX.findIndex(b => b.id === veryGoodBook!.id);
    const unratedIndex = sortedByX.findIndex(b => b.id === unratedBook!.id);

    expect(badIndex).toBeLessThan(goodIndex);
    expect(goodIndex).toBeLessThan(veryGoodIndex);
    expect(veryGoodIndex).toBeLessThan(unratedIndex);
  });

  it('各グループにラベルが設定される', () => {
    const books: Book[] = [
      createMockBook('1', 'bad'),
      createMockBook('2', 'good'),
      createMockBook('3', 'very good'),
      createMockBook('4'),
    ];

    const positioned = positionBooksByRating(books);

    // 各評価のラベルを確認
    expect(positioned.find(b => b.id === '1')?.groupLabel).toBe('😞 Bad');
    expect(positioned.find(b => b.id === '2')?.groupLabel).toBe('👍 Good');
    expect(positioned.find(b => b.id === '3')?.groupLabel).toBe('🌟 Very Good');
    expect(positioned.find(b => b.id === '4')?.groupLabel).toBe('📚 未評価');
  });

  it('同じ評価内で本が積み上げられる', () => {
    const books: Book[] = [
      createMockBook('1', 'good'),
      createMockBook('2', 'good'),
      createMockBook('3', 'good'),
    ];

    const positioned = positionBooksByRating(books);

    // 同じX座標で異なるY座標（積み上げ）
    expect(positioned[0].position[0]).toBe(positioned[1].position[0]);
    expect(positioned[1].position[0]).toBe(positioned[2].position[0]);
    
    expect(positioned[1].position[1]).toBeGreaterThan(positioned[0].position[1]);
    expect(positioned[2].position[1]).toBeGreaterThan(positioned[1].position[1]);
  });

  it('グループ間の間隔が適切に設定される', () => {
    const books: Book[] = [
      createMockBook('1', 'bad'),
      createMockBook('2', 'good'),
      createMockBook('3', 'very good'),
    ];

    const positioned = positionBooksByRating(books);

    const badBook = positioned.find(b => b.id === '1');
    const goodBook = positioned.find(b => b.id === '2');
    const veryGoodBook = positioned.find(b => b.id === '3');

    // グループ間の間隔を確認
    const spacing1 = goodBook!.position[0] - badBook!.position[0];
    const spacing2 = veryGoodBook!.position[0] - goodBook!.position[0];

    expect(spacing1).toBeGreaterThan(0.3);
    expect(spacing2).toBeGreaterThan(0.3);
  });
});