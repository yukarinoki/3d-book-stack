import type { Book } from '@/types';

interface TableHeaderProps {
  onSort: (column: keyof Book) => void;
  sortColumn: keyof Book | null;
  sortOrder: 'asc' | 'desc';
  allSelected: boolean;
  onSelectAll: () => void;
}

export const TableHeader = ({
  onSort,
  sortColumn,
  sortOrder,
  allSelected,
  onSelectAll
}: TableHeaderProps) => {
  const getSortIcon = (column: keyof Book) => {
    if (sortColumn !== column) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="rounded border-gray-300"
          />
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={() => onSort('title')}
        >
          <div className="flex items-center gap-1">
            タイトル
            {getSortIcon('title')}
          </div>
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={() => onSort('author')}
        >
          <div className="flex items-center gap-1">
            著者
            {getSortIcon('author')}
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          サイズ
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={() => onSort('purchaseDate')}
        >
          <div className="flex items-center gap-1">
            購入日
            {getSortIcon('purchaseDate')}
          </div>
        </th>
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          onClick={() => onSort('finishDate')}
        >
          <div className="flex items-center gap-1">
            終読日
            {getSortIcon('finishDate')}
          </div>
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          読了状態
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          アクション
        </th>
      </tr>
    </thead>
  );
};