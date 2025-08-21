// ETF 관련 타입
export interface EtfInfo {
  isinCd: string;
  itmsNm: string;
  srtnCd: string;
  category: string;
  closePrice: number;
  fltRt: number;
  nav: number;
  vs: number;
  marketTotalAmt: number;
  netAssetTotalAmt: number;
  tradeVolume: number;
  tradePrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  priceDirection: string;
  baseDate: string;
  baseIndexName?: string;
  baseIndexClosePrice?: number;
  stLstgCnt?: number;
}

// 대시보드 마켓 통계
export interface MarketStats {
  totalCount: number;
  risingCount: number;
  fallingCount: number;
  stableCount: number;
  changeRateDistribution: {
    [key: string]: number;
  };
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

// 사용자 타입
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  watchListCount?: number;
}

// 관심종목 타입
export interface WatchlistItem {
  id: string;
  userId: string;
  isinCd: string;
  memo?: string;
  createdAt: string;
  etfInfo?: EtfInfo;
}

// 인기 ETF 타입
export interface PopularEtf {
  isinCd: string;
  etfName: string;
  likeCount: number;
}

// 통계 타입
export interface Statistics {
  totalUsers: number;
  totalEtfs: number;
  totalWatchLists: number;
}

// 테마 카운트 타입
export interface ThemeCounts {
  [key: string]: number;
}

// 로딩 상태 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 랭킹 타입
export type RankingType = 'gainers' | 'losers' | 'volume' | 'amount' | 'asset';

// 가격 방향 타입
export type PriceDirection = '상승' | '하락' | '보합';
