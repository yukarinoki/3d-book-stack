import { useState } from 'react';
import { Leva, useControls } from 'leva';
import { Layout, Scene3D, Book3D, Floor } from '@/components';
import { createMockBooks } from '@/utils';
import './App.css';

export default function App() {
  const [books] = useState(() => createMockBooks());
  
  const { enablePhysics } = useControls({
    enablePhysics: { label: '物理演算を有効にする', value: true }
  });

  return (
    <>
      <Leva collapsed />
      <Layout>
        <div className="h-screen p-4">
          <Scene3D physicsEnabled={enablePhysics}>
            <Floor />
            {books.map((book) => (
              <Book3D
                key={book.id}
                book={book}
                physicsEnabled={enablePhysics}
              />
            ))}
          </Scene3D>
        </div>
      </Layout>
    </>
  );
}
