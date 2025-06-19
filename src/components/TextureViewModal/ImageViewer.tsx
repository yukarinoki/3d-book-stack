import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

export const ImageViewer: FC<ImageViewerProps> = ({ imageUrl, title, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 100001 }}>
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      
      {/* 画像ビューアー */}
      <div className="relative z-10 flex flex-col max-w-[90vw] max-h-[90vh]">
        {/* ツールバー */}
        <div className="bg-white rounded-t-lg px-4 py-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-800">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="縮小"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="拡大"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
            >
              リセット
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* 画像コンテナ */}
        <div 
          className="bg-white rounded-b-lg overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="relative overflow-hidden max-w-[80vw] max-h-[70vh]">
            <img
              src={imageUrl}
              alt={title}
              className="block"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};