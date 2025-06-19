import { useState, useRef, useCallback } from 'react';
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
  const imageRef = useRef<HTMLImageElement>(null);

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

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve(croppedImageUrl);
      }, 'image/jpeg');
    });
  }, [completedCrop]);

  const handleApplyCrop = async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
      onClose();
    }
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
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Upload"
                onLoad={onImageLoad}
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4">
          <button
            onClick={onClose}
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
