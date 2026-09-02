import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  User,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Palette,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Student } from '../../types';
import { AnimeAvatarSelector } from './AnimeAvatarSelector';
import { uploadStudentPhoto, uploadStudentPhotoDataUrl } from '../../services/storage';
import { convertPhotoToCartoon } from '../../services/cartoonService';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateStudent: (
    studentId: string,
    updates: Partial<Omit<Student, 'id' | 'teacherId' | 'createdAt'>>
  ) => Promise<void>;
  teacherId: string;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onUpdateStudent,
  teacherId
}) => {
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string>('');
  const [cartoonPhoto, setCartoonPhoto] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('islamic_1');
  const [avatarMode, setAvatarMode] = useState<'islamic' | 'photo'>('islamic');
  const [useCartoonAvatar, setUseCartoonAvatar] = useState<boolean>(true);
  const [isProcessingCartoon, setIsProcessingCartoon] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      const orig = student.photoUrl || student.photo || '';
      const cartoon = student.cartoonPhotoUrl || '';
      setOriginalPhoto(orig);
      setCartoonPhoto(cartoon);
      setSelectedAvatar(student.avatar || 'islamic_1');
      setAvatarMode(orig || cartoon ? 'photo' : 'islamic');
      setUseCartoonAvatar(student.useCartoonAvatar ?? !!cartoon);
      setPhotoFile(null);
      setErrorMsg(null);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleProcessCartoon = async (source: string) => {
    setIsProcessingCartoon(true);
    setErrorMsg(null);
    try {
      const result = await convertPhotoToCartoon(source, {
        style: 'sabeel_cartoon',
        outputSize: 500
      });
      setCartoonPhoto(result.cartoonUrl);
      setUseCartoonAvatar(true);
    } catch (err: any) {
      console.error('Failed to cartoonize image:', err);
      setErrorMsg('تعذر تحويل الصورة إلى كرتون، تم الاحتفاظ بالصورة الحالية.');
    } finally {
      setIsProcessingCartoon(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت.');
        return;
      }
      setErrorMsg(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setOriginalPhoto(dataUrl);
        // Automatically offer or generate cartoon if requested
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم الطالب.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      let finalOriginalUrl = originalPhoto;
      let finalCartoonUrl = cartoonPhoto;

      // 1. Upload new photo file if chosen
      if (photoFile) {
        finalOriginalUrl = await uploadStudentPhoto(photoFile, teacherId);
      }

      // 2. Upload new cartoon if generated as base64 dataUrl
      if (cartoonPhoto && cartoonPhoto.startsWith('data:')) {
        finalCartoonUrl = await uploadStudentPhotoDataUrl(cartoonPhoto, teacherId, 'cartoon');
      }

      const activePhoto = useCartoonAvatar && finalCartoonUrl ? finalCartoonUrl : finalOriginalUrl;

      await onUpdateStudent(student.id, {
        name: name.trim(),
        photoUrl: finalOriginalUrl,
        cartoonPhotoUrl: finalCartoonUrl,
        useCartoonAvatar: useCartoonAvatar && !!finalCartoonUrl,
        photo: activePhoto,
        avatar: selectedAvatar
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentDisplayPhoto = useCartoonAvatar && cartoonPhoto ? cartoonPhoto : originalPhoto;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-sky-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">تعديل بيانات الطالب</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">تحديث الاسم والصورة والنمط الكرتوني في Firestore</p>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-sky-50/30 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 focus:border-sky-400 dark:focus:border-sky-500 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none transition-colors"
            />
          </div>

          {/* Avatar Selection & Controls */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              افتار الطالب في النظام <span className="text-rose-500">*</span>
            </label>

            {/* Switch Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-amber-50/50 dark:bg-slate-800/80 rounded-2xl border border-amber-200/60 dark:border-slate-700">
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
                <span>📷 صورة شخصية</span>
              </button>
            </div>

            {avatarMode === 'islamic' ? (
              <div className="pt-1">
                <AnimeAvatarSelector
                  selectedAvatarId={selectedAvatar}
                  onSelectAvatar={(id) => {
                    setSelectedAvatar(id);
                    // Clear custom photo flags if teacher specifically chooses an Islamic avatar
                    setOriginalPhoto('');
                    setCartoonPhoto('');
                  }}
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-sky-50/40 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    صورة الطالب الحالية والمعتمدة
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    رفع صورة جديدة
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {currentDisplayPhoto ? (
                      <img
                        src={currentDisplayPhoto}
                        alt={name}
                        className="w-20 h-20 rounded-2xl object-cover ring-3 ring-sky-300 dark:ring-sky-600 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-sky-100 dark:bg-slate-700 flex items-center justify-center text-3xl">
                        👦
                      </div>
                    )}
                    <span className="absolute -bottom-2 -right-1 bg-sky-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {useCartoonAvatar && cartoonPhoto ? 'كرتوني 🎨' : 'أصلية 📷'}
                    </span>
                  </div>

              <div className="flex-1 space-y-2">
                {/* Toggle Between Cartoon and Original */}
                {cartoonPhoto && originalPhoto && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      عرض النمط الكرتوني في البطاقة
                    </span>
                    <button
                      type="button"
                      onClick={() => setUseCartoonAvatar(!useCartoonAvatar)}
                      className="text-sky-500 hover:text-sky-600 cursor-pointer"
                    >
                      {useCartoonAvatar ? (
                        <ToggleRight className="w-7 h-7 text-sky-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-400" />
                      )}
                    </button>
                  </div>
                )}

                {/* Generate / Re-generate Cartoon button */}
                {originalPhoto && (
                  <button
                    type="button"
                    disabled={isProcessingCartoon}
                    onClick={() => handleProcessCartoon(originalPhoto)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {cartoonPhoto ? 'إعادة إنشاء النمط الكرتوني 🎨' : 'تحويل الصورة الحالية إلى كرتون 🎨'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {isProcessingCartoon && (
              <div className="p-3 rounded-xl bg-sky-100/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 flex items-center justify-center gap-2 text-xs font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                <span>جاري معالجة ملامح الوجه بالنمط الكرتوني...</span>
              </div>
            )}
          </div>
        )}
      </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sky-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving || isProcessingCartoon}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ في Firestore...</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
