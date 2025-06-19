import { useState } from 'react';
import type { FC } from 'react';
import { ImageOff } from 'lucide-react';

interface TextureItemProps {
  label: string;
  textureUrl: string | null;
  onClick: (url: string) => void;
}

export const TextureItem: FC<TextureItemProps> = ({ label, textureUrl, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (textureUrl && !imageError) {
      onClick(textureUrl);
    }
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
      <div 
        className={`
          relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden
          ${textureUrl && !imageError ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}
          transition-all duration-200
        `}
        onClick={handleClick}
      >
        {textureUrl && !imageError ? (
          <img
            src={textureUrl}
            alt={`${label}のテクスチャ`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ImageOff size={48} />
            <span className="mt-2 text-sm">
              {imageError ? '読み込みエラー' : '未設定'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};