const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type TelegramAuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
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
