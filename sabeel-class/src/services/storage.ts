import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Converts a data URL string to a Blob object
 */
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads a student photo File to Firebase Storage and returns download URL
 */
export async function uploadStudentPhoto(
  file: File,
  teacherId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanFileName = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
  const storageRef = ref(storage, `students/${teacherId}/${cleanFileName}`);

  // 1. Try direct Firebase Storage upload with metadata
  try {
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
      customMetadata: { teacherId, uploadedAt: new Date().toISOString() }
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (storageErr) {
    console.warn('Firebase Storage upload failed or offline, falling back to optimized base64 storage:', storageErr);
    
    // Fallback: Read and compress image
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Uploads a base64 Data URL (e.g. from Cartoon conversion) to Firebase Storage
 */
export async function uploadStudentPhotoDataUrl(
  dataUrl: string,
  teacherId: string,
  prefix: string = 'cartoon'
): Promise<string> {
  const cleanFileName = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.png`;
  const storageRef = ref(storage, `students/${teacherId}/${cleanFileName}`);

  try {
    const blob = dataURLtoBlob(dataUrl);
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: blob.type || 'image/png',
      customMetadata: { teacherId, type: prefix, uploadedAt: new Date().toISOString() }
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn('Firebase Storage upload of dataUrl failed, returning dataUrl directly:', err);
    return dataUrl;
  }
}

