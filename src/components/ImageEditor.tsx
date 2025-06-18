import { useState, useRef, useEffect, useCallback } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // 本の表紙の縦横比（高さ/幅）
}

export function ImageEditor({ imageUrl, onSave, onCancel, aspectRatio = 1.5 }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // キャンバスのサイズ
  const canvasWidth = 400;
  const canvasHeight = canvasWidth * aspectRatio;

  // 画像を描画
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 画像のアスペクト比を維持しながらスケーリング
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
      // 画像が横長
      drawHeight = canvasHeight * scale;
      drawWidth = drawHeight * imgAspect;
    } else {
      // 画像が縦長
      drawWidth = canvasWidth * scale;
      drawHeight = drawWidth / imgAspect;
    }

    // 中央に配置
    const x = (canvasWidth - drawWidth) / 2 + offsetX;
    const y = (canvasHeight - drawHeight) / 2 + offsetY;

    // フィルターを適用
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    // 画像を描画
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }, [scale, offsetX, offsetY, brightness, contrast, canvasWidth, canvasHeight]);

  // 画像を読み込んでキャンバスに描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageRef.current = img;
      drawImage();
    };

    img.src = imageUrl;
  }, [imageUrl, drawImage]);

  // 画像のパラメータが変更されたら再描画
  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // マウスイベントハンドラー
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offsetX,
      y: e.clientY - offsetY
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 保存処理
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // キャンバスの内容をDataURLとして取得
    const editedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(editedImageUrl);
  };

  // リセット処理
  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setBrightness(100);
    setContrast(100);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">画像を編集</h3>
      
      <div className="mb-4 border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="cursor-move w-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            拡大/縮小: {scale.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            明るさ: {brightness}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            コントラスト: {contrast}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          リセット
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          キャンセル
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        ※ ドラッグで画像を移動、スライダーで調整できます
      </p>
    </div>
  );
}