export type PaperTradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export type PaperTradeSummary = {
  id: string;
  instrumentId: string;
  status: PaperTradeStatus;
  openedAt?: string;
  closedAt?: string;
};
