import { useEffect, useMemo, useState } from 'react';
import { Leva, useControls, button } from 'leva';
import { Scene3D, Book3D, Floor, BookTextureUpload, BookDetail, SelectionControls, TextureViewModal } from '@/components';
import { useBookStore } from '@/stores';
import { positionBooksForMode } from '@/utils';

export const Book3DView = () => {
  const {
    books,
    viewMode,
    physicsEnabled,
    setPhysicsEnabled,
    setViewMode,
    initializeBooks,
    selectedBookIds,
    clearSelection
  } = useBookStore();

  const [showTextureUpload, setShowTextureUpload] = useState(false);
  const [showTextureView, setShowTextureView] = useState(false);
  const [detailBook, setDetailBook] = useState<string | null>(null);

  // デバッグ: 状態の変化を監視
  useEffect(() => {
    console.log('=== State Change Debug ===');
    console.log('showTextureUpload state changed to:', showTextureUpload);
    console.log('selectedBookIds:', selectedBookIds);
    console.log('books length:', books.length);
  }, [showTextureUpload, selectedBookIds, books.length]);

  useControls('設定', {
    viewMode: {
      label: '表示モード',
      value: viewMode,
      options: {
        'スタック': 'stack',
        '表紙並べ': 'grid',
        '本棚': 'shelf'
      },
      onChange: setViewMode
    },
    enablePhysics: {
      label: '物理演算',
      value: physicsEnabled,
      onChange: setPhysicsEnabled
    },
    'テクスチャ確認': button(() => {
      console.log('=== テクスチャ確認 button clicked ===');
      
      const currentState = useBookStore.getState();
      const currentSelectedIds = currentState.selectedBookIds;
      
      console.log('Current selectedBookIds:', currentSelectedIds);
      console.log('Number of selected books:', currentSelectedIds.length);
      
      if (currentSelectedIds.length === 1) {
        console.log('Condition: 1 book selected - opening texture view modal');
        setShowTextureView(true);
      } else if (currentSelectedIds.length === 0) {
        console.log('Condition: No books selected - showing alert');
        alert('本を選択してください');
      } else {
        console.log('Condition: Multiple books selected - showing alert');
        alert('1冊のみ選択してください');
      }
    }),
    uploadTexture: button(() => {
      console.log('=== uploadTexture button clicked ===');

      // useBookStore.getState()で最新の状態を直接取得
      const currentState = useBookStore.getState();
      const currentSelectedIds = currentState.selectedBookIds;
      const currentBooks = currentState.books;

      console.log('Current selectedBookIds:', currentSelectedIds);
      console.log('Number of selected books:', currentSelectedIds.length);
      console.log('Total books in store:', currentBooks.length);

      const currentSelectedBook = currentSelectedIds.length === 1
        ? currentBooks.find(b => b.id === currentSelectedIds[0])
        : null;

      console.log('Current selected book:', currentSelectedBook);

      if (currentSelectedIds.length === 1) {
        console.log('Condition: 1 book selected - opening modal');
        console.log('Setting showTextureUpload to true');
        setShowTextureUpload(true);
        console.log('showTextureUpload should now be true');
      } else if (currentSelectedIds.length === 0) {
        console.log('Condition: No books selected - showing alert');
        alert('本を選択してください');
      } else {
        console.log('Condition: Multiple books selected - showing alert');
        alert('1冊のみ選択してください');
      }

      console.log('=== uploadTexture button handler finished ===');
    })
  }, { collapsed: false });

  // 選択された本の情報をLevaに表示
  useControls('選択中の本', () => {
    const selectedBook = selectedBookIds.length > 0
      ? books.find(book => book.id === selectedBookIds[0])
      : null;

    return {
      title: {
        label: 'タイトル',
        value: selectedBook?.title || '未選択',
        editable: false,
      },
      author: {
        label: '著者',
        value: selectedBook?.author || '未選択',
        editable: false,
      },
      dimensions: {
        label: 'サイズ (mm)',
        value: selectedBook
          ? `${selectedBook.dimensions.width} × ${selectedBook.dimensions.height} × ${selectedBook.dimensions.depth}`
          : '未選択',
        editable: false,
      },
      bookType: {
        label: '製本タイプ',
        value: selectedBook?.bookType || '未選択',
        editable: false,
      },
      selectedCount: {
        label: '選択数',
        value: selectedBookIds.length,
        editable: false,
      },
    };
  }, { collapsed: selectedBookIds.length === 0 }, [selectedBookIds, books]);

  // 表示モードに応じて本の位置を計算
  const positionedBooks = useMemo(() => {
    return positionBooksForMode(books, viewMode);
  }, [books, viewMode]);

  // 初回マウント時に本を初期化
  useEffect(() => {
    if (books.length === 0) {
      initializeBooks();
    }
  }, [books.length, initializeBooks]);

  // 選択された本を取得（テクスチャアップロード用）
  const selectedBookForTexture = useMemo(() => {
    console.log('=== Computing selectedBookForTexture ===');
    console.log('selectedBookIds:', selectedBookIds);
    console.log('selectedBookIds.length:', selectedBookIds.length);
    console.log('books.length:', books.length);

    if (selectedBookIds.length === 1) {
      const targetId = selectedBookIds[0];
      console.log('Looking for book with ID:', targetId);
      const foundBook = books.find(book => book.id === targetId);
      console.log('Found book:', foundBook);
      return foundBook || null;
    }

    console.log('Returning null (not exactly 1 book selected)');
    return null;
  }, [selectedBookIds, books]);

  // デバッグ: モーダル表示条件の確認
  useEffect(() => {
    console.log('=== Modal display conditions ===');
    console.log('showTextureUpload:', showTextureUpload);
    console.log('selectedBookForTexture:', selectedBookForTexture);
    console.log('Modal should display:', showTextureUpload && selectedBookForTexture);
    console.log('================================');
  }, [showTextureUpload, selectedBookForTexture]);

  // 詳細表示用の本を取得
  const selectedBookForDetail = detailBook ? books.find(b => b.id === detailBook) : null;

  return (
    <>
      <Leva collapsed />
      <div className="h-screen p-4">
        <Scene3D physicsEnabled={physicsEnabled}>
          <Floor />
          {positionedBooks.map((book) => (
            <Book3D
              key={book.id}
              book={book}
              physicsEnabled={physicsEnabled}
              onDoubleClick={() => setDetailBook(book.id)}
            />
          ))}
        </Scene3D>
      </div>

      {(() => {
        console.log('=== Rendering modal check ===');
        console.log('showTextureUpload:', showTextureUpload);
        console.log('showTextureView:', showTextureView);
        console.log('selectedBookForTexture:', selectedBookForTexture);
        console.log('Should render upload modal:', showTextureUpload && selectedBookForTexture);
        console.log('Should render view modal:', showTextureView && selectedBookForTexture);

        if (showTextureUpload && selectedBookForTexture) {
          console.log('Rendering BookTextureUpload component');
          return (
            <BookTextureUpload
              book={selectedBookForTexture}
              onClose={() => {
                setShowTextureUpload(false);
                clearSelection();
              }}
            />
          );
        }
        
        if (showTextureView && selectedBookForTexture) {
          console.log('Rendering TextureViewModal component');
          console.log('Book data:', selectedBookForTexture);
          return (
            <TextureViewModal
              book={selectedBookForTexture}
              onClose={() => {
                console.log('TextureViewModal onClose called');
                setShowTextureView(false);
              }}
            />
          );
        }
        
        console.log('NOT rendering any modal component');
        return null;
      })()}

      <SelectionControls />
      <BookDetail
        book={selectedBookForDetail || null}
        onClose={() => setDetailBook(null)}
      />
    </>
  );
};