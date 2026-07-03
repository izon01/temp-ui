const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.85;

/**
 * 이미지 파일을 최대 1200px로 리사이징 후 base64 dataURL로 변환.
 * PNG는 투명도 보존을 위해 image/png 유지, 나머지는 image/jpeg 압축.
 * 원본이 MAX_WIDTH 이하이면 리사이징 없이 포맷 변환만 수행.
 */
export function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      resolve(canvas.toDataURL(mime, JPEG_QUALITY));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 로드 실패')); };
    img.src = url;
  });
}
