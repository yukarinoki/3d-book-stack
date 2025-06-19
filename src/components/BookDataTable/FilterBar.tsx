interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: {
    purchaseDateFrom?: string;
    purchaseDateTo?: string;
    finishDateFrom?: string;
    finishDateTo?: string;
  };
  onDateFilterChange: (filter: any) => void;
  statusFilter: 'all' | 'unread' | 'reading' | 'finished';
  onStatusFilterChange: (status: 'all' | 'unread' | 'reading' | 'finished') => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  itemsPerPage,
  onItemsPerPageChange
}: FilterBarProps) => {
  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="タイトルまたは著者で検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">すべて</option>
          <option value="unread">未読</option>
          <option value="reading">読書中</option>
          <option value="finished">読了</option>
        </select>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10件</option>
          <option value={25}>25件</option>
          <option value={50}>50件</option>
          <option value={100}>100件</option>
        </select>
      </div>

      {/* 日付フィルター */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">購入日:</label>
          <input
            type="date"
            value={dateFilter.purchaseDateFrom || ''}
            onChange={(e) => onDateFilterChange({ ...dateFilter, purchaseDateFrom: e.target.value })}
            className="px-3 py-1 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
          />
          <span className="text-gray-500 dark:text-gray-400">〜</span>
          <input
            type="date"
            value={dateFilter.purchaseDateTo || ''}
            onChange={(e) => onDateFilterChange({ ...dateFilter, purchaseDateTo: e.target.value })}
            className="px-3 py-1 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">終読日:</label>
          <input
            type="date"
            value={dateFilter.finishDateFrom || ''}
            onChange={(e) => onDateFilterChange({ ...dateFilter, finishDateFrom: e.target.value })}
            className="px-3 py-1 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
          />
          <span className="text-gray-500 dark:text-gray-400">〜</span>
          <input
            type="date"
            value={dateFilter.finishDateTo || ''}
            onChange={(e) => onDateFilterChange({ ...dateFilter, finishDateTo: e.target.value })}
            className="px-3 py-1 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded"
          />
        </div>
        <button
          onClick={() => onDateFilterChange({})}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          クリア
        </button>
      </div>
    </div>
  );
};