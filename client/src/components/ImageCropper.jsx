import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';

// Helper to create a cropped image blob from an image src and crop area
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
  });
}

export default function ImageCropper({ src, open, onCancel, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const containerRef = useRef();

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(src, croppedAreaPixels);
    onComplete(blob);
  }, [croppedAreaPixels, onComplete, src]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />

      <div ref={containerRef} className="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-4 p-4">
        <div className="h-80 relative bg-gray-100 rounded">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100 cursor-pointer">Cancel</button>
            <button onClick={handleDone} className="px-4 py-2 rounded bg-emerald-500 text-white cursor-pointer">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
