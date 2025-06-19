import { useState, useEffect } from 'react';
import type { Book } from '@/types';
import { validateBook } from './utils';

interface EditModalProps {
  book: Book | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: (book: Partial<Book>) => void;
}

export const EditModal = ({
  book,
  isCreating,
  onClose,
  onSave
}: EditModalProps) => {
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    dimensions: { width: 0, height: 0, depth: 0 },
    bookType: 'paperback',
    purchaseDate: null,
    finishDate: null,
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (book) {
      setFormData(book);
    } else if (isCreating) {
      setFormData({
        title: '',
        author: '',
        dimensions: { width: 148, height: 210, depth: 15 }, // A5デフォルト
        bookType: 'paperback',
        purchaseDate: null,
        finishDate: null,
      });
    }
  }, [book, isCreating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateBook(formData as Book);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(formData);
  };

  const handleDimensionChange = (field: keyof Book['dimensions'], value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [field]: numValue
      }
    }));
  };

  // body scroll lock
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold dark:text-white">
            {isCreating ? '新規本追加' : '本の編集'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <ul className="list-disc list-inside text-red-600 dark:text-red-400">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form id="edit-book-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                著者 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.author || ''}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">サイズ (mm)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">幅</label>
                  <input
                    type="number"
                    value={formData.dimensions?.width || 0}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                    min={1}
                    max={9999}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">高さ</label>
                  <input
                    type="number"
                    value={formData.dimensions?.height || 0}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                    min={1}
                    max={9999}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">厚さ</label>
                  <input
                    type="number"
                    value={formData.dimensions?.depth || 0}
                    onChange={(e) => handleDimensionChange('depth', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                    min={1}
                    max={9999}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">製本タイプ</label>
              <select
                value={formData.bookType || 'paperback'}
                onChange={(e) => setFormData({ ...formData, bookType: e.target.value as Book['bookType'] })}
                className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="paperback">ペーパーバック</option>
                <option value="hardcover">ハードカバー</option>
                <option value="softcover">ソフトカバー</option>
                <option value="manga">漫画</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">購入日</label>
                <input
                  type="date"
                  value={formData.purchaseDate || ''}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value || null })}
                  className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">終読日</label>
                <input
                  type="date"
                  value={formData.finishDate || ''}
                  onChange={(e) => setFormData({ ...formData, finishDate: e.target.value || null })}
                  className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={formData.purchaseDate || undefined}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            キャンセル
          </button>
          <button
            type="submit"
            form="edit-book-form"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};