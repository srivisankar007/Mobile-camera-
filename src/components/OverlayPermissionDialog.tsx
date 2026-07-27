import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight, ToggleLeft, ToggleRight, Info } from 'lucide-react';

interface OverlayPermissionDialogProps {
  onGrantPermission: () => void;
  onCancel: () => void;
}

export const OverlayPermissionDialog: React.FC<OverlayPermissionDialogProps> = ({
  onGrantPermission,
  onCancel,
}) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    if (!isToggled) {
      setTimeout(() => {
        onGrantPermission();
      }, 400);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xs w-full p-5 shadow-2xl text-slate-200 text-xs space-y-4">
        {/* Android System Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Display over other apps</h3>
            <p className="text-[10px] font-mono text-indigo-300">SYSTEM_ALERT_WINDOW (API 34)</p>
          </div>
        </div>

        {/* Official Android System Permission Explanation */}
        <div className="bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 space-y-2">
          <div className="flex items-start gap-2 text-amber-300">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 italic leading-relaxed font-normal">
              "This permission allows an app to appear on top of other apps. This might affect how other apps are displayed"
            </p>
          </div>
        </div>

        {/* Realistic Android 14 Settings Toggle */}
        <div className="bg-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between border border-slate-700/60 shadow-inner">
          <div className="space-y-0.5 pr-2">
            <p className="font-bold text-slate-100 text-xs">Allow display over other apps</p>
            <p className="text-[10px] text-slate-400">Enable floating chat-head overlay widget</p>
          </div>

          <button
            onClick={handleToggle}
            className="p-1 transition-transform active:scale-90 cursor-pointer"
            title="Toggle permission"
          >
            {isToggled ? (
              <ToggleRight className="w-10 h-10 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-500" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onGrantPermission}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Grant Permission & Activate</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 text-slate-400 hover:text-slate-200 transition-colors text-center text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

