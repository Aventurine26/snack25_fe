export async function fetchApi(
  url: string,
  options: RequestInit = {},
): Promise<unknown> {
  // 환경변수에서 API_URL을 가져오거나, 기본값을 사용
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = `${baseUrl}${url}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
    });

    const responseText = await res.text();
    let data: unknown = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    }

    if (!res.ok) {
      console.error('❗️서버 에러 응답 전체:', data);

      let message = '서버 오류가 발생했습니다';

      if (typeof data === 'string') {
        message = data;
      } else if (typeof data === 'object' && data !== null) {
        const payload = data as {
          message?: string | string[];
          error?: string;
        };

        message = Array.isArray(payload.message)
          ? payload.message[0]
          : payload.message || payload.error || message;
      }

      type ErrorWithResponse = Error & {
        response?: { data: unknown; status: number };
      };

      const error = new Error(message) as ErrorWithResponse;
      error.response = {
        data,
        status: res.status,
      };
      throw error;
    }

    // console.log('data', data);
    return data;
  } catch (err) {
    console.error('❌ [API 호출 실패]', fullUrl, err);
    throw err;
  }
}
