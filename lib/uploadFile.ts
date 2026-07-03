'use client';

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? '업로드 실패');
  }
  const { url } = await res.json();
  return url as string;
}
