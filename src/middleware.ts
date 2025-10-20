import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|\\.(?:svg|png|jpg)$).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value; // 쿠키에서 accessToken 가져오기
  const rtoken = req.cookies.get('refreshToken')?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth/');
  const res = NextResponse.next();

  if (!token && rtoken) {
    console.log('accessToken:', token);
    console.log('refreshToken:', rtoken);
    const cookieValue = 'refreshToken=' + rtoken;
    const data = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/auth/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieValue,
        },
        credentials: 'include',
      },
    );    if (!token && rtoken) {
      console.log('accessToken:', token);
      console.log('refreshToken:', rtoken);
    
      const cookieValue = 'refreshToken=' + rtoken;
      try {
        const data = await fetch(
          process.env.NEXT_PUBLIC_API_URL + '/auth/refresh',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: cookieValue,
            },
            credentials: 'include',
          },
        );
    
        console.log('API 응답 상태:', data.status);
        const responseText = await data.text();
        console.log('API 응답 본문:', await data.text());
    
        if (!data.ok) {
          console.error('API 요청 실패:', data.status, responseText);
          return res;
        }
    
        const newToken = JSON.parse(responseText);
        console.log('새로운 토큰:', newToken);
    
        res.cookies.set('accessToken', newToken.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1000 * 60 * 60 * 24,
          path: '/',
        });
        console.log('액세스 토큰 설정 완료');
      } catch (error) {
        console.error('API 호출 중 에러:', error);
      }
    
      return res;
    }
    const newToken = await data.json();

    res.cookies.set('accessToken', newToken.token, {
      httpOnly: true, // XSS 공격 방지
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // CORS 문제 방지 (strict에서 lax로 변경)
      maxAge: 1000 * 60 * 60 * 24, // 24시간 (24시간 × 60분 × 60초 × 1000밀리초)
      path: '/', // 모든 경로에서 접근 가능
    });
    console.log('토큰 없음');
    return res;
  }

  // 2️⃣ 보호된 페이지 접근 시, 로그인하지 않았으면 로그인 페이지로 리디렉트
  const protectedRoutes = [
    '/management/profile',
    '/management/budget',
    '/cart',
    '/order',
    '/order-request',
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next(); // 정상적으로 요청 진행
}
