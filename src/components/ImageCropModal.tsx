import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
}

export function ImageCropModal({
  imageUrl,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [rotatedImageUrl, setRotatedImageUrl] = useState<string>(imageUrl);
  const imageRef = useRef<HTMLImageElement>(null);

  // imageUrlが変更されたらrotatedImageUrlも更新
  useEffect(() => {
    setRotatedImageUrl(imageUrl);
    setRotation(0);
  }, [imageUrl]);

  // Enterキーでトリミングを適用
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen) {
        e.preventDefault();
        handleApplyCrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, completedCrop]); // eslint-disable-line react-hooks/exhaustive-deps

  // Canvas上で画像を回転させる関数
  const rotateImage = useCallback((sourceImage: HTMLImageElement, angle: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      // 90度または270度回転の場合は幅と高さを入れ替える
      if (angle === 90 || angle === 270) {
        canvas.width = sourceImage.naturalHeight;
        canvas.height = sourceImage.naturalWidth;
      } else {
        canvas.width = sourceImage.naturalWidth;
        canvas.height = sourceImage.naturalHeight;
      }

      // キャンバスの中心で回転
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      
      // 画像を描画
      ctx.drawImage(
        sourceImage,
        -sourceImage.naturalWidth / 2,
        -sourceImage.naturalHeight / 2,
        sourceImage.naturalWidth,
        sourceImage.naturalHeight
      );
      
      ctx.restore();
      
      // DataURLとして出力
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    });
  }, [imageUrl]);

  // 回転ボタンのハンドラー
  const handleRotate = async () => {
    const nextRotation = ((rotation + 90) % 360) as 0 | 90 | 180 | 270;
    setRotation(nextRotation);
    
    // 元の画像を読み込んで回転
    const img = new Image();
    img.onload = async () => {
      const rotatedUrl = await rotateImage(img, nextRotation);
      setRotatedImageUrl(rotatedUrl);
    };
    img.src = imageUrl;
  };

  const onImageLoad = useCallback(() => {
    const defaultCrop: Crop = {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    };

    if (aspectRatio) {
      const cropWidth = 90;
      const cropHeight = cropWidth / aspectRatio;
      defaultCrop.height = cropHeight;
      defaultCrop.y = (100 - cropHeight) / 2;
    }

    setCrop(defaultCrop);
  }, [aspectRatio]);

  const getCroppedImg = useCallback(async (): Promise<string> => {
    if (!completedCrop || !imageRef.current) {
      return '';
    }

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // シンプルにトリミング（既に回転された画像から切り取るだけ）
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [completedCrop]);

  const handleApplyCrop = async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
      setRotation(0); // 回転をリセット
      setRotatedImageUrl(imageUrl); // 画像URLもリセット
      onClose();
    }
  };

  const handleClose = () => {
    setRotation(0); // 回転をリセット
    setRotatedImageUrl(imageUrl); // 画像URLもリセット
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden relative">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">画像をトリミング</h2>
        </div>

        <div className="p-8 bg-gray-100 overflow-auto max-h-[70vh] flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {/* 回転ボタン */}
            <div className="mb-4 flex justify-center">
              <button
                onClick={handleRotate}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
                title="90度回転"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                回転 ({rotation}°)
              </button>
            </div>
            
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
            >
              <img
                ref={imageRef}
                src={rotatedImageUrl}
                alt="Upload"
                onLoad={onImageLoad}
                className="max-w-full h-auto"
                style={{
                  // 背表紙と天地の場合は適切なサイズ制限を適用
                  maxHeight: aspectRatio && aspectRatio < 1 ? '60vh' : undefined,
                  maxWidth: aspectRatio && aspectRatio > 1 ? '80vw' : undefined
                }}
              />
            </ReactCrop>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleApplyCrop}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            適用
          </button>
        </div>
      </div>
    </div>
  );
}
