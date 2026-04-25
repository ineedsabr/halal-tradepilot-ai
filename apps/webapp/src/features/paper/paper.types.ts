export type PaperTradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export type PaperTradeSummary = {
  id: string;
  assetId: string;
  instrumentId: string;
  status: PaperTradeStatus;
  entryPrice: string;
  stopLoss: string;
  takeProfit?: string;
  openedAt?: string;
  closedAt?: string;
};
