import React from 'react';
import { Award, BookOpen, AlertTriangle, CheckCircle, Scale, ShieldCheck, Mail, CheckCircle2, XCircle, Info } from 'lucide-react';
import { GradingResult, LetterTemplateCheck } from '../types';

interface RubricScoreCardProps {
  result: GradingResult;
  onUpdateContentScore?: (newScore: number) => void;
  onUpdateLetterTemplate?: (updatedTemplate: LetterTemplateCheck) => void;
}

export const RubricScoreCard: React.FC<RubricScoreCardProps> = ({
  result,
  onUpdateContentScore,
  onUpdateLetterTemplate,
}) => {
  const {
    contentScore,
    contentFeedback,
    errorCount,
    baseLanguageScore = 10,
    templateDeduction = 0,
    languageScore,
    languageScoreReason,
    letterTemplate,
    actualWordCount,
    targetWordCount,
    lengthStatus,
    lengthFeedback,
    totalScore,
    ratingLabel,
    doubleCheckVerified,
    transcriptionNotes,
  } = result;

  // Toggle letter template element
  const handleToggleElement = (elementKey: 'hasSenderReceiverBox' | 'hasIntroduction' | 'hasConclusion') => {
    if (!onUpdateLetterTemplate || !letterTemplate) return;
    const updated = {
      ...letterTemplate,
      [elementKey]: !letterTemplate[elementKey],
    };
    onUpdateLetterTemplate(updated);
  };

  const handleToggleIsLetter = () => {
    if (!onUpdateLetterTemplate || !letterTemplate) return;
    const updated = {
      ...letterTemplate,
      isLetter: !letterTemplate.isLetter,
    };
    onUpdateLetterTemplate(updated);
  };

  // Brackets data for visual gauge
  const brackets = [
    {
      label: 'بحد أقصى 5 أخطاء',
      range: '0 - 5',
      baseScore: 10,
      withPenalty: 9,
      active: errorCount <= 5,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
    },
    {
      label: 'من 5 إلى 9 أخطاء',
      range: '5 - 9',
      baseScore: 8,
      withPenalty: 7,
      active: errorCount > 5 && errorCount <= 9,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
    },
    {
      label: 'من 10 إلى 19 خطأً',
      range: '10 - 19',
      baseScore: 6,
      withPenalty: 5,
      active: errorCount >= 10 && errorCount <= 19,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/40',
    },
    {
      label: '20 خطأً أو أكثر',
      range: '20+',
      baseScore: 4,
      withPenalty: 3,
      active: errorCount >= 20,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/40',
    },
  ];

  const hasMissingTemplate = letterTemplate?.isLetter && (
    !letterTemplate.hasSenderReceiverBox ||
    !letterTemplate.hasIntroduction ||
    !letterTemplate.hasConclusion
  );

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Banner: Total Score & Rating */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-black border border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-semibold">الدرجة الكلية المعتمدة:</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                {ratingLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">{totalScore}</span>
              <span className="text-sm font-semibold text-neutral-400 font-mono">/ 20 درجة</span>
            </div>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
          <div className="text-center px-3 py-2 rounded-xl bg-black border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">المحتوى والأفكار</span>
            <span className="text-base font-bold text-amber-400 font-mono">{contentScore} / 10</span>
          </div>
          <div className="text-center px-3 py-2 rounded-xl bg-black border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">سلامة اللغة</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {languageScore} / 10
              {templateDeduction > 0 && (
                <span className="text-[10px] text-rose-400 font-normal mr-1">(-1 تيمبلت)</span>
              )}
            </span>
          </div>
          <div className="text-center px-3 py-2 rounded-xl bg-black border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">عدد الكلمات</span>
            <span className="text-base font-bold text-blue-400 font-mono">{actualWordCount} كلمة</span>
          </div>
        </div>
      </div>

      {/* Main Rubric Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: المحتوى (من 10) */}
        <div className="p-4 rounded-xl bg-black border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white font-['Cairo']">أولاً: تقييم المحتوى (من 10)</h4>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {contentScore} من 10 درجات
            </span>
          </div>
          
          <div className="text-xs text-neutral-400">
            معيار: <strong className="text-neutral-200">تقييم الأفكار والترابط</strong>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed font-['Cairo']">
            {contentFeedback}
          </p>

          {/* Teacher adjust score slider if needed */}
          {onUpdateContentScore && (
            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
              <span>تعديل درجة المحتوى يدوياً:</span>
              <div className="flex items-center gap-1">
                {[6, 7, 8, 8.5, 9, 9.5, 10].map((val) => (
                  <button
                    key={val}
                    onClick={() => onUpdateContentScore(val)}
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] cursor-pointer transition ${
                      contentScore === val
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: اللغة (من 10) */}
        <div className="p-4 rounded-xl bg-black border border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white font-['Cairo']">ثانياً: تقييم اللغة (من 10)</h4>
            </div>
            <div className="flex items-center gap-1.5">
              {templateDeduction > 0 && (
                <span className="text-[10px] text-rose-400 line-through font-mono">
                  {baseLanguageScore}
                </span>
              )}
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {languageScore} من 10 درجات
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {languageScoreReason}
          </p>

          {/* Strict Rubric Tier Visualization */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold">
              <span>شرائح تقييم اللغة حسب عدد الأخطاء:</span>
              {templateDeduction > 0 && (
                <span className="text-rose-400">مطبق خصم (-1) لنقص قالب الرسالة</span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              {brackets.map((b, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    b.active
                      ? `${b.color} ring-1 ring-amber-500/40 shadow-sm font-bold scale-[1.02]`
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-500 opacity-60'
                  }`}
                >
                  <div className="text-[10px] truncate">{b.label}</div>
                  <div className="font-mono text-xs mt-0.5">
                    {hasMissingTemplate ? (
                      <span>
                        <span className="text-neutral-500 line-through text-[10px] ml-1">{b.baseScore}</span>
                        <span className="text-rose-400 font-bold">{b.withPenalty}</span>
                      </span>
                    ) : (
                      `${b.baseScore} درجات`
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: ملحوظة وقالب الرسالة (Letter Template Check) */}
      <div className="p-4 rounded-xl bg-black border border-neutral-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white font-['Cairo']">
              ملحوظة تيمبلت وقالب الرسالة
            </h4>
            <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              المقدمة • الخاتمة • مربع المرسل والمستلم
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleIsLetter}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                letterTemplate?.isLetter
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              <span>{letterTemplate?.isLetter ? '✓ فحص قالب الرسالة مفعّل' : 'تفعيل فحص قالب الرسالة'}</span>
            </button>
          </div>
        </div>

        {/* Explanation text per user instructions */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300">قاعدة تيمبلت الرسالة:</strong> إذا كان النص رسالة ولم يكتب الطالب أي عنصر من عناصر التيمبلت (المقدمة، الخاتمة، مربع المرسل والمستلم)، ينزل درجة واحدة (-1) من درجة اللغة (الـ 10 تنزل لـ 9، والـ 8 تنزل لـ 7، والـ 6 تنزل لـ 5، والـ 4 تنزل لـ 3).
          </p>
        </div>

        {/* 3 Interactive Template Checkboxes */}
        {letterTemplate?.isLetter ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Component 1: مربع المرسل والمستلم */}
            <div
              onClick={() => handleToggleElement('hasSenderReceiverBox')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                letterTemplate.hasSenderReceiverBox
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">1. مربع المرسل والمستلم</span>
                <span className="text-[10px] opacity-80 block">المرسل إليه، المرسل، التاريخ</span>
              </div>
              {letterTemplate.hasSenderReceiverBox ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </div>

            {/* Component 2: المقدمة */}
            <div
              onClick={() => handleToggleElement('hasIntroduction')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                letterTemplate.hasIntroduction
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">2. المقدمة</span>
                <span className="text-[10px] opacity-80 block">التحية الافتتاحية والتمهيد</span>
              </div>
              {letterTemplate.hasIntroduction ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </div>

            {/* Component 3: الخاتمة */}
            <div
              onClick={() => handleToggleElement('hasConclusion')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                letterTemplate.hasConclusion
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold block">3. الخاتمة</span>
                <span className="text-[10px] opacity-80 block">التحية والعبارة الختامية</span>
              </div>
              {letterTemplate.hasConclusion ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic">
            النص الحالي مقيم كمقال تعبيري عام. إذا كان المطلوب رسالة، اضغط على زر "تفعيل فحص قالب الرسالة" بالأعلى.
          </p>
        )}
      </div>

      {/* Section 4: شرط الطول وعدد الكلمات & المراجعة المزدوجة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Word count condition */}
        <div className="p-4 rounded-xl bg-black border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-xs font-bold text-neutral-300 font-['Cairo']">
              ثالثاً: شرط الطول (في حدود 150 كلمة)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                lengthStatus === 'optimal'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {actualWordCount} كلمة فعلية
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {lengthFeedback}
          </p>
          <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                lengthStatus === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (actualWordCount / 150) * 100)}%` }}
            />
          </div>
        </div>

        {/* Double-check verification */}
        <div className="p-4 rounded-xl bg-black border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-xs font-bold text-neutral-300 font-['Cairo']">
              رابعاً: المراجعة المزدوجة والمطابقة البصرية
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              تفريغ 100% مؤكد
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            تمت قراءة الصورة سطر بسطر ومطابقة كل كلمة حرفياً من البداية حتى النهاية دون إسقاط أي كلمة أو جملة في الهوامش أو الأطراف.
          </p>
          {transcriptionNotes && (
            <p className="text-[11px] text-neutral-500 font-mono">
              ملاحظة النظام: {transcriptionNotes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

