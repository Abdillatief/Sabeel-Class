import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  Sparkles,
  QrCode,
  CheckCircle2,
  FileCheck,
  Eye,
  Loader2
} from 'lucide-react';
import { Student, Competition, CertificateItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { generateCertificatePDF, downloadPDF } from '../../services/pdf';
import { saveCertificateRecord, getCertificatesList } from '../../services/db';

interface CertificatesViewProps {
  students: Student[];
  competition: Competition;
  preselectedStudent?: Student | null;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  students,
  competition,
  preselectedStudent
}) => {
  const { profile } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudent?.id || students[0]?.id || ''
  );
  const [rank, setRank] = useState('المركز الأول في الحلقة');
  const [competitionTitle, setCompetitionTitle] = useState(competition.title);
  const [issuedList, setIssuedList] = useState<CertificateItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [activePdfBlob, setActivePdfBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (preselectedStudent) {
      setSelectedStudentId(preselectedStudent.id);
    } else if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [preselectedStudent, students]);

  useEffect(() => {
    getCertificatesList().then(setIssuedList);
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Generate certificate on change or click
  const handleGeneratePreview = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    try {
      const certId = 'cert_' + Math.random().toString(36).substring(2, 10);
      const res = await generateCertificatePDF({
        studentName: selectedStudent.name,
        rank,
        competitionTitle,
        month: competition.month,
        year: competition.year,
        points: selectedStudent.totalPoints,
        teacherName: profile?.name || 'معلم سبيل',
        certificateId: certId,
      });

      setPreviewDataUrl(res.dataUrl);
      setActivePdfBlob(res.pdfBlob);
    } catch (err) {
      console.error('Certificate generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      handleGeneratePreview();
    }
  }, [selectedStudentId, rank, competitionTitle]);

  const handleDownload = async () => {
    if (!selectedStudent) return;
    setIsGenerating(true);
    try {
      let blob = activePdfBlob;
      const certId = 'cert_' + Math.random().toString(36).substring(2, 10);
      
      if (!blob) {
        const res = await generateCertificatePDF({
          studentName: selectedStudent.name,
          rank,
          competitionTitle,
          month: competition.month,
          year: competition.year,
          points: selectedStudent.totalPoints,
          teacherName: profile?.name || 'معلم سبيل',
          certificateId: certId,
        });
        blob = res.pdfBlob;
      }

      // Save to database
      const record = await saveCertificateRecord({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        rank,
        month: competition.month,
        year: competition.year,
        points: selectedStudent.totalPoints,
        createdAt: new Date().toISOString()
      });

      setIssuedList((prev) => [record, ...prev]);

      // Download file
      const filename = `شهادة_سبيل_${selectedStudent.name.replace(/\s+/g, '_')}_${competition.month}.pdf`;
      downloadPDF(blob, filename);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
              إصدار شهادات التفوق الرسمية
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              شهادات تقدير بتصميم وهوية أكاديمية سبيل مع رمز التحقق QR Code
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={!selectedStudent || isGenerating}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-sky-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري المعالجة...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>تحميل شهادة PDF</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Certificate Configuration Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h2 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>بيانات الشهادة</span>
          </h2>

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اختر الطالب:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none transition-colors"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.totalPoints} نقطة)
                </option>
              ))}
            </select>
          </div>

          {/* Rank Title Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              المركز أو درجة التكريم:
            </label>
            <input
              type="text"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              placeholder="مثال: المركز الأول في الحلقة"
              className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none transition-colors"
            />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {[
                'المركز الأول في الحلقة',
                'المركز الثاني في الحلقة',
                'المركز الثالث في الحلقة',
                'وسام التميز والتفوق',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRank(opt)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300 font-semibold hover:bg-sky-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Competition Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم المسابقة:
            </label>
            <input
              type="text"
              value={competitionTitle}
              onChange={(e) => setCompetitionTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/40 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          {/* Month & Year Info */}
          <div className="p-3 bg-sky-50/50 dark:bg-slate-800/60 rounded-2xl border border-sky-100 dark:border-slate-750 text-xs space-y-1 transition-colors">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>الفترة:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                شهر {competition.month} {competition.year}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>مجموع نقاط الطالب:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {selectedStudent?.totalPoints || 0} نقطة
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>معلم الحلقة:</span>
              <span className="font-bold text-sky-700 dark:text-sky-300">
                {profile?.name}
              </span>
            </div>
          </div>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            disabled={!selectedStudent || isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل الشهادة وطباعتها</span>
          </button>
        </div>

        {/* Certificate Visual Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-500" />
                <span>معاينة شهادة الطالب المعتمدة</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                مقاس A4 أفقي بجودة طباعة فائقة
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-sky-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-950 flex items-center justify-center aspect-[1.414/1]">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                  <span>جاري رسم الشهادة وتوليد QR Code...</span>
                </div>
              ) : previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Certificate Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-slate-400">
                  اختر طالباً للمعاينة
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Previously Issued Certificates */}
      {issuedList.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs transition-colors">
          <h3 className="font-black text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-500" />
            <span>سجل الشهادات الصادرة مؤخراً ({issuedList.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {issuedList.map((cert) => (
              <div
                key={cert.id}
                className="p-3.5 rounded-2xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-800 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{cert.studentName || 'طالب متميز'}</h4>
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">{cert.rank}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    شهر {cert.month} {cert.year} • {cert.points} نقطة
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
