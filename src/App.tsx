import { useEffect } from 'react';
import { Leva, useControls } from 'leva';
import { Layout, Scene3D, Book3D, Floor } from '@/components';
import { useBookStore } from '@/stores';
import './App.css';

export default function App() {
  const { 
    books, 
    physicsEnabled, 
    setPhysicsEnabled, 
    initializeBooks 
  } = useBookStore();
  
  useControls({
    enablePhysics: { 
      label: '物理演算を有効にする', 
      value: physicsEnabled,
      onChange: setPhysicsEnabled
    }
  });

  // 初回マウント時に本を初期化
  useEffect(() => {
    if (books.length === 0) {
      initializeBooks();
    }
  }, [books.length, initializeBooks]);

  return (
    <>
      <Leva collapsed />
      <Layout>
        <div className="h-screen p-4">
          <Scene3D physicsEnabled={physicsEnabled}>
            <Floor />
            {books.map((book) => (
              <Book3D
                key={book.id}
                book={book}
                physicsEnabled={physicsEnabled}
              />
            ))}
          </Scene3D>
        </div>
      </Layout>
    </>
  );
}
