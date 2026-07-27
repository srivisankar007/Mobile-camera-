export interface WidgetSettings {
  size: 'small' | 'medium' | 'large';
  opacity: number; // 0.1 to 1.0
  autoStart: boolean;
  vibrationEnabled: boolean;
  snapAnimationEnabled: boolean;
  themeMode: 'system' | 'light' | 'dark';
  positionX: number; // percentage or pixels
  positionY: number;
  showBadge: boolean;
  badgeCount: number;
  selectedImageUrl: string;
  isCameraModeEnabled: boolean;
  isViewportOverlay?: boolean; // When true, floats over the entire screen/page window
}

export interface AndroidFile {
  id: string;
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'json' | 'properties';
  category: 'manifest' | 'kotlin' | 'layout' | 'values' | 'gradle' | 'drawable';
  content: string;
  description: string;
}

export type SimulatorScreen = 'main' | 'settings' | 'image_viewer' | 'permission_settings';

export interface FloatingWidgetState {
  isVisible: boolean;
  isForegroundServiceRunning: boolean;
  hasOverlayPermission: boolean;
  hasCameraPermission: boolean;
  isCameraPreviewActive: boolean;
  isExpanded: boolean;
  isDragging: boolean;
  x: number;
  y: number;
}
