import React from 'react';
import { ArrowLeft, RotateCcw, Volume2, Sparkles, Sliders, Moon, Power, Eye } from 'lucide-react';
import { WidgetSettings } from '../types/android';

interface SettingsScreenProps {
  settings: WidgetSettings;
  onUpdateSettings: (newSettings: Partial<WidgetSettings>) => void;
  onResetPosition: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetPosition,
  onBack,
}) => {
  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col overflow-y-auto select-none font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md p-3 border-b border-slate-800 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-800 active:scale-95 transition-all text-slate-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white tracking-wide">Widget Settings</h1>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Appearance Section */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Eye className="w-4 h-4" />
            <span>Appearance & Size</span>
          </div>

          {/* Size Choice */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Widget Size</label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onUpdateSettings({ size: sz })}
                  className={`py-2 px-3 rounded-xl capitalize font-medium transition-all text-center border ${
                    settings.size === sz
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Widget Opacity</span>
              <span className="text-purple-400 font-mono">{Math.round(settings.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={settings.opacity}
              onChange={(e) => onUpdateSettings({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Avatar Preset & Custom Image Upload Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-slate-300 font-medium">Chat-Head Avatar Image</label>
              <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                Custom Upload Supported
              </span>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div className="mb-3">
              <label
                htmlFor="avatar-file-upload-settings"
                className="group relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl bg-slate-900/60 hover:bg-purple-950/20 transition-all cursor-pointer text-center"
              >
                <input
                  id="avatar-file-upload-settings"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          onUpdateSettings({ selectedImageUrl: event.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 shadow-md bg-slate-800 flex-shrink-0">
                    <img
                      src={settings.selectedImageUrl}
                      alt="Current Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                      Click or drag image here to upload
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports PNG, JPG, WEBP, GIF
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Preset Avatars */}
            <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Or choose from sample avatars:</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
              ].map((url, i) => (
                <button
                  key={i}
                  onClick={() => onUpdateSettings({ selectedImageUrl: url })}
                  className={`relative w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform ${
                    settings.selectedImageUrl === url ? 'border-purple-500 scale-105 shadow-md' : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Behavior Section */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Sliders className="w-4 h-4" />
            <span>Behavior & Feedback</span>
          </div>

          {/* Auto Start Switch */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-200">Auto-Start on Boot</p>
              <p className="text-[11px] text-slate-400">Launch widget service on device restart</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStart}
              onChange={(e) => onUpdateSettings({ autoStart: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </div>

          {/* Vibration Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-200">Haptic Vibration</p>
                <p className="text-[11px] text-slate-400">Vibrate on touch and gestures</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={(e) => onUpdateSettings({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </div>

          {/* Edge Snap Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <p className="font-medium text-slate-200">Snap to Edge Animation</p>
                <p className="text-[11px] text-slate-400">Spring magnet snap to screen boundary</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.snapAnimationEnabled}
              onChange={(e) => onUpdateSettings({ snapAnimationEnabled: e.target.checked })}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </div>

          {/* Move Anywhere / Viewport Overlay Switch */}
          <div className="flex items-center justify-between p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
            <div>
              <p className="font-semibold text-indigo-300">Move Anywhere on Screen</p>
              <p className="text-[11px] text-slate-300">Detach widget to drag across full desktop/window</p>
            </div>
            <input
              type="checkbox"
              checked={!!settings.isViewportOverlay}
              onChange={(e) => onUpdateSettings({ isViewportOverlay: e.target.checked })}
              className="w-4.5 h-4.5 accent-indigo-500 rounded cursor-pointer"
            />
          </div>

          {/* Theme Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-slate-400" />
              <p className="font-medium text-slate-200">App Theme</p>
            </div>
            <select
              value={settings.themeMode}
              onChange={(e) => onUpdateSettings({ themeMode: e.target.value as any })}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs"
            >
              <option value="system">System Default</option>
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
          </div>
        </div>

        {/* Reset Action */}
        <button
          onClick={onResetPosition}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold rounded-2xl border border-purple-500/30 transition-all active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Widget Screen Position</span>
        </button>
      </div>
    </div>
  );
};
