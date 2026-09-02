import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  User,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Palette,
  RefreshCw
} from 'lucide-react';
import { AnimeAvatarSelector } from './AnimeAvatarSelector';
import { uploadStudentPhoto, uploadStudentPhotoDataUrl } from '../../services/storage';
import { convertPhotoToCartoon } from '../../services/cartoonService';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (studentData: {
    name: string;
    photoUrl?: string;
    cartoonPhotoUrl?: string;
    useCartoonAvatar?: boolean;
    photo?: string;
    avatar?: string;
  }) => Promise<void>;
  teacherId: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  teacherId
}) => {
  const [name, setName] = useState('');
  const [avatarMode, setAvatarMode] = useState<'islamic' | 'photo'>('islamic');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('islamic_1');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [cartoonPreview, setCartoonPreview] = useState<string | null>(null);
  const [wantsCartoon, setWantsCartoon] = useState<boolean | null>(null);
  const [isProcessingCartoon, setIsProcessingCartoon] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'cartoon' | 'original'>('cartoon');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessCartoon = async (dataUrl: string) => {
    setIsProcessingCartoon(true);
    setErrorMsg(null);
    try {
      const result = await convertPhotoToCartoon(dataUrl, {
        style: 'sabeel_cartoon',
        outputSize: 500
      });
      setCartoonPreview(result.cartoonUrl);
      setWantsCartoon(true);
      setActivePreviewTab('cartoon');
    } catch (err: any) {
      console.error('Failed to cartoonize image:', err);
      setErrorMsg('تعذر تحويل الصورة إلى كرتون، تم الاحتفاظ بالصورة الأصلية.');
      setWantsCartoon(false);
      setActivePreviewTab('original');
    } finally {
      setIsProcessingCartoon(false);
    }
  };

  const processSelectedFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت.');
      return;
    }
    setErrorMsg(null);
    setPhotoFile(file);
    setCartoonPreview(null);
    setWantsCartoon(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setOriginalPreview(dataUrl);
      setActivePreviewTab('original');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleSelectCartoonOption = (choice: boolean) => {
    setWantsCartoon(choice);
    if (choice) {
      if (originalPreview && !cartoonPreview) {
        handleProcessCartoon(originalPreview);
      } else {
        setActivePreviewTab('cartoon');
      }
    } else {
      setActivePreviewTab('original');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم الطالب.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      let finalOriginalUrl = '';
      let finalCartoonUrl = '';

      // 1. Upload original photo to Firebase Storage (with local base64 fallback)
      if (photoFile) {
        finalOriginalUrl = await uploadStudentPhoto(photoFile, teacherId);
      } else if (originalPreview) {
        finalOriginalUrl = originalPreview;
      }

      // 2. If cartoon was chosen, upload cartoon version
      if (wantsCartoon && cartoonPreview) {
        finalCartoonUrl = await uploadStudentPhotoDataUrl(
          cartoonPreview,
          teacherId,
          'cartoon'
        );
      }

      const useCartoon = wantsCartoon && !!finalCartoonUrl;
      const primaryPhoto = useCartoon ? finalCartoonUrl : finalOriginalUrl;

      await onAddStudent({
        name: name.trim(),
        photoUrl: finalOriginalUrl,
        cartoonPhotoUrl: finalCartoonUrl,
        useCartoonAvatar: useCartoon,
        photo: primaryPhoto,
        avatar: selectedAvatar
      });

      // Reset state and close modal
      setName('');
      setPhotoFile(null);
      setOriginalPreview(null);
      setCartoonPreview(null);
      setWantsCartoon(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ بيانات الطالب.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="glass-modal w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-900/[0.08] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">إضافة طالب جديد</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">سجل بيانات الطالب وصورته بنظام سبيل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl text-right">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              اسم الطالب <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: عبد الرحمن بن إبراهيم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-premium w-full px-4 py-3 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Avatar Mode Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              افتار الطالب في النظام <span className="text-rose-500">*</span>
            </label>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/70 dark:bg-slate-800/80 rounded-2xl border border-slate-900/[0.08] dark:border-slate-700">
              <button
                type="button"
                onClick={() => setAvatarMode('islamic')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  avatarMode === 'islamic'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>🕌 شخصيات إسلامية</span>
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('photo')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  avatarMode === 'photo'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>📷 رفع صورة شخصية</span>
              </button>
            </div>

            {avatarMode === 'islamic' ? (
              <div className="pt-1">
                <AnimeAvatarSelector
                  selectedAvatarId={selectedAvatar}
                  onSelectAvatar={(id) => setSelectedAvatar(id)}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                    <span>الصورة الحقيقية للطالب</span>
                  </label>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                    (تُحفظ في Firebase Storage)
                  </span>
                </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {!originalPreview ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-900/[0.15] dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 rounded-3xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40 hover:bg-sky-50/30 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    اسحب صورة الطالب هنا أو اضغط للاختيار
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    التقط أو ارفع صورة واضحة للوجه (JPG أو PNG)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Photo Change Bar */}
                <div className="card-depth flex items-center justify-between p-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={originalPreview}
                      alt="Original"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-sky-300 dark:ring-sky-600 shadow-2xs"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {photoFile?.name || 'تم اختيار الصورة'}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        جاهزة للاعتماد أو التحويل الكرتوني
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:underline cursor-pointer"
                  >
                    تغيير الصورة
                  </button>
                </div>

                {/* Prompt: هل تريد تحويل الصورة إلى كرتون؟ */}
                <div className="card-depth p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                      هل تريد تحويل الصورة إلى صورة كرتونية لطيفة؟
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                    نظام تحويل الصور الكرتوني يعتمد على نفس ملامح الطالب الحقيقية بأسلوب أكاديمي جذاب للأطفال.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSelectCartoonOption(true)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        wantsCartoon === true
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'card-depth text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>✅ نعم، تحويل كرتوني</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectCartoonOption(false)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        wantsCartoon === false
                          ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                          : 'card-depth text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>❌ لا، الصورة الأصلية فقط</span>
                    </button>
                  </div>
                </div>

                {/* Processing State */}
                {isProcessingCartoon && (
                  <div className="card-depth p-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold text-sky-700 dark:text-sky-300">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    <span>جاري تطبيق النمط الكرتوني والحفاظ على ملامح الطالب...</span>
                  </div>
                )}

                {/* Cartoon Preview & Selection */}
                {cartoonPreview && wantsCartoon && (
                  <div className="card-depth p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          معاينة بطاقة الطالب
                        </span>
                      </div>
                      
                      {/* Toggle view tabs */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700/80 p-0.5 rounded-lg text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setActivePreviewTab('cartoon')}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                            activePreviewTab === 'cartoon'
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                          }`}
                        >
                          الكرتونية ✨
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePreviewTab('original')}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                            activePreviewTab === 'original'
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                          }`}
                        >
                          الأصلية 📷
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center py-2">
                      <div className="relative">
                        <img
                          src={activePreviewTab === 'cartoon' ? cartoonPreview : originalPreview}
                          alt="Student Avatar"
                          className="w-28 h-28 rounded-3xl object-cover ring-2 ring-sky-300 dark:ring-sky-600 shadow-xs"
                        />
                        <span className="absolute -bottom-2 -right-2 bg-sky-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                          {activePreviewTab === 'cartoon' ? 'كرتوني 🎨' : 'حقيقي 📷'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900/[0.06] dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>سيتم حفظ الصورتين واختيار الكرتونية للعرض في البطاقة</span>
                      <button
                        type="button"
                        onClick={() => handleProcessCartoon(originalPreview!)}
                        className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>إعادة التوليد</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900/[0.08] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-900/[0.08] dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUploading || isProcessingCartoon}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري حفظ البيانات في Firebase...</span>
                </>
              ) : (
                <span>حفظ الطالب</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
