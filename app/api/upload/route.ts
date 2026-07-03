import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: '파일 크기는 10MB 이하만 가능합니다.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(path, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
