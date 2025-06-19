import { useState } from 'react';
import type { FC } from 'react';
import type { Book } from '@/types';
import { TextureItem } from './TextureItem';
import { ImageViewer } from './ImageViewer';

interface TextureGridProps {
  book: Book;
}

interface TextureInfo {
  key: keyof NonNullable<Book['textures']>;
  label: string;
}

const textureInfos: TextureInfo[] = [
  { key: 'front', label: '表紙' },
  { key: 'back', label: '裏表紙' },
  { key: 'spine', label: '背表紙' },
  { key: 'top', label: '天' },
  { key: 'bottom', label: '地' },
  { key: 'foreEdge', label: '小口' },
];

export const TextureGrid: FC<TextureGridProps> = ({ book }) => {
  const [selectedTexture, setSelectedTexture] = useState<{
    url: string;
    label: string;
  } | null>(null);

  // 旧方式と新方式の両方に対応してテクスチャURLを取得
  const getTextureUrl = (key: keyof NonNullable<Book['textures']>): string | null => {
    // まず新方式（textures）をチェック
    if (book.textures?.[key]) {
      return book.textures[key];
    }
    
    // 旧方式のマッピング
    switch (key) {
      case 'front':
        return book.textureUrl || null;
      case 'back':
        return book.backCoverTextureUrl || null;
      case 'spine':
        return book.spineTextureUrl || null;
      case 'top':
      case 'bottom':
        return book.topBottomTextureUrl || null;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {textureInfos.map(({ key, label }) => (
          <TextureItem
            key={key}
            label={label}
            textureUrl={getTextureUrl(key)}
            onClick={(url) => setSelectedTexture({ url, label })}
          />
        ))}
      </div>

      {selectedTexture && (
        <ImageViewer
          imageUrl={selectedTexture.url}
          title={selectedTexture.label}
          onClose={() => setSelectedTexture(null)}
        />
      )}
    </>
  );
};