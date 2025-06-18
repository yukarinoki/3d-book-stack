import type { Book } from '@/types';

interface BookDetailProps {
  book: Book | null;
  onClose: () => void;
}

export const BookDetail = ({ book, onClose }: BookDetailProps) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-gray-600 font-medium">著者:</span>
            <span className="ml-2">{book.author}</span>
          </div>
          
          <div>
            <span className="text-gray-600 font-medium">タイプ:</span>
            <span className="ml-2">
              {book.bookType === 'paperback' && 'ペーパーバック'}
              {book.bookType === 'hardcover' && 'ハードカバー'}
              {book.bookType === 'softcover' && 'ソフトカバー'}
              {book.bookType === 'manga' && '漫画'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600 font-medium">サイズ:</span>
            <span className="ml-2">
              {book.dimensions.width} × {book.dimensions.height} × {book.dimensions.depth} mm
            </span>
          </div>
          
          {book.color && (
            <div>
              <span className="text-gray-600 font-medium">カラー:</span>
              <span 
                className="ml-2 inline-block w-6 h-6 rounded border border-gray-300 align-middle"
                style={{ backgroundColor: book.color }}
              />
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};