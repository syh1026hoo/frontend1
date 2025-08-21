'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { etfApi } from '@/lib/api';
import { EtfInfo, LoadingState } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Badge from '@/components/ui/Badge';
import { formatNumber, getPriceColorClass, getCategoryColorClass, formatDate } from '@/lib/utils';
import { 
  ChartBarIcon, 
  InformationCircleIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  TagIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function EtfDetail() {
  const params = useParams();
  const isinCd = params.isinCd as string;
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [etf, setEtf] = useState<EtfInfo | null>(null);

  const loadEtfDetail = async () => {
    if (!isinCd) {
      setLoadingState('error');
      return;
    }

    try {
      setLoadingState('loading');
      const response = await etfApi.getEtfDetail(isinCd);
      
      if (response.data.success && response.data.data) {
        setEtf(response.data.data);
        setLoadingState('success');
      } else {
        setLoadingState('error');
      }
    } catch (error) {
      console.error('ETF detail load failed:', error);
      setLoadingState('error');
    }
  };

  useEffect(() => {
    loadEtfDetail();
  }, [isinCd]);

  useEffect(() => {
    if (etf?.itmsNm) {
      document.title = `${etf.itmsNm} - ETF 상세정보`;
    }
  }, [etf]);

  if (loadingState === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">ETF 상세정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error' || !etf) {
    return (
      <ErrorMessage
        title="ETF 정보를 불러올 수 없습니다"
        message="존재하지 않는 ETF이거나 일시적인 오류가 발생했습니다."
        onRetry={loadEtfDetail}
      />
    );
  }

  const showDataWarning = !etf.closePrice || etf.closePrice <= 0;

  return (
    <div className="space-y-6">
      {/* 데이터 검증 경고 */}
      {showDataWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <strong className="text-yellow-800">주의:</strong>{' '}
              <span className="text-yellow-700">
                이 ETF의 일부 데이터가 아직 로딩되지 않았습니다.
              </span>
              <div className="text-sm text-yellow-600 mt-1">실시간 데이터 동기화가 필요할 수 있습니다.</div>
            </div>
          </div>
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">홈</a>
          {' > '}
          <span>ETF 상세정보</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {etf.itmsNm || 'ETF명 (정보 없음)'}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" size="lg">{etf.srtnCd || '코드 없음'}</Badge>
              {etf.category ? (
                <Badge className={getCategoryColorClass(etf.category)}>{etf.category}</Badge>
              ) : (
                <Badge variant="secondary">카테고리 없음</Badge>
              )}
              <span className="text-sm text-gray-500">
                ISIN: {etf.isinCd || '정보 없음'}
              </span>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            뒤로가기
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 가격 정보 카드 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                가격 정보
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">현재가</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {etf.closePrice ? `${formatNumber(etf.closePrice)}원` : '정보 없음'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">등락률</div>
                  <div className={`text-3xl font-bold ${getPriceColorClass(etf.fltRt)}`}>
                    {etf.fltRt ? `${etf.fltRt > 0 ? '+' : ''}${etf.fltRt}%` : '정보 없음'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3">
                  <div className="text-sm text-gray-500">NAV</div>
                  <div className="font-medium text-gray-900">
                    {etf.nav ? formatNumber(etf.nav) : '-'}
                  </div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm text-gray-500">전일대비</div>
                  <div className={`font-medium ${getPriceColorClass(etf.vs)}`}>
                    {etf.vs ? `${etf.vs}원` : '-'}
                  </div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm text-gray-500">시가총액</div>
                  <div className="font-medium text-gray-900">
                    {etf.marketTotalAmt ? `${formatNumber(etf.marketTotalAmt / 100000000)}억원` : '-'}
                  </div>
                </div>
                <div className="text-center p-3">
                  <div className="text-sm text-gray-500">순자산</div>
                  <div className="font-medium text-gray-900">
                    {etf.netAssetTotalAmt ? `${formatNumber(etf.netAssetTotalAmt / 100000000)}억원` : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div>
          <div className="bg-white rounded-lg shadow h-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                기본 정보
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-500">기준일자</div>
                <div className="font-medium text-gray-900">{etf.baseDate || '2024-01-01'}</div>
              </div>
              
              {etf.baseIndexName && (
                <div>
                  <div className="text-sm text-gray-500">기초지수</div>
                  <div className="font-medium text-gray-900">{etf.baseIndexName}</div>
                </div>
              )}
              
              {etf.baseIndexClosePrice && etf.baseIndexClosePrice > 0 && (
                <div>
                  <div className="text-sm text-gray-500">기초지수 종가</div>
                  <div className="font-medium text-gray-900">{formatNumber(etf.baseIndexClosePrice)}</div>
                </div>
              )}
              
              {etf.stLstgCnt && etf.stLstgCnt > 0 && (
                <div>
                  <div className="text-sm text-gray-500">상장주식수</div>
                  <div className="font-medium text-gray-900">{formatNumber(etf.stLstgCnt)}주</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 거래 정보 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-blue-600" />
            거래 정보
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">거래량</div>
              <div className="font-medium text-gray-900">{etf.tradeVolume ? formatNumber(etf.tradeVolume) : '-'}</div>
              <div className="text-xs text-gray-500">주</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">거래대금</div>
              <div className="font-medium text-gray-900">
                {etf.tradePrice ? formatNumber(etf.tradePrice / 100000000) : '-'}
              </div>
              <div className="text-xs text-gray-500">억원</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">시가</div>
              <div className="font-medium text-gray-900">{etf.openPrice ? formatNumber(etf.openPrice) : '-'}</div>
              <div className="text-xs text-gray-500">원</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">고가</div>
              <div className="font-medium text-gray-900">{etf.highPrice ? formatNumber(etf.highPrice) : '-'}</div>
              <div className="text-xs text-gray-500">원</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">저가</div>
              <div className="font-medium text-gray-900">{etf.lowPrice ? formatNumber(etf.lowPrice) : '-'}</div>
              <div className="text-xs text-gray-500">원</div>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">상태</div>
              <div className={`font-medium ${getPriceColorClass(etf.fltRt)}`}>
                {etf.priceDirection || '보합'}
              </div>
              <div className="text-xs text-gray-500">-</div>
            </div>
          </div>
        </div>
      </div>

      {/* 관련 ETF 추천 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
            관련 ETF 더보기
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {etf.category ? (
              <a
                href={`/search?keyword=${encodeURIComponent(etf.category)}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <TagIcon className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-medium text-gray-900">같은 카테고리 ETF</span>
                </div>
                <Badge className={getCategoryColorClass(etf.category)}>{etf.category}</Badge>
              </a>
            ) : (
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <TagIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-medium text-gray-500">같은 카테고리 ETF</span>
                </div>
                <Badge variant="secondary">정보 없음</Badge>
              </div>
            )}

            {etf.baseIndexName ? (
              <a
                href={`/search?keyword=${encodeURIComponent(etf.baseIndexName.substring(0, 10))}`}
                className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5 mr-3 text-green-600" />
                <span className="font-medium text-gray-900">같은 지수 ETF</span>
              </a>
            ) : (
              <div className="flex items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <ChartBarIcon className="h-5 w-5 mr-3 text-gray-400" />
                <span className="font-medium text-gray-500">같은 지수 ETF</span>
              </div>
            )}

            <a
              href="/rankings?type=gainers"
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <TrophyIcon className="h-5 w-5 mr-3 text-yellow-600" />
              <span className="font-medium text-gray-900">상위 등락률 ETF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
