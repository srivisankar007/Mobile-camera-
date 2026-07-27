import React from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface OverlayPermissionDialogProps {
  onGrantPermission: () => void;
  onCancel: () => void;
}

export const OverlayPermissionDialog: React.FC<OverlayPermissionDialogProps> = ({
  onGrantPermission,
  onCancel,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xs w-full p-5 shadow-2xl text-slate-200 text-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Display Over Other Apps</h3>
            <p className="text-[11px] text-slate-400">SYSTEM_ALERT_WINDOW Permission</p>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">
          To display the floating chat-head widget while you use other apps, Android requires special permission.
        </p>

        <div className="bg-slate-800/80 rounded-xl p-3 space-y-2 border border-slate-700/50">
          <p className="font-semibold text-slate-200 text-[11px]">How to enable:</p>
          <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px]">
            <li>Tap <strong className="text-purple-300">Open Settings</strong> below</li>
            <li>Locate <strong className="text-purple-300">Floating Widget</strong></li>
            <li>Toggle <strong className="text-purple-300">Allow display over other apps</strong> to ON</li>
          </ol>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onGrantPermission}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:brightness-110 active:scale-98 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Allow Permission & Start</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 text-slate-400 hover:text-slate-200 transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
