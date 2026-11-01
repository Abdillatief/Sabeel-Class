import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with large limit for image base64 data
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to calculate language score strictly per user rules:
// - 10 درجات: بحد أقصى 5 أخطاء
// - 8 درجات: من 5 إلى 9 أخطاء
// - 6 درجات: من 10 إلى 19 خطأً
// - 4 درجات: 20 خطأً أو أكثر
// Helper to calculate language score strictly per user rules:
// - 10 درجات: بحد أقصى 5 أخطاء
// - 8 درجات: من 5 إلى 9 أخطاء
// - 6 درجات: من 10 إلى 19 خطأً
// - 4 درجات: 20 خطأً أو أكثر
// ملحوظة: قالب وتيمبلت الرسالة (المقدمة، الخاتمة، مربع المرسل والمستلم)
// إذا لم يكتب الطالب أي منها ينزل من 10 لـ 9، ومن 8 لـ 7، ومن 6 لـ 5، ومن 4 لـ 3 (-1 درجة)
function calculateLanguageScore(
  errorCount: number,
  letterCheck?: {
    isLetter: boolean;
    hasSenderReceiverBox: boolean;
    hasIntroduction: boolean;
    hasConclusion: boolean;
  }
): {
  baseScore: number;
  deduction: number;
  finalScore: number;
  reason: string;
  missingElements: string[];
} {
  let baseScore = 10;
  let errorBracketReason = '';

  if (errorCount <= 5) {
    baseScore = 10;
    errorBracketReason = `حصل على 10 درجات أساسية لأن عدد الأخطاء (${errorCount}) بحد أقصى 5 أخطاء.`;
  } else if (errorCount <= 9) {
    baseScore = 8;
    errorBracketReason = `حصل على 8 درجات أساسية لوجود (${errorCount}) أخطاء (بين 5 إلى 9 أخطاء).`;
  } else if (errorCount <= 19) {
    baseScore = 6;
    errorBracketReason = `حصل على 6 درجات أساسية لوجود (${errorCount}) أخطاء (بين 10 إلى 19 خطأً).`;
  } else {
    baseScore = 4;
    errorBracketReason = `حصل على 4 درجات أساسية لوجود (${errorCount}) أخطاء (20 خطأً أو أكثر).`;
  }

  const missingElements: string[] = [];
  let deduction = 0;

  if (letterCheck && letterCheck.isLetter) {
    if (!letterCheck.hasSenderReceiverBox) {
      missingElements.push('مربع وبيانات المرسل والمستلم');
    }
    if (!letterCheck.hasIntroduction) {
      missingElements.push('المقدمة (التحية الافتتاحية)');
    }
    if (!letterCheck.hasConclusion) {
      missingElements.push('الخاتمة (العبارة الختامية)');
    }

    if (missingElements.length > 0) {
      deduction = 1;
    }
  }

  const finalScore = Math.max(0, baseScore - deduction);

  let reason = errorBracketReason;
  if (deduction > 0) {
    reason += ` وخصمت درجة واحدة (-1) لعدم كتابة عناصر تيمبلت الرسالة: (${missingElements.join('، ')}). وبذلك تنزل الدرجة من ${baseScore} إلى ${finalScore}.`;
  } else if (letterCheck && letterCheck.isLetter) {
    reason += ` والتزم الطالب بكامل عناصر تيمبلت الرسالة (المقدمة، الخاتمة، مربع المرسل والمستلم) دون أي خصم.`;
  }

  return {
    baseScore,
    deduction,
    finalScore,
    reason,
    missingElements,
  };
}

function calculateLengthEvaluation(wordCount: number, target: number = 150) {
  const diff = wordCount - target;
  if (Math.abs(diff) <= 20) {
    return {
      status: 'optimal' as const,
      feedback: `طول ممتاز (${wordCount} كلمة)، يلتزم تماماً بالحد المطلوب (~150 كلمة).`,
    };
  } else if (Math.abs(diff) <= 40) {
    return {
      status: 'acceptable' as const,
      feedback: `طول مقبول (${wordCount} كلمة)، قريب من الحد المطلوب (~150 كلمة).`,
    };
  } else if (diff < -40) {
    return {
      status: 'too_short' as const,
      feedback: `النص قصير نسبياً (${wordCount} كلمة)، المطلوب في حدود 150 كلمة (نقص ${Math.abs(diff)} كلمة).`,
    };
  } else {
    return {
      status: 'too_long' as const,
      feedback: `النص أطول من المطلوب (${wordCount} كلمة)، المطلوب في حدود 150 كلمة (زيادة ${diff} كلمة).`,
    };
  }
}

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API: Transcribe and Grade Arabic Essay Image
app.post('/api/transcribe-and-grade', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', essayTopic } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'لم يتم إرسال الصورة (imageBase64 مطلوب)' });
    }

    const effectiveApiKey =
      (req.headers['x-gemini-api-key'] as string) ||
      (req.body.apiKey as string) ||
      process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return res.status(500).json({
        error: 'مفتاح Gemini API غير مهيأ. يرجى إدخال المفتاح في زر إعدادات Cloudflare بالأعلى أو ضبط متغير البيئة GEMINI_API_KEY.',
      });
    }

    const aiClient = new GoogleGenAI({
      apiKey: effectiveApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Clean base64 string
    const cleanBase64 = imageBase64.includes(';base64,')
      ? imageBase64.split(';base64,')[1]
      : imageBase64;

    const systemPrompt = `أنت نظام بصري فائق الدقة ومتخصص في تفريغ وتصحيح وتقييم المقالات والنصوص والرسائل العربية المكتوبة بخط اليد أو المطبوعة من الصور.

مهمتك الأساسية والحرجة:
تفريغ **كل كلمة** موجودة في الصورة حرفياً ودون حذف أي كلمة مهما كانت صغيرة أو في الهوامش أو الأطراف، مع المحافظة الدقيقة على التنسيق المكاني والترتيب الأصلي لأسطر وفقرات الورقة.

التعليمات الصارمة الإلزامية:
1. **المحافظة التامة على تنسيق وترتيب الورقة سطر بسطر (ممنوع منعاً باتاً دمج النص في قطعة واحدة):**
   - أعد كتابة النص بنفس ترتيب وأسطر الورقة الأصلية سطر بسطر تماماً كما هو مكتوب في الصورة.
   - افصل بين الأسطر بنزول سطر جديد (\\n) بدقة متناهية.
   - افصل بين الفقرات المستقلة بسطر فارغ (\\n\\n).
   - إذا وجد عنوان، أو بسملة، أو مربع وبيانات مرسل ومستلم، أو تحية افتتاحية، اجعل كلاً منها في سطر منفصل مستقل في موضعه تماماً كما بالورقة.
   - إذا وجدت أبيات شعرية أو شواهد، ضع كل بيت أو شطر في سطر مستقل.
   - إذا وجدت خاتمة، أو عبارة ختامية، أو توقيع، أو اسم الطالب/الصف، ضعها في أسطرها المستقلة في النهاية كما هي بالورقة.
   - يُمنع منعاً باتاً دمج الأسطر أو جعل النص كتلة واحدة متصلة.
2. **عدم الحذف نهائياً (تفريغ 100%):** اقرأ الصورة سطر بسطر وكلمة بكلمة من البداية حتى النهاية. ممنوع إسقاط أي حرف أو كلمة أو جملة.
3. **وضع خط تحت الأخطاء:** في النص المصحح النهائي، ضع خطاً حول كل كلمة بها خطأ إملائي أو نحوي أو صرفي تم تصحيحه باستخدام وسم HTML: <u>الكلمة_المصححة</u>، مع الحفاظ الكامل على فواصل الأسطر والفقرات.
   - مثال: إذا كتب الطالب "هاذا" وصححتها إلى "هذا"، يظهر في النص المصحح: <u>هذا</u>
   - مثال: إذا كتب "ان العلم نورن" وصححتها إلى "إن العلم نورٌ"، يظهر: <u>إن</u> العلم <u>نورٌ</u>
4. **المراجعة المزدوجة والمطابقة:** قارن النص المفرغ بالصورة الأصلية كلمة بكلمة لضمان اكتمال النص 100% ومطابقة أسطره.
5. **معايير التقييم والدرجات الدقيقة:**
   - **المحتوى (من 10):** تقييم الأفكار والترابط، عمق الطرح وتسلسل المعاني.
   - **اللغة (من 10):**
     * 10 درجات: بحد أقصى 5 أخطاء (≤ 5 أخطاء).
     * 8 درجات: من 5 إلى 9 أخطاء.
     * 6 درجات: من 10 إلى 19 خطأً.
     * 4 درجات: 20 خطأً أو أكثر.
   - **قالب وتيمبلت الرسالة (شرط إلزامي للرسائل):**
     * إذا كان النص رسالة، يجب التحقق من عناصر التيمبلت الثلاثة (المقدمة، الخاتمة، مربع المرسل والمستلم).
     * إذا لم يكتب الطالب أي عنصر منها، ينزل درجة واحدة (-1) من درجة اللغة (10 تنزل لـ 9، و8 تنزل لـ 7، و6 تنزل لـ 5، و4 تنزل إلى 3).
   - رصد الأخطاء بدقة كاملة: استخرج كل خطأ مع الكلمة الأصلية، الكلمة المصححة، النوع، والتعليل النحوي/الإملائي.
   - حساب عدد الكلمات الفعلي بدقة (شرط الطول في حدود 150 كلمة).

قم بإرجاع النتيجة بصيغة JSON حصراً وفق المخطط المطلوب.`;

    const userPrompt = `يرجى فحص هذه الصورة بعناية وتفريغ نص المقال/الرسالة العربي بنسبة 100% مع المحافظة الصارمة على تنسيق وترتيب أسطر وفقرات الورقة سطر بسطر دون دمجها في قطعة واحدة، مع وضع خط <u>الكلمة</u> تحت الكلمات المعدلة، والتحقق من عناصر تيمبلت الرسالة وحساب الدرجات بدقة.
${essayTopic ? `موضوع النص المحتمل: ${essayTopic}` : ''}`;

    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];

    let lastError: any = null;
    let responseText = '';

    for (const modelName of candidateModels) {
      try {
        console.log(`[OCR Server] Trying model: ${modelName}`);
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: cleanBase64,
                },
              },
              { text: userPrompt },
            ],
          },
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                rawTranscribedText: {
                  type: Type.STRING,
                  description: 'التفريغ الحرفي الأولي للنص سطر بسطر مع فواصل \\n بنفس ترتيب وتنسيق الورقة دون أي دمج في قطعة واحدة.',
                },
                correctedHtmlText: {
                  type: Type.STRING,
                  description: 'النص الكامل المصحح سطر بسطر مع فواصل \\n و <u>الكلمة</u> بنفس تنسيق وترتيب الورقة.',
                },
                correctedPlainText: {
                  type: Type.STRING,
                  description: 'النص الكامل المصحح بدون وسوم HTML مع فواصل الأسطر والفقرات الأصلية.',
                },
                actualWordCount: {
                  type: Type.INTEGER,
                  description: 'العدد الفعلي لكلمات النص.',
                },
                contentScore: {
                  type: Type.NUMBER,
                  description: 'درجة المحتوى من 10 (تقييم الأفكار والترابط).',
                },
                contentFeedback: {
                  type: Type.STRING,
                  description: 'شرح تحليلي وتقييم موضوعي للمحتوى وترابط الأفكار من 10.',
                },
                letterTemplate: {
                  type: Type.OBJECT,
                  description: 'التحقق من قالب وتيمبلت الرسالة وعناصره (المقدمة، الخاتمة، مربع المرسل والمستلم).',
                  properties: {
                    isLetter: { type: Type.BOOLEAN, description: 'هل النص رسالة' },
                    hasSenderReceiverBox: { type: Type.BOOLEAN, description: 'هل كُتب مربع وبيانات المرسل والمستلم' },
                    hasIntroduction: { type: Type.BOOLEAN, description: 'هل كُتبت المقدمة/التحية الافتتاحية' },
                    hasConclusion: { type: Type.BOOLEAN, description: 'هل كُتبت الخاتمة/العبارة الختامية' },
                    missingElements: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'قائمة بالعناصر الناقصة من قالب الرسالة إن وجدت',
                    },
                    templateNotes: { type: Type.STRING, description: 'ملاحظات حول استيفاء قالب الرسالة' },
                  },
                },
                errors: {
                  type: Type.ARRAY,
                  description: 'قائمة بجميع الكلمات التي تم تعديلها أو تصحيحها مع بيان السبب.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      originalWord: { type: Type.STRING, description: 'الكلمة الخاطئة كما ظهرت في الصورة' },
                      correctedWord: { type: Type.STRING, description: 'الكلمة المصححة' },
                      type: {
                        type: Type.STRING,
                        description: 'نوع الخطأ: spelling أو grammar أو punctuation أو morphology أو other',
                      },
                      typeName: { type: Type.STRING, description: 'اسم نوع الخطأ بالعربية (إملائي، نحوي، صرفي، ترقيم)' },
                      explanation: { type: Type.STRING, description: 'التعليل النحوي أو الإملائي للتصحيح' },
                      sentenceContext: { type: Type.STRING, description: 'الجملة أو السياق التي وردت فيها' },
                    },
                    required: ['originalWord', 'correctedWord', 'type', 'typeName', 'explanation'],
                  },
                },
                doubleCheckVerified: {
                  type: Type.BOOLEAN,
                  description: 'تمت المراجعة المزدوجة والتأكد من عدم تفويت أي كلمة من الصورة.',
                },
                transcriptionNotes: {
                  type: Type.STRING,
                  description: 'ملاحظات حول جودة الخط في الصورة ووضوح الكلمات.',
                },
              },
              required: [
                'rawTranscribedText',
                'correctedHtmlText',
                'correctedPlainText',
                'actualWordCount',
                'contentScore',
                'contentFeedback',
                'errors',
                'doubleCheckVerified',
              ],
            },
          },
        });

        responseText = response.text || '{}';
        if (responseText) {
          console.log(`[OCR Server] Successfully transcribed using ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[OCR Server] Model ${modelName} failed, falling back...`, err.message || err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('تعذر تفريغ الصورة عبر نماذج الذكاء الاصطناعي المتاحة.');
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const clean = responseText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      parsedData = JSON.parse(clean);
    }

    const errorsList = Array.isArray(parsedData.errors) ? parsedData.errors : [];
    const errorCount = errorsList.length;

    const letterInfo = parsedData.letterTemplate || {};
    const isLetter = Boolean(
      letterInfo.isLetter ||
      (essayTopic && (essayTopic.includes('رسالة') || essayTopic.includes('خطاب')))
    );

    const letterCheck = {
      isLetter,
      hasSenderReceiverBox: Boolean(letterInfo.hasSenderReceiverBox ?? true),
      hasIntroduction: Boolean(letterInfo.hasIntroduction ?? true),
      hasConclusion: Boolean(letterInfo.hasConclusion ?? true),
    };

    // Strict user rubric computation
    const langEvaluation = calculateLanguageScore(errorCount, letterCheck);

    // Calculate actual words from text if missing or verify
    const plainText = parsedData.correctedPlainText || '';
    const countedWords = plainText
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;
    const finalWordCount = parsedData.actualWordCount || countedWords || 0;

    const lengthEval = calculateLengthEvaluation(finalWordCount, 150);

    const safeContentScore = Math.min(10, Math.max(0, Number(parsedData.contentScore) || 8));
    const totalScore = Number((safeContentScore + langEvaluation.finalScore).toFixed(1));

    let ratingLabel = 'جيد';
    if (totalScore >= 18) ratingLabel = 'ممتاز 🌟';
    else if (totalScore >= 15) ratingLabel = 'جيد جداً ⭐';
    else if (totalScore >= 12) ratingLabel = 'جيد 👍';
    else if (totalScore >= 10) ratingLabel = 'مقبول';
    else ratingLabel = 'يحتاج إلى تحسين ومتابعة ⚠️';

    const result = {
      rawTranscribedText: parsedData.rawTranscribedText || '',
      correctedHtmlText: parsedData.correctedHtmlText || '',
      correctedPlainText: plainText,
      actualWordCount: finalWordCount,
      targetWordCount: 150,
      lengthStatus: lengthEval.status,
      lengthFeedback: lengthEval.feedback,
      contentScore: safeContentScore,
      contentFeedback: parsedData.contentFeedback || 'تم تقييم الأفكار والترابط بناءً على بنية النص.',
      errorCount,
      baseLanguageScore: langEvaluation.baseScore,
      templateDeduction: langEvaluation.deduction,
      languageScore: langEvaluation.finalScore,
      languageScoreReason: langEvaluation.reason,
      letterTemplate: {
        isLetter: letterCheck.isLetter,
        hasSenderReceiverBox: letterCheck.hasSenderReceiverBox,
        hasIntroduction: letterCheck.hasIntroduction,
        hasConclusion: letterCheck.hasConclusion,
        missingElements: langEvaluation.missingElements,
        isTemplateComplete: langEvaluation.missingElements.length === 0,
        deductionApplied: langEvaluation.deduction > 0,
        deductionAmount: langEvaluation.deduction,
        templateNotes: letterInfo.templateNotes || (isLetter ? (langEvaluation.deduction > 0 ? 'يوجد نقص في عناصر قالب الرسالة المطلوب.' : 'قالب الرسالة مكتمل ومستوفٍ لكافة الشروط.') : 'النص مقال تعبير عام ولا يخضع لتيمبلت الرسالة.'),
      },
      totalScore,
      ratingLabel,
      errors: errorsList.map((err: any, idx: number) => ({
        id: `err-${idx + 1}`,
        originalWord: err.originalWord || '',
        correctedWord: err.correctedWord || '',
        type: err.type || 'spelling',
        typeName: err.typeName || 'إملائي',
        explanation: err.explanation || '',
        sentenceContext: err.sentenceContext || '',
      })),
      doubleCheckVerified: Boolean(parsedData.doubleCheckVerified ?? true),
      transcriptionNotes: parsedData.transcriptionNotes || 'تمت مطابقة النص بالصورة بالكامل.',
      analyzedAt: new Date().toISOString(),
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/transcribe-and-grade:', error);
    res.status(500).json({
      error: 'فشلت عملية التفريغ والتقييم البصري',
      details: error.message || String(error),
    });
  }
});

// Setup Vite in Dev or Static in Production
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
