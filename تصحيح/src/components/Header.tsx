import React, { useState } from 'react';
import { BookOpen, Sparkles, HelpCircle, CheckCircle2, ShieldCheck, Moon, Sun, Printer, Cloud } from 'lucide-react';
import { CloudflareModal } from './CloudflareModal';

interface HeaderProps {
  onPrintReport?: () => void;
  hasResult?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onPrintReport, hasResult }) => {
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [showCloudflareModal, setShowCloudflareModal] = useState(false);

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/10 border border-amber-400/30">
            س
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Cairo']">
                نظام سبيل البصري لتفريغ وتصحيح المقالات
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                تفريغ 100%
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-['Tajawal'] hidden md:block">
              تفريغ فائق الدقة من الصور • تمييز الأخطاء بوسم &lt;u&gt; • تقييم المحتوى واللغة والطول
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cloudflare Pages Deployment & API Key button */}
          <button
            onClick={() => setShowCloudflareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">نشر Cloudflare وإعدادات الربط</span>
            <span className="sm:hidden">Cloudflare</span>
          </button>

          {/* Rubric guidelines button */}
          <button
            onClick={() => setShowRubricModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">معايير التقييم والدرجات</span>
            <span className="sm:hidden">المعايير</span>
          </button>

          {/* Print button if report ready */}
          {hasResult && onPrintReport && (
            <button
              onClick={onPrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة التقرير</span>
            </button>
          )}

          {/* Pure Pitch Black Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black border border-neutral-800 text-[11px] text-neutral-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>الوضع الليلي: أسود كاتم</span>
          </div>
        </div>
      </div>

      {/* Cloudflare Deployment & API Modal */}
      <CloudflareModal
        isOpen={showCloudflareModal}
        onClose={() => setShowCloudflareModal(false)}
      />

      {/* Rubric Modal */}
      {showRubricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-neutral-100 font-['Cairo']">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">معايير نظام التفريغ والتصحيح والتقييم</h3>
                  <p className="text-xs text-neutral-400">القواعد والضوابط المعتمدة في تصحيح المقالات</p>
                </div>
              </div>
              <button
                onClick={() => setShowRubricModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <h4 className="font-bold text-amber-400 flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  1. شرط التفريغ البصري 100% دون أي حذف
                </h4>
                <p className="text-xs text-neutral-300">
                  قراءة الصورة سطر بسطر وكلمة بكلمة. ممنوع تخطي أي جملة أو كلمة مهما كانت صغيرة أو في الهوامش.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <h4 className="font-bold text-rose-400 flex items-center gap-2 mb-1.5">
                  <span className="underline decoration-wavy decoration-rose-500 text-rose-300 font-mono">
                    &lt;u&gt;الكلمة&lt;/u&gt;
                  </span>
                  2. وضع خط تحت كل خطأ تم تصحيحه
                </h4>
                <p className="text-xs text-neutral-300">
                  في النص المصحح، يتم إحاطة كل كلمة تم تعديلها إملائياً أو نحوياً أو صرفياً بوسم &lt;u&gt; لتوضيح مواضع التصويب للمتعلم والمعلم.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-blue-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  3. جدول توزيع درجات المحتوى واللغة (20 درجة)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-black border border-neutral-800">
                    <span className="text-neutral-400 block font-semibold">أ. المحتوى (من 10 درجات):</span>
                    <span className="text-neutral-200">تقييم ترابط الأفكار، التسلسل، سلامة الاستدلال والأسلوب التعبيري.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black border border-neutral-800 space-y-1">
                    <span className="text-neutral-400 block font-semibold">ب. اللغة (من 10 درجات):</span>
                    <ul className="text-neutral-300 space-y-1 font-mono text-[11px]">
                      <li className="flex justify-between text-emerald-400">
                        <span>• بحد أقصى 5 أخطاء:</span>
                        <span className="font-bold">10 درجات</span>
                      </li>
                      <li className="flex justify-between text-amber-400">
                        <span>• من 5 إلى 9 أخطاء:</span>
                        <span className="font-bold">8 درجات</span>
                      </li>
                      <li className="flex justify-between text-orange-400">
                        <span>• من 10 إلى 19 خطأً:</span>
                        <span className="font-bold">6 درجات</span>
                      </li>
                      <li className="flex justify-between text-rose-400">
                        <span>• 20 خطأً أو أكثر:</span>
                        <span className="font-bold">4 درجات</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                <h4 className="font-bold text-purple-400 flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  4. شرط الطول المستهدف
                </h4>
                <p className="text-xs text-neutral-300">
                  الطول المطلوب في حدود <strong className="text-white">150 كلمة</strong>. يقوم النظام بحساب العدد الفعلي للكلمات وتوضيح نسبة الالتزام بالطول المطلوب.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRubricModal(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                فهمت المعايير
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
