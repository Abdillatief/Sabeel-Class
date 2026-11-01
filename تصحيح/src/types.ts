export type ErrorCategory = 'spelling' | 'grammar' | 'punctuation' | 'morphology' | 'other';

export interface CorrectionError {
  id: string;
  originalWord: string;
  correctedWord: string;
  type: ErrorCategory;
  typeName: string;
  explanation: string;
  sentenceContext?: string;
}

export interface LetterTemplateCheck {
  isLetter: boolean; // هل النص رسالة (رسمية أو إخوانية) تتبع قالب الرسالة
  hasSenderReceiverBox: boolean; // مربع وبيانات المرسل والمستلم (المرسل، المرسل إليه، التاريخ/العنوان)
  hasIntroduction: boolean; // المقدمة / التحية الافتتاحية
  hasConclusion: boolean; // الخاتمة / التحية والعبارة الختامية
  missingElements: string[]; // قائمة العناصر الناقصة إن وجدت
  isTemplateComplete: boolean; // هل جميع عناصر القالب مكتملة
  deductionApplied: boolean; // هل تم تطبيق خصم (-1)
  deductionAmount: number; // مقدار الخصم (1 أو 0)
  templateNotes?: string; // تفاصيل أو تعليق إضافي حول التيمبلت
}

export interface GradingResult {
  rawTranscribedText: string;
  correctedHtmlText: string;
  correctedPlainText: string;
  actualWordCount: number;
  targetWordCount: number;
  lengthStatus: 'optimal' | 'acceptable' | 'too_short' | 'too_long';
  lengthFeedback: string;
  
  contentScore: number; // out of 10 (تقييم الأفكار والترابط)
  contentFeedback: string;
  
  errorCount: number;
  baseLanguageScore: number; // 10, 8, 6, 4
  templateDeduction: number; // 0 or 1 point deduction if any letter template element is missing
  languageScore: number; // out of 10 (baseLanguageScore - templateDeduction: 10->9, 8->7, 6->5, 4->3)
  languageScoreReason: string;
  
  letterTemplate: LetterTemplateCheck;
  
  totalScore: number; // out of 20 (contentScore + languageScore)
  ratingLabel: string; // ممتاز, جيد جداً, جيد, مقبول, يحتاج متابعة
  
  errors: CorrectionError[];
  doubleCheckVerified: boolean;
  transcriptionNotes?: string;
  analyzedAt: string;
}

export interface SampleEssay {
  id: string;
  title: string;
  description: string;
  topic: string;
  imageUrl: string;
  previewSnippet: string;
  expectedScore?: {
    content: number;
    language: number;
    wordCount: number;
  };
}

