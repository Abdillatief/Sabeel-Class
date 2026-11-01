import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, Eye, Split, FileCheck2, Info, Sparkles, AlignJustify, ListOrdered, BookOpen } from 'lucide-react';
import { CorrectionError } from '../types';

interface CorrectedTextViewerProps {
  rawText: string;
  correctedHtml: string;
  correctedPlain: string;
  actualWordCount: number;
  errors: CorrectionError[];
}

export const CorrectedTextViewer: React.FC<CorrectedTextViewerProps> = ({
  rawText,
  correctedHtml,
  correctedPlain,
  actualWordCount,
  errors,
}) => {
  const [viewMode, setViewMode] = useState<'corrected' | 'raw' | 'diff'>('corrected');
  const [copiedType, setCopiedType] = useState<'plain' | 'html' | null>(null);
  const [selectedError, setSelectedError] = useState<CorrectionError | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isNotebookLined, setIsNotebookLined] = useState(true); // Default to lined paper layout!
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  // Copy plain text preserving line breaks
  const copyPlain = () => {
    navigator.clipboard.writeText(correctedPlain);
    setCopiedType('plain');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Copy HTML with <u> tags preserving line breaks
  const copyHtml = () => {
    navigator.clipboard.writeText(correctedHtml);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Arabic TTS using browser SpeechSynthesis
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('متصفحك لا يدعم القراءة الصوتية للنصوص.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(correctedPlain);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Render text with interactive <u> tags and optional line numbers
  const renderInteractiveText = (htmlContent: string) => {
    if (!htmlContent) return <p className="text-neutral-400">لا يوجد نص مفرغ بعد.</p>;

    const preparedHtml = htmlContent.replace(
      /<u>(.*?)<\/u>/g,
      '<u class="corrected-word text-amber-200 border-b-2 border-rose-500 underline-offset-8 decoration-wavy decoration-rose-500 font-bold px-1 rounded bg-rose-500/10 cursor-pointer" title="انقر لعرض تفاصيل الخطأ والتصويب">$1</u>'
    );

    // If line numbers requested, split by newline and render each line with counter
    if (showLineNumbers) {
      const lines = preparedHtml.split('\n');
      return (
        <div className="space-y-1 select-text">
          {lines.map((lineHtml, idx) => (
            <div key={idx} className="flex items-baseline gap-3 group">
              <span className="text-[11px] font-mono text-neutral-600 select-none w-6 text-left group-hover:text-amber-400 shrink-0">
                {idx + 1}
              </span>
              <div
                className="flex-1 font-['Amiri'] text-xl sm:text-2xl leading-[2.6] text-neutral-100 tracking-wide"
                dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                onClick={handleWordClick}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        className="font-['Amiri'] text-xl sm:text-2xl leading-[2.6] text-neutral-100 tracking-wide select-text selection:bg-amber-500/30 whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: preparedHtml }}
        onClick={handleWordClick}
      />
    );
  };

  const handleWordClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName.toLowerCase() === 'u') {
      const word = target.innerText.trim();
      const match = errors.find(
        (err) =>
          err.correctedWord.trim() === word ||
          word.includes(err.correctedWord.trim()) ||
          err.correctedWord.includes(word)
      );
      if (match) {
        setSelectedError(match);
      } else {
        setSelectedError({
          id: 'err-custom',
          originalWord: 'كما ورد في الصورة',
          correctedWord: word,
          type: 'spelling',
          typeName: 'تصحيح إملائي/نحوي',
          explanation: 'تم تصويب الكلمة لتوافق قواعد اللغة العربية الفصحى ورسم الكلمات السليم.',
        });
      }
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full shadow-xl">
      {/* Viewer Header */}
      <div className="bg-black/90 px-4 py-2.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setViewMode('corrected')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'corrected'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>النص المصحح (مع &lt;u&gt;)</span>
          </button>

          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'raw'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>التفريغ الحرفي (الأصل)</span>
          </button>

          <button
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'diff'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>مقارنة جانبية</span>
          </button>
        </div>

        {/* Layout & Style Controls */}
        <div className="flex items-center gap-2">
          {/* Lined Paper Layout Toggle */}
          <button
            onClick={() => setIsNotebookLined(!isNotebookLined)}
            title="تفعيل نمط أسطر الدفتر المسطرة بنفس ترتيب الورقة"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer ${
              isNotebookLined
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-inner'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
            <span>تسطير الورقة</span>
          </button>

          {/* Line Numbers Toggle */}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            title="إظهار ترقيم أسطر الورقة (سطر 1، 2، 3...)"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition cursor-pointer ${
              showLineNumbers
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>ترقيم الأسطر</span>
          </button>

          {/* Word count pill */}
          <div className="bg-black border border-neutral-800 px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 text-neutral-300">
            <span>الكلمات:</span>
            <strong className="text-amber-400 font-bold">{actualWordCount}</strong>
          </div>

          {/* Copy Plain */}
          <button
            onClick={copyPlain}
            title="نسخ النص مع الحفاظ على ترتيب وأسطر الورقة"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
          >
            {copiedType === 'plain' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">نسخ منسق</span>
          </button>

          {/* Copy HTML */}
          <button
            onClick={copyHtml}
            title="نسخ كود HTML مع وسوم &lt;u&gt; وفواصل الأسطر"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 hover:text-amber-200 transition cursor-pointer"
          >
            {copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="font-mono text-[10px]">&lt;u&gt;</span>}
            <span className="hidden sm:inline text-[11px]">HTML</span>
          </button>

          {/* TTS Listen */}
          <button
            onClick={toggleSpeech}
            title={isSpeaking ? 'إيقاف القراءة الصوتية' : 'استماع للنص المصحح'}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Text Content Area */}
      <div className="p-6 overflow-y-auto min-h-[420px] max-h-[640px] bg-black">
        {/* Mode: Corrected */}
        {viewMode === 'corrected' && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-900/40 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  تم ترتيب النص سطر بسطر وفقرات مستقلة تماماً كما في الورقة الأصلية (انقر على أي كلمة مصوبة لعرض تعليلها).
                </span>
              </span>
              <span className="text-[11px] text-rose-400 font-mono font-semibold">
                {errors.length} موضع مصحح
              </span>
            </div>

            <div
              className={`p-6 sm:p-8 rounded-xl border border-neutral-800/80 shadow-inner relative transition-all ${
                isNotebookLined
                  ? 'bg-neutral-950 [background-image:linear-gradient(to_bottom,transparent_39px,#1f1f1f_40px)] [background-size:100%_40px]'
                  : 'bg-neutral-950'
              }`}
            >
              {renderInteractiveText(correctedHtml)}
            </div>
          </div>
        )}

        {/* Mode: Raw */}
        {viewMode === 'raw' && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-900/40 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
              <span>
                التفريغ الحرفي الأولي بنسبة 100% سطر بسطر وبنفس ترتيب وتنسيق أسطر الورقة دون أي دمج.
              </span>
            </div>

            <div
              className={`p-6 sm:p-8 rounded-xl border border-neutral-800/80 text-neutral-200 font-['Amiri'] text-xl sm:text-2xl leading-[2.6] whitespace-pre-wrap break-words ${
                isNotebookLined
                  ? 'bg-neutral-950 [background-image:linear-gradient(to_bottom,transparent_39px,#1f1f1f_40px)] [background-size:100%_40px]'
                  : 'bg-neutral-950'
              }`}
            >
              {rawText || 'لا يوجد نص خام متاح.'}
            </div>
          </div>
        )}

        {/* Mode: Diff / Comparison */}
        {viewMode === 'diff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 pb-1 border-b border-neutral-800">
                <span>تنسيق الورقة الأصلي (حرفي)</span>
                <span className="text-[10px] bg-neutral-900 px-2 py-0.5 rounded text-neutral-400 font-mono">100% سطر بسطر</span>
              </div>
              <div
                className={`p-4 rounded-xl border border-neutral-800 font-['Amiri'] text-lg leading-loose text-neutral-300 whitespace-pre-wrap break-words ${
                  isNotebookLined
                    ? 'bg-neutral-950 [background-image:linear-gradient(to_bottom,transparent_35px,#1f1f1f_36px)] [background-size:100%_36px]'
                    : 'bg-neutral-950'
                }`}
              >
                {rawText}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 pb-1 border-b border-neutral-800">
                <span>النص المصحح (مرتب ومنسق)</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                  {errors.length} أخطاء مصوبة
                </span>
              </div>
              <div
                className={`p-4 rounded-xl border border-neutral-800 whitespace-pre-wrap break-words ${
                  isNotebookLined
                    ? 'bg-neutral-950 [background-image:linear-gradient(to_bottom,transparent_35px,#1f1f1f_36px)] [background-size:100%_36px]'
                    : 'bg-neutral-950'
                }`}
              >
                {renderInteractiveText(correctedHtml)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Error Tooltip / Modal Drawer */}
      {selectedError && (
        <div className="bg-neutral-950 border-t border-neutral-800 p-4 animate-slideUp">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded">
                  نوع الخطأ: {selectedError.typeName}
                </span>
                <span className="text-xs text-neutral-400">
                  في الصورة: <del className="text-rose-400 font-bold font-['Amiri'] text-base mx-1">{selectedError.originalWord}</del>
                </span>
                <span className="text-xs text-neutral-400">
                  ← التصويب: <ins className="text-emerald-400 font-bold font-['Amiri'] text-base mx-1 no-underline">{selectedError.correctedWord}</ins>
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-['Cairo']">
                <strong className="text-amber-400">القاعدة والتعليل: </strong>
                {selectedError.explanation}
              </p>
              {selectedError.sentenceContext && (
                <p className="text-[11px] text-neutral-500 font-['Amiri']">
                  السياق: "{selectedError.sentenceContext}"
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedError(null)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 text-xs cursor-pointer"
            >
              ✕ إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
