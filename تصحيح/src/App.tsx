import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { CorrectedTextViewer } from './components/CorrectedTextViewer';
import { RubricScoreCard } from './components/RubricScoreCard';
import { ErrorTable } from './components/ErrorTable';
import { PrintReportModal } from './components/PrintReportModal';
import { GradingResult, CorrectionError } from './types';
import { SampleEssayData } from './data/sampleEssays';
import { transcribeAndGradeImage } from './services/geminiService';
import { Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [essayTopic, setEssayTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<GradingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Recalculate Language Score based on strict rules:
  // <=5: 10, 5-9: 8, 10-19: 6, >=20: 4
  // Letter template rule: if isLetter and missing any element (المقدمة، الخاتمة، مربع المرسل والمستلم) -> deduction -1 (10->9, 8->7, 6->5, 4->3)
  const recalculateScores = (
    newErrors: CorrectionError[],
    newContentScore: number,
    updatedTemplate?: LetterTemplateCheck
  ) => {
    if (!result) return;
    const errorCount = newErrors.length;
    let baseLanguageScore = 10;
    let baseReason = `حصل على 10 درجات أساسية لأن عدد الأخطاء (${errorCount}) بحد أقصى 5 أخطاء.`;

    if (errorCount > 5 && errorCount <= 9) {
      baseLanguageScore = 8;
      baseReason = `حصل على 8 درجات أساسية لوجود (${errorCount}) أخطاء (بين 5 إلى 9 أخطاء).`;
    } else if (errorCount >= 10 && errorCount <= 19) {
      baseLanguageScore = 6;
      baseReason = `حصل على 6 درجات أساسية لوجود (${errorCount}) أخطاء (بين 10 إلى 19 خطأً).`;
    } else if (errorCount >= 20) {
      baseLanguageScore = 4;
      baseReason = `حصل على 4 درجات أساسية لوجود (${errorCount}) أخطاء (20 خطأً أو أكثر).`;
    }

    const currentTemplate = updatedTemplate || result.letterTemplate;
    const missingElements: string[] = [];
    let templateDeduction = 0;

    if (currentTemplate && currentTemplate.isLetter) {
      if (!currentTemplate.hasSenderReceiverBox) {
        missingElements.push('مربع وبيانات المرسل والمستلم');
      }
      if (!currentTemplate.hasIntroduction) {
        missingElements.push('المقدمة (التحية الافتتاحية)');
      }
      if (!currentTemplate.hasConclusion) {
        missingElements.push('الخاتمة (العبارة الختامية)');
      }

      if (missingElements.length > 0) {
        templateDeduction = 1;
      }
    }

    const languageScore = Math.max(0, baseLanguageScore - templateDeduction);

    let reason = baseReason;
    if (templateDeduction > 0) {
      reason += ` وخصمت درجة واحدة (-1) لعدم استيفاء عناصر تيمبلت الرسالة: (${missingElements.join('، ')}). وبذلك تنزل الدرجة من ${baseLanguageScore} إلى ${languageScore}.`;
    } else if (currentTemplate && currentTemplate.isLetter) {
      reason += ` والتزم الطالب بجميع عناصر تيمبلت الرسالة دون أي خصم.`;
    }

    const totalScore = Number((newContentScore + languageScore).toFixed(1));
    let ratingLabel = 'جيد';
    if (totalScore >= 18) ratingLabel = 'ممتاز 🌟';
    else if (totalScore >= 15) ratingLabel = 'جيد جداً ⭐';
    else if (totalScore >= 12) ratingLabel = 'جيد 👍';
    else if (totalScore >= 10) ratingLabel = 'مقبول';
    else ratingLabel = 'يحتاج إلى تحسين ومتابعة ⚠️';

    setResult({
      ...result,
      errors: newErrors,
      errorCount,
      contentScore: newContentScore,
      baseLanguageScore,
      templateDeduction,
      languageScore,
      languageScoreReason: reason,
      letterTemplate: {
        isLetter: currentTemplate?.isLetter ?? false,
        hasSenderReceiverBox: currentTemplate?.hasSenderReceiverBox ?? true,
        hasIntroduction: currentTemplate?.hasIntroduction ?? true,
        hasConclusion: currentTemplate?.hasConclusion ?? true,
        missingElements,
        isTemplateComplete: missingElements.length === 0,
        deductionApplied: templateDeduction > 0,
        deductionAmount: templateDeduction,
        templateNotes: currentTemplate?.templateNotes,
      },
      totalScore,
      ratingLabel,
    });
  };

  // Process image via server-side Gemini Vision OCR & Grader
  const handleProcessImage = async (base64: string, mimeType: string, sampleData?: SampleEssayData) => {
    setCurrentImage(base64);
    setImageMimeType(mimeType);
    setErrorMessage(null);

    // If pre-verified sample data is selected, we can load it instantly
    if (sampleData) {
      setResult(sampleData.sampleResult);
      return;
    }

    // Call robust service (Cloudflare Pages Function / Server / Client Fallback)
    setIsLoading(true);
    setLoadingStep('جارٍ قراءة الصورة وتفريغ كل كلمة بنسبة 100%...');

    try {
      setTimeout(() => {
        setLoadingStep('مطابقة السطور كلمة بكلمة والتأكد من عدم إسقاط أي جملة...');
      }, 2000);

      setTimeout(() => {
        setLoadingStep('رصد الأخطاء الإملائية والنحوية وتحديدها بوسم <u>...</u> وحساب الدرجات...');
      }, 4000);

      const data = await transcribeAndGradeImage({
        imageBase64: base64,
        mimeType: mimeType || 'image/jpeg',
        essayTopic: essayTopic || undefined,
      });

      setResult(data);
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMessage(
        err.message ||
          'حدث خطأ أثناء فحص الصورة وتفريغها. يرجى التأكد من مفتاح API في زر Cloudflare أو تجربة النماذج الجاهزة.'
      );
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleClear = () => {
    setCurrentImage(null);
    setResult(null);
    setErrorMessage(null);
  };

  // Add custom error by teacher
  const handleAddError = (newError: CorrectionError) => {
    if (!result) return;
    const updatedErrors = [newError, ...result.errors];
    // Also append <u> tags into HTML if not present
    let updatedHtml = result.correctedHtmlText;
    if (!updatedHtml.includes(`<u>${newError.correctedWord}</u>`)) {
      updatedHtml = updatedHtml.replace(
        new RegExp(`\\b${newError.correctedWord}\\b`, 'g'),
        `<u>${newError.correctedWord}</u>`
      );
    }
    setResult({ ...result, correctedHtmlText: updatedHtml });
    recalculateScores(updatedErrors, result.contentScore);
  };

  // Remove error by teacher
  const handleRemoveError = (errorId: string) => {
    if (!result) return;
    const updatedErrors = result.errors.filter((e) => e.id !== errorId);
    recalculateScores(updatedErrors, result.contentScore);
  };

  // Update content score manually
  const handleUpdateContentScore = (newScore: number) => {
    if (!result) return;
    recalculateScores(result.errors, newScore);
  };

  // Update letter template check manually by teacher
  const handleUpdateLetterTemplate = (updatedTemplate: LetterTemplateCheck) => {
    if (!result) return;
    recalculateScores(result.errors, result.contentScore, updatedTemplate);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-['Cairo'] selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        onPrintReport={() => setIsPrintModalOpen(true)}
        hasResult={Boolean(result)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro Banner if no image loaded */}
        {!currentImage && !result && (
          <div className="relative rounded-3xl overflow-hidden border border-neutral-800 bg-gradient-to-b from-neutral-950 via-black to-black p-6 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>النظام المعتمد للتفريغ البصري الدقيق بنسبة 100% دون أي حذف</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                تفريغ المقالات والرسائل العربية وتصحيحها وحساب الدرجات بدقة
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-['Tajawal']">
                يقوم النظام بفحص صور المقالات والرسائل المكتوبة بخط اليد سطر بسطر، وتفريغ كل كلمة حرفياً دون إسقاط أي جملة،
                ثم تمييز الكلمات المصححة بوضع خط <u className="decoration-wavy decoration-rose-500 text-amber-200 font-bold">&lt;u&gt;تحتها&lt;/u&gt;</u>،
                واحتساب درجات المحتوى (10 درجات: الأفكار والترابط)، واللغة (10 درجات: سلم الأخطاء وقالب الرسالة).
              </p>

              {/* Rubric criteria mini pill row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-neutral-300">
                <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  عدم الحذف نهائياً (تفريغ 100%)
                </span>
                <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                  وضع خط &lt;u&gt; تحت الأخطاء
                </span>
                <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  المحتوى: تقييم الأفكار والترابط (من 10)
                </span>
                <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  اللغة: سلم الأخطاء (≤5=10، 5-9=8، 10-19=6، ≥20=4)
                </span>
                <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  تيمبلت الرسالة: (-1) عند نقص أي عنصر
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Image Uploader & Options Component */}
        <ImageUploader
          onImageSelected={handleProcessImage}
          isLoading={isLoading}
          onClear={handleClear}
          currentImage={currentImage}
          essayTopic={essayTopic}
          setEssayTopic={setEssayTopic}
        />

        {/* Loading Spinner with Progress Steps */}
        {isLoading && (
          <div className="bg-neutral-950 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl animate-pulse">
            <div className="w-14 h-14 mx-auto border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h4 className="text-base font-bold text-white font-['Cairo']">
                جارٍ التحليل البصري والتفريغ الدقيق...
              </h4>
              <p className="text-xs text-amber-300 mt-1 font-mono">{loadingStep}</p>
            </div>
            <p className="text-[11px] text-neutral-500">
              يتم تطبيق الفحص المزدوج لضمان عدم تفويت أي كلمة من الصورة الأصلية
            </p>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-5 space-y-3 text-rose-200 text-sm shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <h5 className="font-bold text-rose-300 text-base">تعذر إكمال التفريغ البصري:</h5>
                <p className="text-xs text-rose-200/90 leading-relaxed font-mono bg-black/40 p-2.5 rounded-lg border border-rose-500/20">
                  {errorMessage}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-rose-500/20">
              {currentImage && (
                <button
                  onClick={() => handleProcessImage(currentImage, imageMimeType || 'image/jpeg')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all cursor-pointer shadow flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  إعادة المحاولة الآن
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-2 text-neutral-400 hover:text-white text-xs cursor-pointer rounded-lg hover:bg-neutral-800"
              >
                إغلاق التنبيه
              </button>
            </div>
          </div>
        )}

        {/* Main Dual-Pane Result View */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Score Card Banner */}
            <RubricScoreCard
              result={result}
              onUpdateContentScore={handleUpdateContentScore}
              onUpdateLetterTemplate={handleUpdateLetterTemplate}
            />

            {/* Side-by-Side Dual View: Image vs Transcribed Text */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left / Top: Original Image Document */}
              <ImageViewer
                imageUrl={currentImage || ''}
                title={essayTopic ? `صورة المقال: ${essayTopic}` : undefined}
              />

              {/* Right / Top: Corrected Arabic Text */}
              <CorrectedTextViewer
                rawText={result.rawTranscribedText}
                correctedHtml={result.correctedHtmlText}
                correctedPlain={result.correctedPlainText}
                actualWordCount={result.actualWordCount}
                errors={result.errors}
              />
            </div>

            {/* Error Table with Filtering and Editing */}
            <ErrorTable
              errors={result.errors}
              onAddError={handleAddError}
              onRemoveError={handleRemoveError}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-black py-4 mt-8 text-center text-xs text-neutral-500 font-['Tajawal']">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام سبيل البصري لتفريغ وتصحيح المقالات العربية • إصدار فائق الدقة 100%</span>
          <span className="text-[11px] text-neutral-600 font-mono">الوضع الليلي: أسود كاتم #000000</span>
        </div>
      </footer>

      {/* Printable Report Modal */}
      {result && (
        <PrintReportModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          result={result}
          essayTopic={essayTopic || 'مقال تعبير باللغة العربية'}
        />
      )}
    </div>
  );
}
