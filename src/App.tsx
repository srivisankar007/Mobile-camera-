import React, { useState } from 'react';
import { Smartphone, Code2, Layers, Download, Play, Square, Settings, ShieldCheck, Sparkles, RefreshCw, CheckCircle, Info, Upload, Image as ImageIcon } from 'lucide-react';
import { WidgetSettings, FloatingWidgetState } from './types/android';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { downloadAndroidProjectZip } from './utils/zipExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'specs'>('simulator');
  const [displayMode, setDisplayMode] = useState<'phone' | 'split' | 'controls'>('split');

  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    size: 'medium',
    opacity: 1.0,
    autoStart: true,
    vibrationEnabled: true,
    snapAnimationEnabled: true,
    themeMode: 'dark',
    positionX: 30,
    positionY: 140,
    showBadge: true,
    badgeCount: 1,
    selectedImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    isCameraModeEnabled: false,
  });

  const [widgetState, setWidgetState] = useState<FloatingWidgetState>({
    isVisible: true,
    isForegroundServiceRunning: true,
    hasOverlayPermission: true,
    hasCameraPermission: true,
    isCameraPreviewActive: false,
    isExpanded: false,
    isDragging: false,
    x: 30,
    y: 140,
  });

  const handleUpdateSettings = (newSettings: Partial<WidgetSettings>) => {
    setWidgetSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdateWidgetState = (newState: Partial<FloatingWidgetState>) => {
    setWidgetState((prev) => ({ ...prev, ...newState }));
  };

  const handleResetPosition = () => {
    setWidgetSettings((prev) => ({ ...prev, positionX: 30, positionY: 140 }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-0 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
                  MobileCameraView
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono px-2 py-0.5 rounded-full font-semibold">
                    Kotlin MVVM
                  </span>
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500">Chat-Head Style System Overlay & Full Code Suite</p>
              </div>
            </div>

            {/* Mobile Export ZIP Header Button */}
            <button
              onClick={downloadAndroidProjectZip}
              className="md:hidden flex items-center justify-center p-2 bg-indigo-600 text-white rounded-xl shadow-xs"
              title="Download Android Project (.zip)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold w-full md:w-auto justify-center">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs">Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs">Source Code</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'specs'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              <Layers className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs">Architecture</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        
        {/* TAB 1: INTERACTIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div>
            {/* View Switcher Segmented Control */}
            <div className="flex items-center justify-center bg-slate-200/80 p-1.5 rounded-2xl mb-6 font-semibold text-xs border border-slate-300/80 max-w-lg mx-auto shadow-xs">
              <button
                onClick={() => setDisplayMode('phone')}
                className={`flex-1 py-2 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  displayMode === 'phone'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-900 font-medium'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Phone View Only</span>
              </button>
              
              <button
                onClick={() => setDisplayMode('split')}
                className={`flex-1 py-2 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  displayMode === 'split'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-900 font-medium'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Split View</span>
              </button>

              <button
                onClick={() => setDisplayMode('controls')}
                className={`flex-1 py-2 px-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  displayMode === 'controls'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-900 font-medium'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Controls Only</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Side Control Sandbox Deck */}
              <div className={`space-y-6 ${
                displayMode === 'split'
                  ? 'lg:col-span-5 block'
                  : displayMode === 'controls'
                  ? 'lg:col-span-12 max-w-2xl mx-auto block'
                  : 'hidden'
              }`}>
                
                {/* Status Banner */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Overlay Sandbox Controls</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                    Target API 34 (Android 14)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Test the chat-head floating overlay behavior directly in this live Android smartphone sandbox.
                  Drag the widget around, test edge magnetism snapping, double-tap size toggling, camera preview, and image viewer.
                </p>

                {/* Quick Toggle Controls */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() =>
                      handleUpdateWidgetState({
                        isForegroundServiceRunning: !widgetState.isForegroundServiceRunning,
                        isVisible: !widgetState.isForegroundServiceRunning,
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                      widgetState.isForegroundServiceRunning
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {widgetState.isForegroundServiceRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{widgetState.isForegroundServiceRunning ? 'Stop Service' : 'Start Service'}</span>
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateWidgetState({
                        hasOverlayPermission: !widgetState.hasOverlayPermission,
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                      widgetState.hasOverlayPermission
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Permission: {widgetState.hasOverlayPermission ? 'Granted' : 'Denied'}</span>
                  </button>
                </div>
              </div>

              {/* Realtime Customizers */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span>Realtime Overlay Parameters</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-slate-700 font-medium mb-1">
                      <span>Opacity: {Math.round(widgetSettings.opacity * 100)}%</span>
                      <span className="text-indigo-600 font-mono text-[11px]">WindowManager.LayoutParams.alpha</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={widgetSettings.opacity}
                      onChange={(e) => handleUpdateSettings({ opacity: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-700 font-medium">Auto Snap-To-Edge</span>
                    <input
                      type="checkbox"
                      checked={widgetSettings.snapAnimationEnabled}
                      onChange={(e) => handleUpdateSettings({ snapAnimationEnabled: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Haptic Vibration Feedback</span>
                    <input
                      type="checkbox"
                      checked={widgetSettings.vibrationEnabled}
                      onChange={(e) => handleUpdateSettings({ vibrationEnabled: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Notification Badge Dot</span>
                    <input
                      type="checkbox"
                      checked={widgetSettings.showBadge}
                      onChange={(e) => handleUpdateSettings({ showBadge: e.target.checked })}
                      className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl">
                    <div>
                      <span className="font-bold text-indigo-900 block">Move Anywhere on Screen</span>
                      <span className="text-[11px] text-indigo-700">Detach widget to drag across entire window</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!widgetSettings.isViewportOverlay}
                      onChange={(e) => handleUpdateSettings({ isViewportOverlay: e.target.checked })}
                      className="w-4.5 h-4.5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={handleResetPosition}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-indigo-700 font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Position to Default</span>
                </button>
              </div>

              {/* Custom Image Upload Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Upload Custom Avatar Image</span>
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                    Live Sync
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Upload your own image to replace the chat-head avatar. The uploaded image will immediately render on the phone floating widget and in the fullscreen image viewer.
                </p>

                <label
                  htmlFor="main-avatar-upload"
                  className="flex items-center justify-center gap-3 p-3 border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl cursor-pointer transition-all group"
                >
                  <input
                    id="main-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            handleUpdateSettings({ selectedImageUrl: event.target.result as string });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-600 overflow-hidden shadow-xs flex-shrink-0 bg-slate-100">
                    <img
                      src={widgetSettings.selectedImageUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-indigo-700 group-hover:text-indigo-800 text-xs">
                    <Upload className="w-4 h-4" />
                    <span>Choose Image File...</span>
                  </div>
                </label>
              </div>

              {/* Instructions Guide */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-3xl p-5 text-xs text-slate-700 space-y-2">
                <h4 className="font-bold text-indigo-900 text-sm">Interactive Gestures Cheat Sheet</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                  <li><strong className="text-slate-900">Drag & Drop:</strong> Drag anywhere on screen. Snaps to left or right edge.</li>
                  <li><strong className="text-slate-900">Single Tap:</strong> Opens Fullscreen Image Viewer with Pinch-to-Zoom.</li>
                  <li><strong className="text-slate-900">Double Tap:</strong> Toggles chat head size (Small ↔ Medium ↔ Large).</li>
                  <li><strong className="text-slate-900">Long Press (Hold):</strong> Opens popup menu (Open Image, Settings, Hide, Exit).</li>
                  <li><strong className="text-slate-900">Close (X) Button:</strong> Stops floating service.</li>
                </ul>
              </div>

            </div>

            {/* Right Column: Android Phone Simulator View */}
            <div className={`flex justify-center py-2 ${
              displayMode === 'split'
                ? 'lg:col-span-7 block'
                : displayMode === 'phone'
                ? 'lg:col-span-12 w-full block'
                : 'hidden'
            }`}>
              <PhoneSimulator
                settings={widgetSettings}
                widgetState={widgetState}
                onUpdateSettings={handleUpdateSettings}
                onUpdateWidgetState={handleUpdateWidgetState}
                onResetPosition={handleResetPosition}
              />
            </div>

          </div>
        </div>
        )}

        {/* TAB 2: CODE EXPLORER */}
        {activeTab === 'code' && (
          <div className="h-[750px]">
            <CodeExplorer />
          </div>
        )}

        {/* TAB 3: ARCHITECTURE SPECS */}
        {activeTab === 'specs' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8 text-slate-700 text-xs sm:text-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Android Architecture & Implementation Specs</span>
              </h2>
              <p className="text-slate-500 text-xs">
                Comprehensive technical overview of the production Kotlin floating widget application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-base text-indigo-600">1. System Overlay & WindowManager</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uses <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY</code> for Android 8.0+ (API 26+) and target API 34 compliance.
                  Requests <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">SYSTEM_ALERT_WINDOW</code> permission with runtime check via <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">Settings.canDrawOverlays(context)</code>.
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-base text-indigo-600">2. Foreground Service Lifecycle</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Runs inside <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">FloatingWidgetService</code> decorated with persistent notification channel (<code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">NotificationManager.IMPORTANCE_LOW</code>).
                  Returns <code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono">START_STICKY</code> to ensure automatic resurrection if terminated by low memory.
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-base text-emerald-600">3. Gesture Detection & Magnet Snap</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Custom touch listener calculates raw motion deltas (<code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">ACTION_DOWN</code>, <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">ACTION_MOVE</code>, <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">ACTION_UP</code>).
                  Spring physics snap animation implemented using <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">ValueAnimator</code> with <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">OvershootInterpolator</code>.
                </p>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-base text-amber-600">4. Zero Camera Guarantee</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strictly adheres to privacy rules: <strong>No camera permissions requested</strong>, no camera preview views initialized, and no background hardware camera access.
                </p>
              </div>

            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Summary of Included Android Artifacts</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700 font-medium">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ AndroidManifest.xml</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ FloatingWidgetService.kt</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ MainActivity.kt</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ ImageViewerActivity.kt</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ SettingsActivity.kt</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ WidgetRepository.kt</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ BootReceiver.kt</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">✓ widget_floating.xml</div>
              </div>
            </div>

            {/* Mobile App Build & Deployment Guide */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2 text-indigo-400">
                  <Download className="w-5 h-5" />
                  <span>How to Build & Deploy the Android APK</span>
                </h3>
                <button
                  onClick={downloadAndroidProjectZip}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </button>
              </div>

              <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Download Project ZIP:</strong> Click the <span className="text-indigo-400 font-semibold">"Download Android Project (.zip)"</span> button at the top right to download <code className="text-indigo-300 font-mono">FloatingWidgetAndroidStudioProject.zip</code>.
                </li>
                <li>
                  <strong className="text-white">Extract & Open in Android Studio:</strong> Extract the ZIP folder and open Android Studio (Ladybug / Jellyfish or newer). Select <code className="text-indigo-300 font-mono">Open an Existing Project</code> and choose the extracted folder.
                </li>
                <li>
                  <strong className="text-white">Sync Gradle Dependencies:</strong> Android Studio will automatically run Gradle Sync using <code className="text-indigo-300 font-mono">build.gradle.kts</code> with Target API 34 (Android 14) and Material Design 3.
                </li>
                <li>
                  <strong className="text-white">Build APK / AAB Bundle:</strong>
                  <ul className="pl-6 mt-1 space-y-1 list-disc text-slate-400">
                    <li>For testing on physical phone/emulator: Go to <code className="text-slate-200 font-mono">Build &gt; Build APK(s)</code> or run <code className="text-slate-200 font-mono">./gradlew assembleDebug</code>.</li>
                    <li>For Google Play Store deployment: Go to <code className="text-slate-200 font-mono">Build &gt; Generate Signed Bundle / APK</code> and create an App Bundle (<code className="text-slate-200 font-mono">.aab</code>).</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-white">Grant Overlay Permission on Device:</strong> When launched on device, the app prompts for <code className="text-indigo-300 font-mono">SYSTEM_ALERT_WINDOW</code> permission ("Display over other apps") to run the floating overlay chat-head.
                </li>
              </ol>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Android Floating Widget Studio • Built with Material Design 3, Kotlin, MVVM & Foreground Service
      </footer>
    </div>
  );
}
