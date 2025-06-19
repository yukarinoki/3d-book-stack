import { useState, useRef, useCallback } from 'react';
import { useBookStore } from '@/stores';
import { saveImage } from '@/utils/db/imageOperations';
import { ImageCropModal } from './ImageCropModal';

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
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
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
        setTempImageUrl(imageDataUrl);
        setShowCropModal(true);
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
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    setPreview(null);
    await updateBook(bookId, {
      textureUrl: undefined,
      coverImageData: undefined
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // サンプル画像を選択
  const handleSampleImageSelect = (imageUrl: string) => {
    setTempImageUrl(imageUrl);
    setShowCropModal(true);
  };

  // トリミング完了時の処理
  const handleCropComplete = async (croppedImageUrl: string) => {
    setPreview(croppedImageUrl);

    try {
      // クロップした画像をBase64に変換
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async () => {
        const base64 = reader.result as string;

        // IndexedDBに画像を保存
        await saveImage(bookId, base64, blob.type);

        // 本のテクスチャURLとcoverImageDataを更新
        await updateBook(bookId, {
          textureUrl: base64,
          coverImageData: base64
        });

        // コールバックを実行
        onUploadComplete?.(base64);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('画像の保存に失敗しました:', error);
      alert('画像の保存に失敗しました');
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleButtonClick}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'アップロード中...' : '画像を選択'}
          </button>
          <span className="text-xs text-gray-500">jpg, png, gif</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>


      {tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setTempImageUrl(null);
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={2 / 3} // 本の表紙の一般的なアスペクト比
        />
      )}
    </div>
  );
}
