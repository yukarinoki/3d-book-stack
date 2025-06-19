import { useState } from 'react';
import type { Book } from '@/types';
import { formatDate, getReadingStatus } from './utils';

interface TableRowProps {
  book: Book;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onInlineEdit: (bookId: string, field: keyof Book, value: any) => void;
  onDelete: (bookId: string) => void;
}

export const TableRow = ({
  book,
  isSelected,
  onSelect,
  onEdit,
  onInlineEdit,
  onDelete
}: TableRowProps) => {
  const [editingField, setEditingField] = useState<keyof Book | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEdit = (field: keyof Book, value: any) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (editingField) {
      onInlineEdit(book.id, editingField, editValue);
      cancelEdit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const readingStatus = getReadingStatus(book);
  const statusColors = {
    unread: 'bg-gray-100 text-gray-800',
    reading: 'bg-blue-100 text-blue-800',
    finished: 'bg-green-100 text-green-800'
  };

  const statusLabels = {
    unread: '未読',
    reading: '読書中',
    finished: '読了'
  };

  return (
    <tr className={`border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-gray-700' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-6 py-4">
        {editingField === 'title' ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border rounded"
            autoFocus
          />
        ) : (
          <div
            onDoubleClick={() => startEdit('title', book.title)}
            className="cursor-text dark:text-gray-200"
          >
            {book.title}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        {editingField === 'author' ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border rounded"
            autoFocus
          />
        ) : (
          <div
            onDoubleClick={() => startEdit('author', book.author)}
            className="cursor-text dark:text-gray-200"
          >
            {book.author}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {book.dimensions.width} × {book.dimensions.height} × {book.dimensions.depth} mm
      </td>
      <td className="px-6 py-4">
        {editingField === 'purchaseDate' ? (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 border rounded"
            autoFocus
          />
        ) : (
          <div
            onDoubleClick={() => startEdit('purchaseDate', book.purchaseDate)}
            className="cursor-text dark:text-gray-200"
          >
            {formatDate(book.purchaseDate)}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        {editingField === 'finishDate' ? (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 border rounded"
            min={book.purchaseDate || undefined}
            autoFocus
          />
        ) : (
          <div
            onDoubleClick={() => startEdit('finishDate', book.finishDate)}
            className="cursor-text dark:text-gray-200"
          >
            {formatDate(book.finishDate)}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[readingStatus]}`}>
          {statusLabels[readingStatus]}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 mr-3"
        >
          編集
        </button>
        <button
          onClick={() => {
            if (confirm('この本を削除しますか？')) {
              onDelete(book.id);
            }
          }}
          className="text-red-600 hover:text-red-800"
        >
          削除
        </button>
      </td>
    </tr>
  );
};