import React, { useState } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, Share2, Download, RotateCcw } from 'lucide-react';

interface ImageViewerScreenProps {
  imageUrl: string;
  onBack: () => void;
}

export const ImageViewerScreen: React.FC<ImageViewerScreenProps> = ({ imageUrl, onBack }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleDoubleTap = () => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Floating Widget Image',
          text: 'Check out this avatar from Floating Widget App!',
          url: imageUrl,
        });
      } catch {
        showToast('Shared link copied!');
      }
    } else {
      showToast('Image link copied to clipboard!');
    }
  };

  const handleSave = () => {
    showToast('Saved image to phone Gallery!');
  };

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between overflow-hidden text-white select-none">
      {/* Top Bar */}
      <div className="z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold tracking-wider text-slate-300">FULLSCREEN IMAGE</span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-slate-200"
            title="Share Image"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-slate-200"
            title="Save Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Zoomable Image Canvas */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={imageUrl}
          alt="Fullscreen View"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="max-w-full max-h-[80%] object-contain pointer-events-none rounded-2xl shadow-2xl"
        />
      </div>

      {/* Bottom Floating Zoom Controls */}
      <div className="z-20 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-xs px-6">
        <span className="text-slate-400 font-mono">Zoom: {(zoom * 100).toFixed(0)}%</span>

        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            className="p-1.5 text-slate-300 hover:text-white active:scale-90"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-1.5 text-slate-300 hover:text-white active:scale-90"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
            className="p-1.5 text-slate-300 hover:text-white active:scale-90"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Overlay */}
      {toastMessage && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 bg-purple-600 text-white text-xs font-medium px-4 py-2 rounded-full shadow-2xl border border-purple-400/50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
