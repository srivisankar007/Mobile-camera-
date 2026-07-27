import React, { useState } from 'react';
import { Download, Copy, Check, Search, FileCode, Folder, Code2, Sparkles, Terminal } from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

export const CodeExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('floating-service');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const selectedFile = ANDROID_PROJECT_FILES.find((f) => f.id === selectedFileId) || ANDROID_PROJECT_FILES[0];

  const filteredFiles = ANDROID_PROJECT_FILES.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await downloadAndroidProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full h-full bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-sm">
      {/* File Navigation Sidebar */}
      <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-800 text-sm">Android Studio Project</h2>
            </div>
            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-semibold">
              Kotlin MVVM
            </span>
          </div>

          {/* Download Project ZIP Button */}
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Packaging ZIP...' : 'Export Android Project (.zip)'}</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search source files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* File Tree List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          {filteredFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                selectedFileId === file.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-medium'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <FileCode className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                file.category === 'manifest' ? 'text-amber-600' :
                file.category === 'kotlin' ? 'text-indigo-600' :
                file.category === 'layout' ? 'text-emerald-600' : 'text-slate-500'
              }`} />
              <div className="min-w-0">
                <p className="font-semibold truncate text-slate-800">{file.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-mono">{file.path}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor Preview Area */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Editor Top Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm font-mono">{selectedFile.name}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono uppercase border border-slate-700">
                {selectedFile.language}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{selectedFile.description}</p>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-all border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Syntax Code Display */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
          <pre className="whitespace-pre">
            {selectedFile.content.split('\n').map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                <span className="table-cell pr-4 text-right select-none text-slate-600 text-[11px] w-10">
                  {idx + 1}
                </span>
                <span className="table-cell">{line}</span>
              </div>
            ))}
          </pre>
        </div>

        {/* Editor Bottom Info Bar */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Path: {selectedFile.path}</span>
          </div>
          <span>Total Lines: {selectedFile.content.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
};
