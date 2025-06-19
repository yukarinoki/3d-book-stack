import type { Book } from '@/types';

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

export const getReadingStatus = (book: Book): 'unread' | 'reading' | 'finished' => {
  if (book.finishDate) return 'finished';
  if (book.purchaseDate) return 'reading';
  return 'unread';
};

export const validateBook = (book: Partial<Book>): string[] => {
  const errors: string[] = [];

  // タイトルのバリデーション
  if (!book.title || book.title.trim() === '') {
    errors.push('タイトルは必須です');
  } else if (book.title.length > 200) {
    errors.push('タイトルは200文字以内で入力してください');
  }

  // 著者のバリデーション
  if (!book.author || book.author.trim() === '') {
    errors.push('著者は必須です');
  } else if (book.author.length > 100) {
    errors.push('著者は100文字以内で入力してください');
  }

  // 寸法のバリデーション
  if (book.dimensions) {
    const { width, height, depth } = book.dimensions;
    if (width <= 0 || width > 9999) {
      errors.push('幅は1〜9999mmの範囲で入力してください');
    }
    if (height <= 0 || height > 9999) {
      errors.push('高さは1〜9999mmの範囲で入力してください');
    }
    if (depth <= 0 || depth > 9999) {
      errors.push('厚さは1〜9999mmの範囲で入力してください');
    }
  }

  // 日付のバリデーション
  if (book.purchaseDate && book.finishDate) {
    const purchaseDate = new Date(book.purchaseDate);
    const finishDate = new Date(book.finishDate);
    
    if (finishDate < purchaseDate) {
      errors.push('終読日は購入日より後の日付を設定してください');
    }
  }

  if (book.purchaseDate) {
    const purchaseDate = new Date(book.purchaseDate);
    const minDate = new Date('1900-01-01');
    
    if (purchaseDate < minDate) {
      errors.push('購入日は1900年以降の日付を設定してください');
    }
  }

  if (book.finishDate) {
    const finishDate = new Date(book.finishDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (finishDate > today) {
      errors.push('終読日は未来の日付を設定できません');
    }
  }

  return errors;
};

export const exportToCSV = (books: Book[]): string => {
  const headers = ['タイトル', '著者', '幅(mm)', '高さ(mm)', '厚さ(mm)', '製本タイプ', '購入日', '終読日'];
  const rows = books.map(book => [
    book.title,
    book.author,
    book.dimensions.width,
    book.dimensions.height,
    book.dimensions.depth,
    book.bookType,
    book.purchaseDate || '',
    book.finishDate || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const exportToJSON = (books: Book[]): string => {
  return JSON.stringify(books, null, 2);
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};