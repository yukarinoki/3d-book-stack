import { useState, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { ImageEditor } from './ImageEditor';
import { useBookStore } from '@/stores';
import type { Book } from '@/types';

interface BookTextureUploadProps {
  book: Book;
  onClose?: () => void;
}

export function BookTextureUpload({ book, onClose }: BookTextureUploadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const { updateBook } = useBookStore();


  // 画像アップロード完了時の処理
  const handleUploadComplete = useCallback((imageUrl: string) => {
    setTempImageUrl(imageUrl);
    setIsEditing(true);
  }, []);

  // 画像編集保存時の処理
  const handleEditSave = useCallback((editedImageUrl: string) => {
    updateBook(book.id, { textureUrl: editedImageUrl });
    setIsEditing(false);
    setTempImageUrl(null);
    onClose?.();
  }, [book.id, updateBook, onClose]);

  // キャンセル処理
  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setTempImageUrl(null);
  }, []);

  // 本のアスペクト比を計算
  const aspectRatio = book.dimensions.height / book.dimensions.width;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-20"
      style={{
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        style={{
          zIndex: 100000,
          position: 'relative',
        }}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">本の表紙画像を設定</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">選択中の本</p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{book.title}</span>
              <span className="text-gray-500 mx-2">|</span>
              <span className="text-gray-600">{book.author}</span>
              <span className="text-gray-500 mx-2">|</span>
              <span className="text-gray-600">{book.dimensions.width}×{book.dimensions.height}mm</span>
            </p>
          </div>

          {!isEditing ? (
            <div>
              <ImageUpload
                bookId={book.id}
                onUploadComplete={handleUploadComplete}
              />

              {book.textureUrl && (
                <div className="mt-4">
                  <h3 className="font-semibold text-sm mb-2">現在の表紙画像</h3>
                  <img
                    src={book.textureUrl}
                    alt="現在の表紙"
                    className="w-32 h-48 object-cover rounded-lg shadow-md mx-auto"
                  />
                </div>
              )}
            </div>
          ) : (
            tempImageUrl && (
              <ImageEditor
                imageUrl={tempImageUrl}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
                aspectRatio={aspectRatio}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
