const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type TelegramAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type UserSettings = {
  language: 'ru' | 'en' | 'de';
  theme: 'light' | 'dark' | 'telegram';
  level: 'learner' | 'trader' | 'pro';
  goal: 'learn' | 'invest' | 'trade';
  methodology: 'conservative' | 'balanced' | 'scholar_based' | 'custom';
  risk_profile: 'conservative' | 'moderate' | 'active';
  max_risk_per_trade: number;
  demo_deposit: number;
  notifications_enabled: boolean;
  disclaimer_accepted_at?: string | null;
  terms_accepted_at?: string | null;
  privacy_accepted_at?: string | null;
  onboarding_completed: boolean;
};

export type UserSettingsUpdate = Partial<
  Pick<
    UserSettings,
    | 'language'
    | 'theme'
    | 'level'
    | 'goal'
    | 'methodology'
    | 'risk_profile'
    | 'demo_deposit'
    | 'notifications_enabled'
  >
> & {
  disclaimer_accepted?: boolean;
  terms_accepted?: boolean;
  privacy_accepted?: boolean;
};

export type AssetSummary = {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  exchange?: string | null;
  sector?: string | null;
  country?: string | null;
  currency?: string | null;
  current_status?: string | null;
  confidence?: string | null;
  data_freshness_status?: string | null;
};

export type InstrumentSummary = {
  id: string;
  code: string;
  name: string;
  category: string;
  is_absolute_restriction: boolean;
  restriction_reason?: string | null;
};

export type HalalCheckResult = {
  asset: AssetSummary;
  instrument: InstrumentSummary;
  asset_status: string;
  instrument_status: string;
  combined_status: string;
  methodology: string;
  confidence: string;
  data_quality_status: string;
  data_freshness_status: string;
  last_reviewed_at?: string | null;
  next_review_at?: string | null;
  summary: string;
  blocking_reason?: string | null;
  disclaimer: string;
};

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    let detail = fallbackMessage;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // Keep fallback message.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

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

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function getUserSettings(accessToken: string): Promise<UserSettings> {
  const response = await fetch(`${API_URL}/api/v1/me/settings`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return parseJsonResponse<UserSettings>(response, 'Unable to load settings.');
}

export async function updateUserSettings(accessToken: string, payload: UserSettingsUpdate): Promise<UserSettings> {
  const response = await fetch(`${API_URL}/api/v1/me/settings`, {
    method: 'PUT',
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<UserSettings>(response, 'Unable to update settings.');
}

export async function listInstruments(): Promise<InstrumentSummary[]> {
  const response = await fetch(`${API_URL}/api/v1/instruments`);
  return parseJsonResponse<InstrumentSummary[]>(response, 'Unable to load instrument options.');
}

export async function searchAssets(query: string): Promise<AssetSummary[]> {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) params.set('q', trimmed);
  params.set('limit', '20');

  const response = await fetch(`${API_URL}/api/v1/assets/search?${params.toString()}`);
  return parseJsonResponse<AssetSummary[]>(response, 'Unable to search assets.');
}

export async function checkHalal(params: {
  assetId: string;
  instrumentId: string;
  methodology?: string;
}): Promise<HalalCheckResult> {
  const query = new URLSearchParams({
    asset_id: params.assetId,
    instrument_id: params.instrumentId,
    methodology: params.methodology ?? 'mvp_conservative_bootstrap',
  });

  const response = await fetch(`${API_URL}/api/v1/halal/check?${query.toString()}`);
  return parseJsonResponse<HalalCheckResult>(response, 'Unable to run halal check.');
}
