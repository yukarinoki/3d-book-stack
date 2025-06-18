import { useState, useRef, useCallback } from 'react';
import { useBookStore } from '@/stores';

interface ImageUploadProps {
  bookId: string;
  onUploadComplete?: (imageUrl: string) => void;
}

export function ImageUpload({ bookId, onUploadComplete }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateBook } = useBookStore();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    setIsUploading(true);

    try {
      // FileReaderを使用して画像を読み込む
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        setPreview(imageDataUrl);
        
        // 本のテクスチャURLを更新
        updateBook(bookId, { textureUrl: imageDataUrl });
        
        // コールバックを実行
        onUploadComplete?.(imageDataUrl);
        
        setIsUploading(false);
      };

      reader.onerror = () => {
        console.error('ファイルの読み込みに失敗しました');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error);
      setIsUploading(false);
    }
  }, [bookId, updateBook, onUploadComplete]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    updateBook(bookId, { textureUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        {preview && (
          <div className="mb-4 relative">
            <img 
              src={preview} 
              alt="テクスチャプレビュー" 
              className="w-32 h-48 object-cover rounded-lg shadow-md"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="画像を削除"
            >
              ×
            </button>
          </div>
        )}
        
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'アップロード中...' : '画像を選択'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      <p className="text-sm text-gray-600 text-center">
        JPG、PNG、GIF形式の画像をアップロードできます
      </p>
    </div>
  );
}