import { useState, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { ImageEditor } from './ImageEditor';
import { useBookStore } from '@/stores';
import type { Book } from '@/types';

interface BookTextureUploadProps {
  book: Book;
  onClose?: () => void;
}

type TabType = 'front' | 'spine' | 'back' | 'topBottom' | 'edge';

export function BookTextureUpload({ book, onClose }: BookTextureUploadProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('front');
  const [edgeColor, setEdgeColor] = useState(book.edgeColor || '#F5DEB3'); // デフォルトはクリーム色
  const { updateBook } = useBookStore();


  // 画像アップロード完了時の処理
  const handleUploadComplete = useCallback((imageUrl: string) => {
    setTempImageUrl(imageUrl);
    setIsEditing(true);
  }, []);

  // 画像編集保存時の処理
  const handleEditSave = useCallback((editedImageUrl: string) => {
    // activeTabに応じて適切なプロパティを更新
    const updateData: Partial<Book> = {};
    switch (activeTab) {
      case 'front':
        updateData.textureUrl = editedImageUrl;
        updateData.coverImageData = editedImageUrl;
        break;
      case 'spine':
        updateData.spineTextureUrl = editedImageUrl;
        break;
      case 'back':
        updateData.backCoverTextureUrl = editedImageUrl;
        break;
      case 'topBottom':
        updateData.topBottomTextureUrl = editedImageUrl;
        break;
    }
    updateBook(book.id, updateData);
    setIsEditing(false);
    setTempImageUrl(null);
  }, [book.id, updateBook, activeTab]);

  // キャンセル処理
  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setTempImageUrl(null);
  }, []);

  // アクティブタブに応じてアスペクト比を計算
  const getAspectRatio = () => {
    switch (activeTab) {
      case 'front':
      case 'back':
        return book.dimensions.height / book.dimensions.width;
      case 'spine':
        return book.dimensions.height / book.dimensions.depth;
      case 'topBottom':
        return book.dimensions.depth / book.dimensions.width;
      default:
        return 1;
    }
  };

  // 小口の色を保存
  const handleEdgeColorChange = (color: string) => {
    setEdgeColor(color);
    updateBook(book.id, { edgeColor: color });
  };

  // 現在の面の画像URLを取得
  const getCurrentImageUrl = () => {
    switch (activeTab) {
      case 'front':
        return book.textureUrl;
      case 'spine':
        return book.spineTextureUrl;
      case 'back':
        return book.backCoverTextureUrl;
      case 'topBottom':
        return book.topBottomTextureUrl;
      default:
        return null;
    }
  };

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
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">本の画像・色を設定</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>
          
          {/* タブナビゲーション */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('front')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'front' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              表紙
            </button>
            <button
              onClick={() => setActiveTab('spine')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'spine' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              背表紙
            </button>
            <button
              onClick={() => setActiveTab('back')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'back' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              裏表紙
            </button>
            <button
              onClick={() => setActiveTab('topBottom')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'topBottom' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              天地
            </button>
            <button
              onClick={() => setActiveTab('edge')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'edge' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              小口
            </button>
          </div>
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

          {activeTab === 'edge' ? (
            // 小口の色設定
            <div>
              <h3 className="font-semibold text-sm mb-4">小口の色を選択</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={edgeColor}
                  onChange={(e) => handleEdgeColorChange(e.target.value)}
                  className="w-20 h-10 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">現在の色: {edgeColor}</span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">推奨色:</p>
                <div className="flex space-x-2 mt-2">
                  {['#F5DEB3', '#FFF8DC', '#FAEBD7', '#FFE4C4', '#F5F5DC'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleEdgeColorChange(color)}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      aria-label={`色を${color}に設定`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : !isEditing ? (
            <div>
              <ImageUpload
                bookId={book.id}
                face={activeTab as 'front' | 'spine' | 'back' | 'topBottom'}
                onUploadComplete={handleUploadComplete}
              />

              {getCurrentImageUrl() && (
                <div className="mt-4">
                  <h3 className="font-semibold text-sm mb-2">
                    現在の{activeTab === 'front' ? '表紙' : 
                            activeTab === 'spine' ? '背表紙' : 
                            activeTab === 'back' ? '裏表紙' : '天地'}画像
                  </h3>
                  <img
                    src={getCurrentImageUrl()!}
                    alt={`現在の${activeTab}画像`}
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
                aspectRatio={getAspectRatio()}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
