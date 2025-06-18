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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">本の表紙画像を設定</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">選択中の本</h3>
            <p className="text-sm text-gray-700">{book.title}</p>
            <p className="text-xs text-gray-500">{book.author}</p>
            <p className="text-xs text-gray-500 mt-1">
              サイズ: {book.dimensions.width}mm × {book.dimensions.height}mm
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