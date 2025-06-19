import { useState, useMemo } from 'react';
import { useBookStore } from '@/stores';
import type { Book } from '@/types';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { FilterBar } from './FilterBar';
import { BulkActions } from './BulkActions';
import { EditModal } from './EditModal';
import { validateBook } from './utils';

export const BookDataTable = () => {
  const { books, updateBook, deleteBooks } = useBookStore();
  
  // フィルター状態
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<{
    purchaseDateFrom?: string;
    purchaseDateTo?: string;
    finishDateFrom?: string;
    finishDateTo?: string;
  }>({});
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'reading' | 'finished'>('all');
  
  // ソート状態
  const [sortColumn, setSortColumn] = useState<keyof Book | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // 選択状態
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // 編集モーダル
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // フィルタリング
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // テキスト検索
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!book.title.toLowerCase().includes(query) && 
            !book.author.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // 日付フィルター
      if (dateFilter.purchaseDateFrom && book.purchaseDate) {
        if (book.purchaseDate < dateFilter.purchaseDateFrom) return false;
      }
      if (dateFilter.purchaseDateTo && book.purchaseDate) {
        if (book.purchaseDate > dateFilter.purchaseDateTo) return false;
      }
      if (dateFilter.finishDateFrom && book.finishDate) {
        if (book.finishDate < dateFilter.finishDateFrom) return false;
      }
      if (dateFilter.finishDateTo && book.finishDate) {
        if (book.finishDate > dateFilter.finishDateTo) return false;
      }
      
      // ステータスフィルター
      if (statusFilter !== 'all') {
        const hasFinishDate = !!book.finishDate;
        const hasPurchaseDate = !!book.purchaseDate;
        
        if (statusFilter === 'unread' && (hasFinishDate || !hasPurchaseDate)) return false;
        if (statusFilter === 'reading' && (!hasPurchaseDate || hasFinishDate)) return false;
        if (statusFilter === 'finished' && !hasFinishDate) return false;
      }
      
      return true;
    });
  }, [books, searchQuery, dateFilter, statusFilter]);

  // ソート
  const sortedBooks = useMemo(() => {
    if (!sortColumn) return filteredBooks;
    
    return [...filteredBooks].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredBooks, sortColumn, sortOrder]);

  // ページネーション
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBooks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedBooks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);

  // ハンドラー
  const handleSort = (column: keyof Book) => {
    if (sortColumn === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedBooks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBooks.map(book => book.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleInlineEdit = async (bookId: string, field: keyof Book, value: any) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const updatedBook = { ...book, [field]: value };
    const errors = validateBook(updatedBook);
    
    if (errors.length > 0) {
      alert(errors.join('\\n'));
      return;
    }

    await updateBook(bookId, { [field]: value });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`${selectedIds.size}冊の本を削除しますか？`)) {
      await deleteBooks(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleBulkEdit = async (updates: Partial<Book>) => {
    const promises = Array.from(selectedIds).map(id => updateBook(id, updates));
    await Promise.all(promises);
    setSelectedIds(new Set());
  };

  return (
    <div className="p-6 max-w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* ヘッダー */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold dark:text-white">本データ管理</h1>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              新規追加
            </button>
          </div>
          
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* バルクアクション */}
        {selectedIds.size > 0 && (
          <BulkActions
            selectedCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            onBulkEdit={handleBulkEdit}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        )}

        {/* テーブル */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <TableHeader
              onSort={handleSort}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              allSelected={selectedIds.size === paginatedBooks.length && paginatedBooks.length > 0}
              onSelectAll={handleSelectAll}
            />
            <tbody>
              {paginatedBooks.map((book) => (
                <TableRow
                  key={book.id}
                  book={book}
                  isSelected={selectedIds.has(book.id)}
                  onSelect={() => handleSelectOne(book.id)}
                  onEdit={() => setEditingBook(book)}
                  onInlineEdit={handleInlineEdit}
                  onDelete={async (id) => {
                    await deleteBooks([id]);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {sortedBooks.length}件中 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedBooks.length)}件を表示
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 dark:text-gray-300"
            >
              前へ
            </button>
            <span className="px-3 py-1 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border dark:border-gray-600 rounded disabled:opacity-50 dark:text-gray-300"
            >
              次へ
            </button>
          </div>
        </div>
      </div>

      {/* 編集モーダル */}
      {(editingBook || isCreating) && (
        <EditModal
          book={editingBook}
          isCreating={isCreating}
          onClose={() => {
            setEditingBook(null);
            setIsCreating(false);
          }}
          onSave={async (bookData) => {
            if (isCreating) {
              // 新規作成時は必須フィールドを確保
              if (bookData.title && bookData.author && bookData.dimensions && bookData.bookType) {
                await useBookStore.getState().addBook({
                  title: bookData.title,
                  author: bookData.author,
                  dimensions: bookData.dimensions,
                  bookType: bookData.bookType,
                  color: bookData.color,
                  purchaseDate: bookData.purchaseDate,
                  finishDate: bookData.finishDate,
                  position: bookData.position,
                  rotation: bookData.rotation,
                  textureUrl: bookData.textureUrl,
                  coverImageData: bookData.coverImageData,
                  spineTextureUrl: bookData.spineTextureUrl,
                  backCoverTextureUrl: bookData.backCoverTextureUrl,
                  topBottomTextureUrl: bookData.topBottomTextureUrl,
                  edgeColor: bookData.edgeColor,
                  textures: bookData.textures
                });
              }
            } else if (editingBook) {
              await updateBook(editingBook.id, bookData);
            }
            setEditingBook(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
};