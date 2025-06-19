import { useEffect } from 'react';
import { useBookStore } from '@/stores';

export const useKeyboardControls = () => {
  const { 
    selectedBookIds, 
    books,
    updateBook, 
    physicsEnabled, 
    setPhysicsEnabled 
  } = useBookStore();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // 物理演算が有効な場合、移動キーは無効
      if (physicsEnabled && ['w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
        return;
      }

      // Space キーで物理演算をトグル
      if (event.key === ' ') {
        event.preventDefault();
        setPhysicsEnabled(!physicsEnabled);
        return;
      }

      // 選択された本がない場合は何もしない
      if (selectedBookIds.length === 0) {
        return;
      }

      const moveAmount = 0.1; // 10cm移動

      selectedBookIds.forEach(bookId => {
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        const currentPosition = book.position || [0, 0, 0];
        let newPosition: [number, number, number] = [...currentPosition];

        switch (event.key.toLowerCase()) {
          case 'w': // 前方（Z軸マイナス方向）
            newPosition[2] -= moveAmount;
            break;
          case 's': // 後方（Z軸プラス方向）
            newPosition[2] += moveAmount;
            break;
          case 'a': // 左（X軸マイナス方向）
            newPosition[0] -= moveAmount;
            break;
          case 'd': // 右（X軸プラス方向）
            newPosition[0] += moveAmount;
            break;
          default:
            return;
        }

        updateBook(bookId, { position: newPosition });
      });
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedBookIds, books, updateBook, physicsEnabled, setPhysicsEnabled]);
};