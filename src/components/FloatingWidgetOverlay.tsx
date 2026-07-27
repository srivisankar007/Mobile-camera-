import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Image as ImageIcon, Settings, EyeOff, Power, Camera, Aperture, RefreshCw, Focus, Upload } from 'lucide-react';
import { WidgetSettings } from '../types/android';

interface FloatingWidgetOverlayProps {
  settings: WidgetSettings;
  onOpenImageViewer: () => void;
  onOpenSettings: () => void;
  onCloseWidget: () => void;
  onPositionChange: (x: number, y: number) => void;
  onToggleCameraMode?: (enabled: boolean) => void;
  onToggleViewportOverlay?: (enabled: boolean) => void;
  onUploadImage?: (newUrl: string) => void;
}

export const FloatingWidgetOverlay: React.FC<FloatingWidgetOverlayProps> = ({
  settings,
  onOpenImageViewer,
  onOpenSettings,
  onCloseWidget,
  onPositionChange,
  onToggleCameraMode,
  onToggleViewportOverlay,
  onUploadImage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posX, setPosX] = useState(settings.positionX || 20);
  const [posY, setPosY] = useState(settings.positionY || 120);
  const [isDragging, setIsDragging] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [currentSizeState, setCurrentSizeState] = useState<'small' | 'medium' | 'large'>(settings.size);
  const [isVibrating, setIsVibrating] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(settings.isCameraModeEnabled || false);
  const [cameraFlash, setCameraFlash] = useState(false);
  const [useWebcamStream, setUseWebcamStream] = useState(false);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialWidgetPos = useRef({ x: 0, y: 0 });
  const isClickRef = useRef(true);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const isViewportMode = !!settings.isViewportOverlay;

  // Sync camera active state with settings
  useEffect(() => {
    setIsCameraActive(!!settings.isCameraModeEnabled);
  }, [settings.isCameraModeEnabled]);

  // Request browser webcam for live front camera feed when active
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'user' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              setUseWebcamStream(true);
            }
          })
          .catch(() => {
            setUseWebcamStream(false);
          });
      } else {
        setUseWebcamStream(false);
      }
    } else {
      setUseWebcamStream(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  const getBounds = () => {
    if (isViewportMode) {
      return {
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
        minY: 0,
      };
    }
    const parent = containerRef.current?.parentElement;
    return {
      width: parent ? parent.clientWidth : 340,
      height: parent ? parent.clientHeight : 640,
      minY: 0,
    };
  };

  // Sync size state if setting changes
  useEffect(() => {
    setCurrentSizeState(settings.size);
  }, [settings.size]);

  // Sync camera mode setting
  useEffect(() => {
    setIsCameraActive(!!settings.isCameraModeEnabled);
  }, [settings.isCameraModeEnabled]);

  // Sync initial position if reset
  useEffect(() => {
    setPosX(settings.positionX);
    setPosY(settings.positionY);
  }, [settings.positionX, settings.positionY]);

  // Calculate size in pixels based on size state
  const getSizePx = () => {
    switch (currentSizeState) {
      case 'small':
        return 56;
      case 'medium':
        return 72;
      case 'large':
        return 96;
      default:
        return 72;
    }
  };

  const widgetPx = getSizePx();

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    isClickRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialWidgetPos.current = { x: posX, y: posY };

    // Start Long Press Timer (550ms)
    longPressTimerRef.current = setTimeout(() => {
      if (isClickRef.current) {
        setShowContextMenu(true);
        triggerVibration();
      }
    }, 550);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
      isClickRef.current = false;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }

    const bounds = getBounds();
    const newX = Math.max(0, Math.min(bounds.width - widgetPx, initialWidgetPos.current.x + deltaX));
    const newY = Math.max(bounds.minY, Math.min(bounds.height - widgetPx, initialWidgetPos.current.y + deltaY));

    setPosX(newX);
    setPosY(newY);
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    if (isDragging) {
      setIsDragging(false);

      if (isClickRef.current) {
        handleTap();
      } else {
        // Snap to edge animation
        if (settings.snapAnimationEnabled) {
          const bounds = getBounds();
          const middle = bounds.width / 2;
          const targetX = posX + widgetPx / 2 < middle ? 8 : bounds.width - widgetPx - 8;
          setPosX(targetX);
          onPositionChange(targetX, posY);
        } else {
          onPositionChange(posX, posY);
        }
      }
    }
  };

  const handleTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapTimeRef.current;

    if (timeDiff < 300) {
      // Double Tap -> Toggle Camera Mode vs Image
      triggerVibration();
      const nextCam = !isCameraActive;
      setIsCameraActive(nextCam);
      onToggleCameraMode?.(nextCam);
    } else {
      // Single Tap -> Open Fullscreen Image Viewer or Snap Photo
      if (isCameraActive) {
        snapPhoto();
      } else {
        onOpenImageViewer();
      }
    }

    lastTapTimeRef.current = now;
  };

  const snapPhoto = () => {
    triggerVibration();
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 250);
  };

  const triggerVibration = () => {
    if (settings.vibrationEnabled) {
      setIsVibrating(true);
      setTimeout(() => setIsVibrating(false), 200);
      if ('vibrate' in navigator) {
        navigator.vibrate(40);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: isViewportMode ? 'fixed' : 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        opacity: settings.opacity,
        zIndex: 9999,
        touchAction: 'none',
      }}
      className={`select-none transition-transform duration-200 ${
        isVibrating ? 'animate-bounce' : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="relative group cursor-grab active:cursor-grabbing">
        {/* Camera Flash Overlay effect */}
        {cameraFlash && (
          <div className="absolute inset-0 bg-white rounded-full z-50 animate-ping opacity-90" />
        )}

        {/* Main Floating Circle Viewport */}
        <div
          style={{ width: `${widgetPx}px`, height: `${widgetPx}px` }}
          className={`relative rounded-full p-0.5 shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden ${
            isCameraActive
              ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 ring-2 ring-emerald-400/80'
              : 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 ring-2 ring-purple-400/80'
          }`}
        >
          {isCameraActive ? (
            /* Live Camera Face Preview / Uploaded Photo */
            <div className="relative w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
              {useWebcamStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-full scale-110 -scale-x-100 pointer-events-none"
                />
              ) : (
                <img
                  src={settings.selectedImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt="Front Camera Feed"
                  className="w-full h-full object-cover rounded-full scale-110 pointer-events-none"
                />
              )}
              
              {/* Camera Gridline Overlay */}
              <div className="absolute inset-0 border border-emerald-400/30 rounded-full flex items-center justify-center pointer-events-none">
                <Focus className="w-5 h-5 text-emerald-400/80 animate-pulse" />
              </div>

              {/* REC Live Indicator Badge */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-600/90 text-[8px] font-mono font-bold text-white rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                <span>REC</span>
              </div>
            </div>
          ) : (
            /* Image Avatar View */
            <img
              src={settings.selectedImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              alt="Floating Avatar Widget"
              className="w-full h-full object-cover rounded-full pointer-events-none ring-1 ring-white/80"
            />
          )}

          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none animate-pulse" />
        </div>

        {/* Notification Badge Dot */}
        {settings.showBadge && !isCameraActive && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-md animate-pulse">
            {settings.badgeCount || 1}
          </div>
        )}

        {/* Camera Active Badge */}
        {isCameraActive && (
          <div className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold rounded-full p-1 border-2 border-white shadow-md">
            <Camera className="w-2.5 h-2.5" />
          </div>
        )}

        {/* Close Quick Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerVibration();
            onCloseWidget();
          }}
          className="absolute -top-2 -left-2 bg-slate-900/90 hover:bg-red-600 text-white rounded-full p-1 shadow-lg border border-white/20 transition-colors"
          title="Close Widget"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Toggle Camera / Image Quick Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerVibration();
            const nextCam = !isCameraActive;
            setIsCameraActive(nextCam);
            onToggleCameraMode?.(nextCam);
          }}
          className={`absolute -bottom-1 -right-1 text-white rounded-full p-1 shadow-lg border border-white/20 transition-colors ${
            isCameraActive ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-900/90 hover:bg-purple-600'
          }`}
          title={isCameraActive ? "Switch to Image View" : "Switch to Camera Preview"}
        >
          {isCameraActive ? <Aperture className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
        </button>

        {/* Floating Context Popup Menu (Triggered by Long Press) */}
        <AnimatePresence>
          {showContextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl p-1.5 text-slate-200 text-xs z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowContextMenu(false);
                  const nextCam = !isCameraActive;
                  setIsCameraActive(nextCam);
                  onToggleCameraMode?.(nextCam);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-600/30 rounded-lg transition-colors text-left font-medium text-emerald-400"
              >
                <Camera className="w-3.5 h-3.5" />
                {isCameraActive ? "Show Avatar Image" : "Enable Camera Preview"}
              </button>

              <button
                onClick={() => {
                  setShowContextMenu(false);
                  onToggleViewportOverlay?.(!isViewportMode);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-left font-medium"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                {isViewportMode ? "Lock Inside Mobile Frame" : "Move Anywhere on Screen"}
              </button>

              <button
                onClick={() => {
                  setShowContextMenu(false);
                  onOpenImageViewer();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-purple-600/30 rounded-lg transition-colors text-left font-medium"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                Open Image Viewer
              </button>

              <label className="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-600/30 text-indigo-300 rounded-lg transition-colors text-left font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setShowContextMenu(false);
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result && onUploadImage) {
                          onUploadImage(event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              <button
                onClick={() => {
                  setShowContextMenu(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-purple-600/30 rounded-lg transition-colors text-left font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                Widget Settings
              </button>

              <button
                onClick={() => {
                  setShowContextMenu(false);
                  onCloseWidget();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-left font-medium"
              >
                <Power className="w-3.5 h-3.5" />
                Exit Service
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
