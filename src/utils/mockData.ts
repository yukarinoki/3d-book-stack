import type { Book } from '@/types';

export const createMockBooks = (): Book[] => {
  const books: Book[] = [
    {
      id: '1',
      title: 'JavaScript入門',
      author: '田中太郎',
      dimensions: { width: 148, height: 210, depth: 15 }, // A5文庫本
      bookType: 'paperback',
      color: '#FF6B6B',
      position: [0, 2, 0],
    },
    {
      id: '2',
      title: 'React完全ガイド',
      author: '佐藤花子',
      dimensions: { width: 182, height: 257, depth: 25 }, // B5ハードカバー
      bookType: 'hardcover',
      color: '#4ECDC4',
      position: [0, 3, 0],
    },
    {
      id: '3',
      title: 'TypeScript実践',
      author: '鈴木一郎',
      dimensions: { width: 148, height: 210, depth: 12 }, // A5薄型
      bookType: 'softcover',
      color: '#45B7D1',
      position: [0, 4, 0],
    },
    {
      id: '4',
      title: 'Three.js入門',
      author: '山田美咲',
      dimensions: { width: 148, height: 210, depth: 18 }, // A5文庫本
      bookType: 'paperback',
      color: '#F7DC6F',
      position: [0, 5, 0],
    },
    {
      id: '5',
      title: 'WebGL基礎講座',
      author: '高橋健太',
      dimensions: { width: 182, height: 257, depth: 30 }, // B5ハードカバー
      bookType: 'hardcover',
      color: '#BB8FCE',
      position: [0, 6, 0],
    },
    {
      id: '6',
      title: 'プログラミング漫画',
      author: '漫画太郎',
      dimensions: { width: 112, height: 174, depth: 8 }, // B6漫画サイズ
      bookType: 'manga',
      color: '#85C1E9',
      position: [1, 2, 0],
    },
    {
      id: '7',
      title: 'アルゴリズム図解',
      author: '図解花子',
      dimensions: { width: 148, height: 210, depth: 20 }, // A5
      bookType: 'softcover',
      color: '#F8C471',
      position: [1, 3, 0],
    },
    {
      id: '8',
      title: 'データベース設計',
      author: 'DB太郎',
      dimensions: { width: 182, height: 257, depth: 28 }, // B5
      bookType: 'hardcover',
      color: '#82E0AA',
      position: [1, 4, 0],
    },
  ];

  return books;
};