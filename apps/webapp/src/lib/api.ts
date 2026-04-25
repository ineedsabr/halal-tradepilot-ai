const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type TelegramAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export async function authenticateTelegram(initData: string): Promise<TelegramAuthResponse> {
  const response = await fetch(`${API_URL}/auth/telegram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ init_data: initData }),
  });

  if (!response.ok) {
    throw new Error('telegram_session_expired');
  }

  return response.json() as Promise<TelegramAuthResponse>;
}
