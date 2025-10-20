'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InviteExpiredContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center gap-4">
      <h1 className="text-2xl font-bold text-red-500">⚠️ 초대 링크가 만료되었습니다</h1>
      <p className="text-gray-500">{message ?? '초대가 만료되었거나 유효하지 않습니다.'}</p>
      <p className="mt-4 text-sm text-gray-400">초대자에게 다시 요청해주세요.</p>
    </div>
  );
}

export default function InviteExpiredPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">불러오는 중…</div>}>
      <InviteExpiredContent />
    </Suspense>
  );
}