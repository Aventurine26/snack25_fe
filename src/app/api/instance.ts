type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
};

type ErrorWithResponse = Error & {
  response?: { data: unknown; status: number };
};

export async function fetchApi<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
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
        const payload = data as ApiErrorPayload;
        message = Array.isArray(payload.message)
          ? payload.message[0]
          : payload.message || payload.error || message;
      }

      const error = new Error(message) as ErrorWithResponse;
      error.response = { data, status: res.status };
      throw error;
    }

    return data as T;
  } catch (err) {
    console.error('❌ [API 호출 실패]', fullUrl, err);
    throw err;
  }
}