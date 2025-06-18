import { useEffect, useMemo, useState } from 'react';
import { Leva, useControls, button } from 'leva';
import { Layout, Scene3D, Book3D, Floor, BookTextureUpload, BookDetail, SelectionControls } from '@/components';
import { useBookStore } from '@/stores';
import { positionBooksForMode } from '@/utils';
import './App.css';

export default function App() {
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
  const [detailBook, setDetailBook] = useState<string | null>(null);
  
  useControls({
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
      label: '物理演算を有効にする', 
      value: physicsEnabled,
      onChange: setPhysicsEnabled
    },
    '画像機能': button(() => {}),
    uploadTexture: button(() => {
      if (selectedBookIds.length === 1) {
        setShowTextureUpload(true);
      } else if (selectedBookIds.length === 0) {
        alert('本を選択してください');
      } else {
        alert('1冊のみ選択してください');
      }
    })
  });

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
  const selectedBookForTexture = selectedBookIds.length === 1 
    ? books.find(book => book.id === selectedBookIds[0])
    : null;
  
  // 詳細表示用の本を取得
  const selectedBookForDetail = detailBook ? books.find(b => b.id === detailBook) : null;

  return (
    <>
      <Leva collapsed />
      <Layout>
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
      </Layout>
      
      {showTextureUpload && selectedBookForTexture && (
        <BookTextureUpload
          book={selectedBookForTexture}
          onClose={() => {
            setShowTextureUpload(false);
            clearSelection();
          }}
        />
      )}
      
      <SelectionControls />
      <BookDetail 
        book={selectedBookForDetail || null} 
        onClose={() => setDetailBook(null)} 
      />
    </>
  );
}
