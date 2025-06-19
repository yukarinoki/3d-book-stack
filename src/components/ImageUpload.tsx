import { useState, useRef, useCallback, useEffect } from 'react';
import { useBookStore } from '@/stores';
import { saveImage } from '@/utils/db/imageOperations';
import { ImageCropModal } from './ImageCropModal';
import type { Book } from '@/types';

type BookFace = 'front' | 'spine' | 'back' | 'topBottom';

interface ImageUploadProps {
  bookId: string;
  face?: BookFace;
  onUploadComplete?: (imageUrl: string) => void;
}

export function ImageUpload({ bookId, face = 'front', onUploadComplete }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateBook, books } = useBookStore();
  
  // 現在の本を取得
  const book = books.find(b => b.id === bookId);
  
  // Debug: refが設定されているか確認
  useEffect(() => {
    console.log('ImageUpload mounted, fileInputRef:', fileInputRef.current);
  }, []);
  
  // 各面に応じたアスペクト比を計算
  const getAspectRatioForFace = () => {
    if (!book) return 1.5; // デフォルト値
    
    switch (face) {
      case 'front':
      case 'back':
        // 表紙・裏表紙: 高さ÷幅
        return book.dimensions.height / book.dimensions.width;
      case 'spine':
        // 背表紙: 高さ÷厚み（縦長）
        return book.dimensions.height / book.dimensions.depth;
      case 'topBottom':
        // 天地: 幅÷厚み（横長）
        return book.dimensions.width / book.dimensions.depth;
      default:
        return 1.5;
    }
  };
  
  // 現在の面の画像を取得してプレビューに設定
  useEffect(() => {
    if (!book) return;
    
    let currentImage: string | undefined;
    switch (face) {
      case 'front':
        currentImage = book.textureUrl;
        break;
      case 'spine':
        currentImage = book.spineTextureUrl;
        break;
      case 'back':
        currentImage = book.backCoverTextureUrl;
        break;
      case 'topBottom':
        currentImage = book.topBottomTextureUrl;
        break;
    }
    
    setPreview(currentImage || null);
  }, [book, face]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select event triggered!', event.target.files);
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
    console.log('Button clicked!', fileInputRef.current);
    if (!fileInputRef.current) {
      console.error('File input ref is null!');
      return;
    }
    console.log('Attempting to click file input...');
    fileInputRef.current.click();
    console.log('File input click called');
  };

  const handleRemoveImage = async () => {
    setPreview(null);
    
    // 選択された面に応じて適切なプロパティをクリア
    const updateData: Partial<Book> = {};
    switch (face) {
      case 'front':
        updateData.textureUrl = undefined;
        updateData.coverImageData = undefined;
        break;
      case 'spine':
        updateData.spineTextureUrl = undefined;
        break;
      case 'back':
        updateData.backCoverTextureUrl = undefined;
        break;
      case 'topBottom':
        updateData.topBottomTextureUrl = undefined;
        break;
    }
    await updateBook(bookId, updateData);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

        // 選択された面に応じて適切なプロパティを更新
        const updateData: Partial<Book> = {};
        switch (face) {
          case 'front':
            updateData.textureUrl = base64;
            updateData.coverImageData = base64;
            break;
          case 'spine':
            updateData.spineTextureUrl = base64;
            break;
          case 'back':
            updateData.backCoverTextureUrl = base64;
            break;
          case 'topBottom':
            updateData.topBottomTextureUrl = base64;
            break;
        }
        await updateBook(bookId, updateData);

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
            onMouseDown={(e) => console.log('Mouse down event:', e)}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer relative z-10"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
            type="button"
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
          aspectRatio={getAspectRatioForFace()}
        />
      )}
    </div>
  );
}
