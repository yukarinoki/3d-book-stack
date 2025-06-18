import { useBookStore } from '@/stores';

export const SelectionControls = () => {
  const { selectedBookIds, deleteBooks, clearSelection, updateBook } = useBookStore();
  
  if (selectedBookIds.length === 0) return null;
  
  const handleBatchColorChange = (color: string) => {
    selectedBookIds.forEach(id => {
      updateBook(id, { color });
    });
  };
  
  const handleDeleteSelected = () => {
    if (window.confirm(`選択した${selectedBookIds.length}冊の本を削除しますか？`)) {
      deleteBooks(selectedBookIds);
    }
  };
  
  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-40">
      <div className="mb-3">
        <span className="font-bold">{selectedBookIds.length}冊選択中</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm">カラー変更:</span>
          <div className="flex space-x-1">
            {['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'].map(color => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => handleBatchColorChange(color)}
                aria-label={`カラーを${color}に変更`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={clearSelection}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1 px-3 rounded"
          >
            選択解除
          </button>
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-1 px-3 rounded"
          >
            削除
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p>Ctrl/Cmd + クリックで複数選択</p>
      </div>
    </div>
  );
};