import type { Book, ViewMode, TimelinePeriod } from '@/types';

export interface PositionedBook extends Book {
  position: [number, number, number];
  rotation: [number, number, number];
  groupLabel?: string;
}

export const positionBooksForMode = (
  books: Book[],
  mode: ViewMode,
  timelinePeriod?: TimelinePeriod
): PositionedBook[] => {
  switch (mode) {
    case 'stack':
      return positionBooksInStack(books);
    case 'shelf':
      return positionBooksOnShelf(books);
    case 'grid':
      return positionBooksInGrid(books);
    case 'timeline':
      return positionBooksByTimeline(books, timelinePeriod || 'week');
    default:
      return positionBooksInStack(books);
  }
};

// 既存のスタックモード（水平積み重ね）
const positionBooksInStack = (books: Book[]): PositionedBook[] => {
  let currentHeight = 0;
  const stackSpacing = 0.05; // 50mmの間隔

  return books.map((book) => {
    const bookHeight = book.dimensions.depth / 1000;
    const yPosition = currentHeight + bookHeight / 2;
    currentHeight += bookHeight + stackSpacing;

    // 水平方向のランダム性を追加
    const randomOffsetRange = 0.05;
    const randomX = (Math.random() - 0.5) * randomOffsetRange;
    const randomZ = (Math.random() - 0.5) * randomOffsetRange;

    return {
      ...book,
      position: [randomX, yPosition, randomZ] as [number, number, number],
      rotation: [-Math.PI / 2, 0, 0] as [number, number, number], // 表紙が上向き
    };
  });
};

// 表紙並べモード（表紙が正面を向く）
const positionBooksInGrid = (books: Book[]): PositionedBook[] => {
  const booksPerRow = Math.ceil(Math.sqrt(books.length));
  const spacing = 0.3; // 30cmの間隔
  
  return books.map((book, index) => {
    const row = Math.floor(index / booksPerRow);
    const col = index % booksPerRow;
    
    // グリッド中央寄せのためのオフセット
    const totalWidth = (booksPerRow - 1) * spacing;
    const startX = -totalWidth / 2;
    const totalHeight = Math.ceil(books.length / booksPerRow - 1) * spacing;
    const startZ = -totalHeight / 2;
    
    const x = startX + col * spacing;
    const z = startZ + row * spacing;
    const y = 0; // 床レベル
    
    return {
      ...book,
      position: [x, y, z] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number], // 表紙が正面を向く（直立）
    };
  });
};

// 背表紙並べモード（本棚風）
const positionBooksOnShelf = (books: Book[]): PositionedBook[] => {
  // 本棚では depth（厚さ）が横幅になる
  const totalWidth = books.reduce((sum, book) => sum + book.dimensions.depth / 1000, 0);
  const startX = -totalWidth / 2;
  let currentX = startX;
  
  return books.map((book) => {
    // 本棚では本のdepth（厚さ）が横幅になる
    const bookThickness = book.dimensions.depth / 1000;
    const x = currentX + bookThickness / 2;
    currentX += bookThickness; // 完全に密着
    
    return {
      ...book,
      position: [x, 0, 0] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number], // 背表紙が正面を向く
    };
  });
};

// 時系列山積みモード
export const positionBooksByTimeline = (
  books: Book[],
  period: TimelinePeriod = 'week'
): PositionedBook[] => {
  // 日付を取得する関数
  const getDate = (book: Book): Date | null => {
    const dateStr = book.finishDate || book.purchaseDate;
    return dateStr ? new Date(dateStr) : null;
  };

  // 期間のキーを生成する関数
  const getPeriodKey = (date: Date): string => {
    switch (period) {
      case 'week':
        // 週の始まりを月曜日として計算
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        return weekStart.toISOString().slice(0, 10); // YYYY-MM-DD形式
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'year':
        return String(date.getFullYear());
    }
  };

  // ラベルを生成する関数
  const getGroupLabel = (periodKey: string): string => {
    switch (period) {
      case 'week':
        const weekDate = new Date(periodKey);
        const month = weekDate.getMonth() + 1;
        const weekOfMonth = Math.ceil(weekDate.getDate() / 7);
        return `${weekDate.getFullYear()}年${month}月 第${weekOfMonth}週`;
      case 'month':
        const [year, monthStr] = periodKey.split('-');
        return `${year}年${parseInt(monthStr)}月`;
      case 'year':
        return `${periodKey}年`;
    }
  };

  // 本を期間ごとにグループ化
  const bookGroups = new Map<string, Book[]>();
  const noDates: Book[] = [];

  books.forEach(book => {
    const date = getDate(book);
    if (date) {
      const key = getPeriodKey(date);
      if (!bookGroups.has(key)) {
        bookGroups.set(key, []);
      }
      bookGroups.get(key)!.push(book);
    } else {
      noDates.push(book);
    }
  });

  // グループを時系列順にソート
  const sortedGroups = Array.from(bookGroups.entries()).sort(([a], [b]) => a.localeCompare(b));

  // 日付のない本を最後に追加
  if (noDates.length > 0) {
    sortedGroups.push(['no-date', noDates]);
  }

  // 本を配置
  const positionedBooks: PositionedBook[] = [];
  const stackSpacing = 0.4; // スタック間の間隔
  let currentX = -(sortedGroups.length - 1) * stackSpacing / 2;

  sortedGroups.forEach(([periodKey, groupBooks]) => {
    let currentHeight = 0;
    const bookSpacing = 0.05; // 本同士の間隔

    groupBooks.forEach((book) => {
      const bookHeight = book.dimensions.depth / 1000;
      const yPosition = currentHeight + bookHeight / 2;
      currentHeight += bookHeight + bookSpacing;

      const label = periodKey === 'no-date' ? '日付なし' : getGroupLabel(periodKey);

      positionedBooks.push({
        ...book,
        position: [currentX, yPosition, 0] as [number, number, number],
        rotation: [-Math.PI / 2, 0, 0] as [number, number, number], // 表紙が上向き
        groupLabel: label,
      });
    });

    currentX += stackSpacing;
  });

  return positionedBooks;
};