import React, { useState } from 'react';
import { Download, Copy, Check, Search, FileCode, Code2, Sparkles, Terminal, ShieldCheck, AlertTriangle, Send, Loader2, Bot } from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

export const CodeExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('floating-service');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Backend Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<{
    isValid: boolean;
    score: number;
    issuesCount: number;
    issues: Array<{ id: string; type: 'error' | 'warning' | 'info'; message: string }>;
    androidVersionTarget: string;
  } | null>(null);

  // Gemini Assistant State
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

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
      // Try backend server ZIP endpoint first
      const res = await fetch('/api/android/download-zip');
      if (res.ok) {
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'FloatingOverlayStudio_AndroidProject.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Client fallback
        await downloadAndroidProjectZip();
      }
    } catch {
      await downloadAndroidProjectZip();
    } finally {
      setIsExporting(false);
    }
  };

  const handleRunBackendValidation = async () => {
    setIsValidating(true);
    try {
      const manifest = ANDROID_PROJECT_FILES.find((f) => f.id === 'manifest')?.content || '';
      const kotlin = ANDROID_PROJECT_FILES.find((f) => f.id === 'floating-service')?.content || '';

      const res = await fetch('/api/android/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manifestXml: manifest, kotlinCode: kotlin }),
      });

      if (res.ok) {
        const data = await res.json();
        setValidationReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAskGemini = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentCode: selectedFile.content,
          topic: selectedFile.name,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiAnswer(data.answer);
      } else {
        setAiAnswer(`Error: ${data.message || data.error || 'Failed to fetch AI response'}`);
      }
    } catch (err: any) {
      setAiAnswer(`Error connecting to server backend: ${err?.message || 'Server error'}`);
    } finally {
      setIsAiLoading(false);
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Packaging ZIP...' : 'Export Project (.zip)'}</span>
            </button>

            <button
              onClick={handleRunBackendValidation}
              disabled={isValidating}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium rounded-xl border border-emerald-200 flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
            >
              {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
              <span>Backend Android 14 Audit</span>
            </button>

            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`w-full py-2 px-3 font-medium rounded-xl border flex items-center justify-center gap-2 transition-all text-xs cursor-pointer ${
                showAiAssistant
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showAiAssistant ? 'Hide AI Assistant' : 'AI Kotlin Assistant'}</span>
            </button>
          </div>

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

        {/* Validation Audit Modal / Panel */}
        {validationReport && (
          <div className="p-3 bg-slate-900 text-white border-b border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Compliance Score: {validationReport.score}/100
              </span>
              <button
                onClick={() => setValidationReport(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300">Target: {validationReport.androidVersionTarget}</p>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {validationReport.issues.map((issue, idx) => (
                <div key={idx} className="p-1.5 bg-slate-800 rounded border border-slate-700 text-[10px] space-y-0.5">
                  <span className={`font-bold ${issue.type === 'error' ? 'text-red-400' : issue.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                    [{issue.type.toUpperCase()}]
                  </span>{' '}
                  <span className="text-slate-200">{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* Code Editor & AI Panel */}
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

        {/* Gemini AI Assistant Drawer */}
        {showAiAssistant && (
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Bot className="w-4 h-4" />
              <span>Gemini AI Kotlin Developer Assistant</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Ask Gemini about ${selectedFile.name} or request custom Kotlin logic...`}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleAskGemini}
                disabled={isAiLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask</span>
              </button>
            </div>

            {aiAnswer && (
              <div className="p-3 bg-slate-950 rounded-xl border border-purple-500/30 text-xs text-slate-200 max-h-48 overflow-y-auto space-y-1 font-sans">
                <p className="font-bold text-purple-300 text-[11px]">Gemini Response:</p>
                <div className="whitespace-pre-wrap leading-relaxed text-[11px] font-mono text-slate-300">
                  {aiAnswer}
                </div>
              </div>
            )}
          </div>
        )}

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

