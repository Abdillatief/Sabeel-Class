import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface CertificateParams {
  studentName: string;
  rank: string;
  competitionTitle: string;
  month: string;
  year: number;
  points: number;
  teacherName: string;
  certificateId: string;
}

export async function generateCertificatePDF(params: CertificateParams): Promise<{ pdfBlob: Blob; dataUrl: string }> {
  // Generate verification URL & QR Code
  const verifyData = `https://sabeel-class.web.app/verify/${params.certificateId}?student=${encodeURIComponent(params.studentName)}&rank=${encodeURIComponent(params.rank)}&points=${params.points}`;
  const qrDataUrl = await QRCode.toDataURL(verifyData, {
    width: 140,
    margin: 1,
    color: {
      dark: '#0369a1', // Sky-700
      light: '#ffffff'
    }
  });

  // Create an offscreen canvas with high DPI for crisp print rendering
  const width = 1600;
  const height = 1131; // A4 aspect ratio 1.414
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Background
  ctx.fillStyle = '#f0f9ff'; // sky-50
  ctx.fillRect(0, 0, width, height);

  // Subtle radial gradient in center
  const radialGradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 700);
  radialGradient.addColorStop(0, '#ffffff');
  radialGradient.addColorStop(1, '#e0f2fe'); // sky-100
  ctx.fillStyle = radialGradient;
  ctx.fillRect(30, 30, width - 60, height - 60);

  // 2. Borders
  // Outer decorative border (Baby Blue / Sky-400)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Inner thin border (Deep Sky / Sky-600)
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.strokeRect(55, 55, width - 110, height - 110);

  // Corner ornaments (geometric flourishes)
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(40, 0);
    ctx.lineTo(40, 40);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(20, 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawCorner(55, 55, 0);
  drawCorner(width - 55, 55, Math.PI / 2);
  drawCorner(width - 55, height - 55, Math.PI);
  drawCorner(55, height - 55, -Math.PI / 2);

  // 3. Header & Logo
  // Central Emblem
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(width / 2, 160, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Cairo", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⭐', width / 2, 172);

  // Academy Name
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 34px "Cairo", sans-serif';
  ctx.fillText('أكاديمية سبيل للتعليم والتفوق', width / 2, 240);

  ctx.fillStyle = '#0284c7';
  ctx.font = '600 20px "Cairo", sans-serif';
  ctx.fillText('SABEEL ACADEMY • SABEEL CLASS', width / 2, 275);

  // Certificate Title
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 48px "Cairo", sans-serif';
  ctx.fillText('شهـادة تميّـز وتقـديـر', width / 2, 360);

  // Decorative divider line under title
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, 385);
  ctx.lineTo(width / 2 + 180, 385);
  ctx.stroke();

  // Intro text
  ctx.fillStyle = '#475569';
  ctx.font = '500 24px "Cairo", sans-serif';
  ctx.fillText('يسر إدارة أكاديمية سبيل ومُعلم الحلقة أن يمنحوا بكل فخر واعتزاز هذه الشهادة إلى:', width / 2, 440);

  // Student Name
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 54px "Cairo", sans-serif';
  ctx.fillText(params.studentName, width / 2, 530);

  // Line under student name
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 260, 560);
  ctx.lineTo(width / 2 + 260, 560);
  ctx.stroke();

  // Achievement details text
  ctx.fillStyle = '#334155';
  ctx.font = '500 26px "Cairo", sans-serif';
  ctx.fillText(`نظير جهوده المباركة وتفوقه المستحق وحصوله على`, width / 2, 630);

  // Rank Badge in Certificate
  ctx.fillStyle = '#e0f2fe';
  const rankBoxW = 420;
  const rankBoxH = 65;
  const boxX = width / 2 - rankBoxW / 2;
  const boxY = 660;
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(boxX, boxY, rankBoxW, rankBoxH, 16);
  } else {
    ctx.rect(boxX, boxY, rankBoxW, rankBoxH);
  }
  ctx.fill();
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 30px "Cairo", sans-serif';
  ctx.fillText(`🏆 ${params.rank}`, width / 2, 704);

  // Competition info & points
  ctx.fillStyle = '#1e293b';
  ctx.font = '600 24px "Cairo", sans-serif';
  ctx.fillText(`في ${params.competitionTitle}`, width / 2, 775);

  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 26px "Cairo", sans-serif';
  ctx.fillText(`بمجموع نقاط: ${params.points} نقطة إنجاز`, width / 2, 820);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 20px "Cairo", sans-serif';
  ctx.fillText(`تاريخ الإصدار: شهر ${params.month} لعام ${params.year} م`, width / 2, 865);

  // Signatures & QR Code section at bottom
  const footerY = 960;

  // Right side: Teacher signature
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 22px "Cairo", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('معلم الحلقة:', width - 180, footerY);
  ctx.fillStyle = '#0284c7';
  ctx.font = '600 22px "Cairo", sans-serif';
  ctx.fillText(params.teacherName || 'معلم سبيل', width - 180, footerY + 38);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width - 180, footerY + 55);
  ctx.lineTo(width - 340, footerY + 55);
  ctx.stroke();

  // Left side: Sabeel Administration
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 22px "Cairo", sans-serif';
  ctx.fillText('إدارة أكاديمية سبيل:', 180, footerY);
  ctx.fillStyle = '#0284c7';
  ctx.font = '600 22px "Cairo", sans-serif';
  ctx.fillText('قسم شؤون الطلاب والتحفيز', 180, footerY + 38);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(180, footerY + 55);
  ctx.lineTo(340, footerY + 55);
  ctx.stroke();

  // Center bottom: QR Code
  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await new Promise((resolve) => {
    if (qrImg.complete) resolve(true);
    else qrImg.onload = () => resolve(true);
  });

  const qrSize = 105;
  const qrX = width / 2 - qrSize / 2;
  const qrY = footerY - 50;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 13px "Cairo", sans-serif';
  ctx.fillText('امسح الرمز للتحقق من صحة الشهادة', width / 2, footerY + 70);
  ctx.font = '500 11px monospace';
  ctx.fillText(`ID: ${params.certificateId.slice(0, 12)}`, width / 2, footerY + 86);

  // Convert canvas to image data
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // Create jsPDF in landscape A4 format
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  const pdfBlob = pdf.output('blob');
  return { pdfBlob, dataUrl: imgData };
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
