import React, { useState } from 'react';
import { Wifi, Battery, ShieldAlert, Play, Square, Settings as SettingsIcon, Image as ImageIcon, ChevronDown, Sparkles } from 'lucide-react';
import { WidgetSettings, FloatingWidgetState, SimulatorScreen } from '../types/android';
import { FloatingWidgetOverlay } from './FloatingWidgetOverlay';
import { ImageViewerScreen } from './ImageViewerScreen';
import { SettingsScreen } from './SettingsScreen';
import { OverlayPermissionDialog } from './OverlayPermissionDialog';
import { NotificationShade } from './NotificationShade';

interface PhoneSimulatorProps {
  settings: WidgetSettings;
  widgetState: FloatingWidgetState;
  onUpdateSettings: (newSettings: Partial<WidgetSettings>) => void;
  onUpdateWidgetState: (newState: Partial<FloatingWidgetState>) => void;
  onResetPosition: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  settings,
  widgetState,
  onUpdateSettings,
  onUpdateWidgetState,
  onResetPosition,
}) => {
  const [currentScreen, setCurrentScreen] = useState<SimulatorScreen>('main');
  const [showNotificationShade, setShowNotificationShade] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleStartService = () => {
    if (!widgetState.hasOverlayPermission) {
      setShowPermissionModal(true);
    } else {
      onUpdateWidgetState({ isForegroundServiceRunning: true, isVisible: true });
    }
  };

  const handleStopService = () => {
    onUpdateWidgetState({ isForegroundServiceRunning: false, isVisible: false });
  };

  const handleGrantPermission = () => {
    onUpdateWidgetState({
      hasOverlayPermission: true,
      isForegroundServiceRunning: true,
      isVisible: true,
    });
    setShowPermissionModal(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-[360px] h-[660px] sm:h-[720px] bg-slate-950 rounded-[40px] sm:rounded-[48px] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-800 flex flex-col justify-between overflow-hidden select-none">
      {/* Phone Camera Punch Hole Notch */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 border border-slate-800 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
      </div>

      {/* Internal Phone Screen Container */}
      <div className="relative w-full h-full bg-slate-900 rounded-[38px] overflow-hidden flex flex-col justify-between border border-slate-800">
        
        {/* Android Top Status Bar */}
        <div
          onClick={() => setShowNotificationShade(!showNotificationShade)}
          className="z-40 h-8 px-5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between text-[11px] font-medium text-slate-300 cursor-pointer hover:bg-slate-900 transition-colors"
        >
          <span className="font-semibold text-white">{currentTime}</span>
          <div className="flex items-center gap-2">
            {widgetState.isForegroundServiceRunning && (
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" title="Foreground Service Running" />
            )}
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Top Notification Shade Dropdown */}
        {showNotificationShade && (
          <NotificationShade
            isServiceRunning={widgetState.isForegroundServiceRunning}
            onStopService={handleStopService}
            onOpenSettings={() => setCurrentScreen('settings')}
            onCloseShade={() => setShowNotificationShade(false)}
          />
        )}

        {/* Permission Modal */}
        {showPermissionModal && (
          <OverlayPermissionDialog
            onGrantPermission={handleGrantPermission}
            onCancel={() => setShowPermissionModal(false)}
          />
        )}

        {/* Screen Content Area */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
          
          {/* SCREEN 1: MAIN ACTIVITY */}
          {currentScreen === 'main' && (
            <div className="w-full h-full p-4 flex flex-col justify-between overflow-y-auto font-sans text-slate-200">
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-base">Floating Widget Studio</h2>
                      <p className="text-xs text-indigo-100 mt-0.5">Android Chat-Head Service</p>
                    </div>
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                      <Sparkles className="w-5 h-5 text-indigo-100" />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                    <span className="text-indigo-100">Foreground Service:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        widgetState.isForegroundServiceRunning
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-red-400/20 text-red-300 border border-red-400/40'
                      }`}
                    >
                      {widgetState.isForegroundServiceRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>

                {/* Permission Warning Box */}
                {!widgetState.hasOverlayPermission && (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Overlay Permission Missing</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      "Display over other apps" is required to show the floating widget over other applications.
                    </p>
                    <button
                      onClick={() => setShowPermissionModal(true)}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      Grant Overlay Permission
                    </button>
                  </div>
                )}

                {/* Control Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleStartService}
                    disabled={widgetState.isForegroundServiceRunning}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 text-xs cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Floating Widget</span>
                  </button>

                  <button
                    onClick={handleStopService}
                    disabled={!widgetState.isForegroundServiceRunning}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98 text-xs cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Floating Widget</span>
                  </button>

                  <button
                    onClick={() => {
                      const nextState = !settings.isCameraModeEnabled;
                      onUpdateSettings({ isCameraModeEnabled: nextState });
                      if (nextState && !widgetState.hasCameraPermission) {
                        onUpdateWidgetState({ hasCameraPermission: true });
                      }
                    }}
                    className={`w-full py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer border ${
                      settings.isCameraModeEnabled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    <span>{settings.isCameraModeEnabled ? 'Live Camera Feed Active' : 'Switch Widget to Live Camera Mode'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen('settings')}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98 text-xs cursor-pointer"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Configure Settings</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen('image_viewer')}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-800 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <span>Open Image Viewer</span>
                  </button>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-2">
                MVVM Architecture • Target Android 14 (API 34)
              </div>
            </div>
          )}

          {/* SCREEN 2: SETTINGS ACTIVITY */}
          {currentScreen === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onResetPosition={onResetPosition}
              onBack={() => setCurrentScreen('main')}
            />
          )}

          {/* SCREEN 3: FULLSCREEN IMAGE VIEWER */}
          {currentScreen === 'image_viewer' && (
            <ImageViewerScreen
              imageUrl={settings.selectedImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              onBack={() => setCurrentScreen('main')}
            />
          )}

          {/* FLOATING OVERLAY WIDGET (Floats over all screens inside phone when active) */}
          {widgetState.isForegroundServiceRunning && widgetState.isVisible && (
            <FloatingWidgetOverlay
              settings={settings}
              onOpenImageViewer={() => setCurrentScreen('image_viewer')}
              onOpenSettings={() => setCurrentScreen('settings')}
              onCloseWidget={handleStopService}
              onPositionChange={(x, y) => onUpdateSettings({ positionX: x, positionY: y })}
              onToggleCameraMode={(enabled) => onUpdateSettings({ isCameraModeEnabled: enabled })}
            />
          )}

        </div>

        {/* Android Bottom Navigation Bar */}
        <div className="h-8 bg-slate-950 flex items-center justify-around px-8">
          <button
            onClick={() => setCurrentScreen('main')}
            className="w-12 h-1 bg-slate-600 hover:bg-white rounded-full transition-colors"
            title="Android Home Gesture"
          />
        </div>

      </div>
    </div>
  );
};
