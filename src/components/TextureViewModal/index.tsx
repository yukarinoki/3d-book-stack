import { useEffect } from 'react';
import type { FC } from 'react';
import { X } from 'lucide-react';
import type { Book } from '@/types';
import { TextureGrid } from './TextureGrid';

interface TextureViewModalProps {
  book: Book;
  onClose: () => void;
}

export const TextureViewModal: FC<TextureViewModalProps> = ({ book, onClose }) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // デバッグログ
  useEffect(() => {
    console.log('TextureViewModal mounted');
    console.log('Book:', book);
    return () => {
      console.log('TextureViewModal unmounted');
    };
  }, [book]);

  console.log('TextureViewModal rendering with book:', book.title);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[99999]">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* モーダル本体 */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden z-[100000]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            テクスチャ確認 - {book.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <TextureGrid book={book} />
        </div>
      </div>
    </div>
  );
};