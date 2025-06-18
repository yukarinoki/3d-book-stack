import { useState, useRef, useCallback } from 'react';
import { useBookStore } from '@/stores';

interface ImageUploadProps {
  bookId: string;
  onUploadComplete?: (imageUrl: string) => void;
}

// デモ用のサンプル画像URL（publicディレクトリ内の画像）
const SAMPLE_IMAGES = [
  '/test_images/book_cover_1.jpg',
  '/test_images/book_cover_2.jpg',
  '/test_images/book_cover_3.jpg',
  '/test_images/book_cover_4.jpg',
  '/test_images/book_cover_5.jpg',
];

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

  // サンプル画像を選択
  const handleSampleImageSelect = (imageUrl: string) => {
    setPreview(imageUrl);
    updateBook(bookId, { textureUrl: imageUrl });
    onUploadComplete?.(imageUrl);
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
      
      {/* 開発環境でのみサンプル画像を表示 */}
      {import.meta.env.DEV && (
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">サンプル画像（開発用）:</p>
          <div className="grid grid-cols-5 gap-2">
            {SAMPLE_IMAGES.map((imageUrl, index) => (
              <button
                key={imageUrl}
                onClick={() => handleSampleImageSelect(imageUrl)}
                className="relative group"
                title={`サンプル画像 ${index + 1}`}
              >
                <img 
                  src={imageUrl} 
                  alt={`サンプル ${index + 1}`}
                  className="w-full h-20 object-cover rounded border-2 border-transparent group-hover:border-blue-500 transition-colors"
                  onError={(e) => {
                    // 画像が見つからない場合はプレースホルダーを表示
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x200?text=Sample+${index + 1}`;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-sm text-gray-600 text-center">
        JPG、PNG、GIF形式の画像をアップロードできます
      </p>
    </div>
  );
}