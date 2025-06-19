import { useState, useEffect } from 'react';
import type { Book } from '@/types';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkEdit: (updates: Partial<Book>) => void;
  onClearSelection: () => void;
}

export const BulkActions = ({
  selectedCount,
  onBulkDelete,
  onBulkEdit,
  onClearSelection
}: BulkActionsProps) => {
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkPurchaseDate, setBulkPurchaseDate] = useState('');
  const [bulkFinishDate, setBulkFinishDate] = useState('');

  const handleBulkEdit = () => {
    const updates: Partial<Book> = {};
    if (bulkPurchaseDate) updates.purchaseDate = bulkPurchaseDate;
    if (bulkFinishDate) updates.finishDate = bulkFinishDate;
    
    if (Object.keys(updates).length > 0) {
      onBulkEdit(updates);
      setShowBulkEditModal(false);
      setBulkPurchaseDate('');
      setBulkFinishDate('');
    }
  };

  // body scroll lock for modal
  useEffect(() => {
    if (showBulkEditModal) {
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
    }
  }, [showBulkEditModal]);

  return (
    <>
      <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            {selectedCount}件選択中
          </span>
          <button
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            選択を解除
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkEditModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            一括編集
          </button>
          <button
            onClick={onBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            一括削除
          </button>
        </div>
      </div>

      {/* 一括編集モーダル */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 dark:text-white">一括編集</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">購入日</label>
                <input
                  type="date"
                  value={bulkPurchaseDate}
                  onChange={(e) => setBulkPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">終読日</label>
                <input
                  type="date"
                  value={bulkFinishDate}
                  onChange={(e) => setBulkFinishDate(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowBulkEditModal(false);
                  setBulkPurchaseDate('');
                  setBulkFinishDate('');
                }}
                className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};