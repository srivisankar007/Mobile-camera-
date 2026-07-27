import React from 'react';
import { ShieldCheck, Power, Settings as SettingsIcon, ChevronUp, Bell } from 'lucide-react';

interface NotificationShadeProps {
  isServiceRunning: boolean;
  onStopService: () => void;
  onOpenSettings: () => void;
  onCloseShade: () => void;
}

export const NotificationShade: React.FC<NotificationShadeProps> = ({
  isServiceRunning,
  onStopService,
  onOpenSettings,
  onCloseShade,
}) => {
  return (
    <div className="absolute inset-x-0 top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-200 text-xs shadow-2xl p-4 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white tracking-wide">Android Notification Drawer</span>
        </div>
        <button
          onClick={onCloseShade}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {isServiceRunning ? (
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-3 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-600/30 text-purple-400 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white text-xs">Floating Widget Active</p>
                <p className="text-[10px] text-slate-400">Foreground Service Running (START_STICKY)</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="flex gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => {
                onStopService();
                onCloseShade();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Stop Service</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onCloseShade();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-slate-500 text-xs italic">
          No active background services. Tap "Start Floating Widget" in Main App.
        </div>
      )}
    </div>
  );
};
