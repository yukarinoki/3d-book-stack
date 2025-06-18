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
    },
    {
      id: '2',
      title: 'React完全ガイド',
      author: '佐藤花子',
      dimensions: { width: 182, height: 257, depth: 25 }, // B5ハードカバー
      bookType: 'hardcover',
      color: '#4ECDC4',
    },
    {
      id: '3',
      title: 'TypeScript実践',
      author: '鈴木一郎',
      dimensions: { width: 148, height: 210, depth: 12 }, // A5薄型
      bookType: 'softcover',
      color: '#45B7D1',
    },
    {
      id: '4',
      title: 'Three.js入門',
      author: '山田美咲',
      dimensions: { width: 148, height: 210, depth: 18 }, // A5文庫本
      bookType: 'paperback',
      color: '#F7DC6F',
    },
    {
      id: '5',
      title: 'WebGL基礎講座',
      author: '高橋健太',
      dimensions: { width: 182, height: 257, depth: 30 }, // B5ハードカバー
      bookType: 'hardcover',
      color: '#BB8FCE',
    },
    {
      id: '6',
      title: 'プログラミング漫画',
      author: '漫画太郎',
      dimensions: { width: 112, height: 174, depth: 8 }, // B6漫画サイズ
      bookType: 'manga',
      color: '#85C1E9',
    },
    {
      id: '7',
      title: 'アルゴリズム図解',
      author: '図解花子',
      dimensions: { width: 148, height: 210, depth: 20 }, // A5
      bookType: 'softcover',
      color: '#F8C471',
    },
    {
      id: '8',
      title: 'データベース設計',
      author: 'DB太郎',
      dimensions: { width: 182, height: 257, depth: 28 }, // B5
      bookType: 'hardcover',
      color: '#82E0AA',
    },
  ];

  // 位置と回転は配置システムで管理するため、基本データのみ返す
  return books;
};
