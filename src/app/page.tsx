'use client';

import { useEffect, useState } from 'react';
import { etfApi } from '@/lib/api';
import { MarketStats, EtfInfo, LoadingState } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Badge from '@/components/ui/Badge';
import { formatNumber, getPriceColorClass } from '@/lib/utils';

export default function Dashboard() {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [topGainers, setTopGainers] = useState<EtfInfo[]>([]);
  const [mostTradedVolume, setMostTradedVolume] = useState<EtfInfo[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoadingState('loading');
      const response = await etfApi.getDashboardData();
      
      if (response.data.success) {
        setMarketStats(response.data.marketStats);
        setTopGainers(response.data.topGainers || []);
        setMostTradedVolume(response.data.mostTradedVolume || []);
        setLoadingState('success');
      } else {
        setLoadingState('error');
      }
    } catch (error) {
      console.error('Dashboard load failed:', error);
      setLoadingState('error');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loadingState === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <ErrorMessage
        title="대시보드 로딩 실패"
        message="데이터를 불러오는 중 오류가 발생했습니다."
        onRetry={loadDashboardData}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🏛️ ETF 시장 대시보드</h1>
        <p className="mt-2 text-gray-600">실시간 ETF 시장 현황과 주요 지표를 확인하세요</p>
      </div>

      {/* 시장 현황 통계 */}
      {marketStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">{formatNumber(marketStats.totalCount)}</div>
            <div className="text-sm text-gray-500 mt-1">전체 ETF</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{formatNumber(marketStats.risingCount)}</div>
            <div className="text-sm text-gray-500 mt-1">상승</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{formatNumber(marketStats.fallingCount)}</div>
            <div className="text-sm text-gray-500 mt-1">하락</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-gray-600">{formatNumber(marketStats.stableCount)}</div>
            <div className="text-sm text-gray-500 mt-1">보합</div>
          </div>
        </div>
      )}

      {/* ETF 랭킹 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 등락률 상위 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              📈 등락률 상위 Top 5
            </h2>
            <a href="/rankings?type=gainers" className="text-blue-600 hover:text-blue-700 text-sm">
              더보기 →
            </a>
          </div>
          <div className="p-6">
            {topGainers.length > 0 ? (
              <div className="space-y-4">
                {topGainers.map((etf, index) => (
                  <div key={etf.isinCd} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{etf.itmsNm}</div>
                        <div className="text-sm text-gray-500">{etf.srtnCd}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(etf.closePrice)}원</div>
                      <div className={`text-sm font-medium ${getPriceColorClass(etf.fltRt)}`}>
                        {etf.fltRt > 0 ? '+' : ''}{etf.fltRt}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                데이터 동기화가 필요합니다
              </div>
            )}
          </div>
        </div>

        {/* 거래량 상위 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              📊 거래량 상위 Top 5
            </h2>
            <a href="/rankings?type=volume" className="text-blue-600 hover:text-blue-700 text-sm">
              더보기 →
            </a>
          </div>
          <div className="p-6">
            {mostTradedVolume.length > 0 ? (
              <div className="space-y-4">
                {mostTradedVolume.map((etf, index) => (
                  <div key={etf.isinCd} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{etf.itmsNm}</div>
                        <div className="text-sm text-gray-500">{etf.srtnCd}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(etf.tradeVolume)}</div>
                      <div className="text-sm text-gray-500">거래량</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                데이터 동기화가 필요합니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}