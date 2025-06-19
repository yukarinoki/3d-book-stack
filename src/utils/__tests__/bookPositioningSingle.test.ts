import { describe, it, expect } from 'vitest';
import { positionSingleBook } from '../bookPositioning';
import type { Book } from '@/types';

const createMockBook = (id: string): Book => ({
  id,
  title: `Book ${id}`,
  author: `Author ${id}`,
  dimensions: { width: 105, height: 148, depth: 20 },
  bookType: 'paperback',
});

describe('positionSingleBook', () => {
  it('選択された本が中央に配置される', () => {
    const books: Book[] = [
      createMockBook('1'),
      createMockBook('2'),
      createMockBook('3'),
    ];

    const positioned = positionSingleBook(books, '2');

    // 選択された本が中央に配置される
    const selectedBook = positioned.find(b => b.id === '2');
    expect(selectedBook?.position[0]).toBe(0);
    expect(selectedBook?.position[1]).toBeCloseTo(0);
    expect(selectedBook?.position[2]).toBe(0);
  });

  it('選択された本が大きく表示される', () => {
    const books: Book[] = [
      createMockBook('1'),
      createMockBook('2'),
      createMockBook('3'),
    ];

    const positioned = positionSingleBook(books, '2');

    // 選択された本にはスケール情報が付与される
    const selectedBook = positioned.find(b => b.id === '2');
    expect(selectedBook?.scale).toBe(2); // 2倍のスケール
  });

  it('他の本は背景に小さく配置される', () => {
    const books: Book[] = [
      createMockBook('1'),
      createMockBook('2'),
      createMockBook('3'),
      createMockBook('4'),
    ];

    const positioned = positionSingleBook(books, '2');

    // 選択されていない本
    const otherBooks = positioned.filter(b => b.id !== '2');
    
    // 背景に配置される（Z座標が負）
    otherBooks.forEach(book => {
      expect(book.position[2]).toBeLessThan(-1);
    });

    // 小さく表示される
    otherBooks.forEach(book => {
      expect(book.scale).toBe(0.5);
    });
  });

  it('背景の本は円形に配置される', () => {
    const books: Book[] = [
      createMockBook('1'),
      createMockBook('2'),
      createMockBook('3'),
      createMockBook('4'),
      createMockBook('5'),
    ];

    const positioned = positionSingleBook(books, '3');
    const backgroundBooks = positioned.filter(b => b.id !== '3');

    // 各本の角度を計算
    const angles = backgroundBooks.map(book => 
      Math.atan2(book.position[1], book.position[0])
    );

    // 角度が均等に分布しているか確認
    const sortedAngles = [...angles].sort((a, b) => a - b);
    for (let i = 1; i < sortedAngles.length; i++) {
      const diff = sortedAngles[i] - sortedAngles[i - 1];
      expect(diff).toBeCloseTo(2 * Math.PI / backgroundBooks.length, 1);
    }
  });

  it('選択された本がない場合は最初の本を選択', () => {
    const books: Book[] = [
      createMockBook('1'),
      createMockBook('2'),
      createMockBook('3'),
    ];

    const positioned = positionSingleBook(books, '999'); // 存在しないID

    // 最初の本が中央に配置される
    const firstBook = positioned.find(b => b.id === '1');
    expect(firstBook?.position[0]).toBe(0);
    expect(firstBook?.position[1]).toBeCloseTo(0);
    expect(firstBook?.position[2]).toBe(0);
    expect(firstBook?.scale).toBe(2);
  });

  it('本が1冊しかない場合でも正しく配置される', () => {
    const books: Book[] = [
      createMockBook('1'),
    ];

    const positioned = positionSingleBook(books, '1');

    expect(positioned).toHaveLength(1);
    expect(positioned[0].position[0]).toBe(0);
    expect(positioned[0].position[1]).toBeCloseTo(0);
    expect(positioned[0].position[2]).toBe(0);
    expect(positioned[0].scale).toBe(2);
  });

  it('選択された本は正面を向く', () => {
    const books: Book[] = [
      createMockBook('1'),
      createMockBook('2'),
    ];

    const positioned = positionSingleBook(books, '1');

    const selectedBook = positioned.find(b => b.id === '1');
    expect(selectedBook?.rotation[0]).toBe(0);
    expect(selectedBook?.rotation[1]).toBe(0);
    expect(selectedBook?.rotation[2]).toBe(0);
  });
});