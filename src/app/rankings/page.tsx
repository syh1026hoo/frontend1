'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { etfApi } from '@/lib/api';
import { EtfInfo, LoadingState, RankingType } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Badge from '@/components/ui/Badge';
import { formatNumber, getPriceColorClass, getCategoryColorClass } from '@/lib/utils';
import { 
  TrophyIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon 
} from '@heroicons/react/24/outline';

const rankingTypes = [
  { key: 'gainers', label: '등락률 상위', icon: ArrowUpIcon, color: 'text-red-600' },
  { key: 'losers', label: '등락률 하위', icon: ArrowDownIcon, color: 'text-blue-600' },
  { key: 'volume', label: '거래량 상위', icon: ChartBarIcon, color: 'text-green-600' },
  { key: 'amount', label: '거래대금 상위', icon: CurrencyDollarIcon, color: 'text-purple-600' },
  { key: 'asset', label: '순자산총액 상위', icon: BuildingLibraryIcon, color: 'text-orange-600' },
];

export default function Rankings() {
  const searchParams = useSearchParams();
  const [currentType, setCurrentType] = useState<RankingType>('gainers');
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [etfList, setEtfList] = useState<EtfInfo[]>([]);
  const [title, setTitle] = useState('');
  const [count, setCount] = useState(0);

  const loadRankings = async (type: RankingType) => {
    try {
      setLoadingState('loading');
      const response = await etfApi.getRankings(type);
      
      if (response.data.success) {
        setEtfList(response.data.data || []);
        setTitle(response.data.title || '');
        setCount(response.data.count || 0);
        setLoadingState('success');
      } else {
        setLoadingState('error');
      }
    } catch (error) {
      console.error('Rankings load failed:', error);
      setLoadingState('error');
    }
  };

  useEffect(() => {
    const typeParam = searchParams.get('type') as RankingType;
    const initialType = typeParam && rankingTypes.find(t => t.key === typeParam) ? typeParam : 'gainers';
    setCurrentType(initialType);
    loadRankings(initialType);
  }, [searchParams]);

  const handleTypeChange = (type: RankingType) => {
    setCurrentType(type);
    loadRankings(type);
    // URL 업데이트
    window.history.pushState(null, '', `/rankings?type=${type}`);
  };

  const getCurrentTypeInfo = () => {
    return rankingTypes.find(t => t.key === currentType) || rankingTypes[0];
  };

  const getTypeValue = (etf: EtfInfo, type: RankingType): string => {
    switch (type) {
      case 'gainers':
      case 'losers':
        return `${etf.fltRt > 0 ? '+' : ''}${etf.fltRt}%`;
      case 'volume':
        return formatNumber(etf.tradeVolume);
      case 'amount':
        return `${formatNumber(etf.tradePrice / 100000000)}억원`;
      case 'asset':
        return `${formatNumber(etf.netAssetTotalAmt / 100000000)}억원`;
      default:
        return '-';
    }
  };

  if (loadingState === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">랭킹 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <ErrorMessage
        title="랭킹 로딩 실패"
        message="데이터를 불러오는 중 오류가 발생했습니다."
        onRetry={() => loadRankings(currentType)}
      />
    );
  }

  const currentTypeInfo = getCurrentTypeInfo();
  const IconComponent = currentTypeInfo.icon;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrophyIcon className="h-8 w-8 mr-2 text-yellow-500" />
          ETF 랭킹
        </h1>
        <p className="mt-2 text-gray-600">다양한 기준으로 정렬된 ETF 랭킹을 확인하세요</p>
      </div>

      {/* 랭킹 타입 선택 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {rankingTypes.map((type) => {
              const TypeIcon = type.icon;
              const isActive = currentType === type.key;
              
              return (
                <button
                  key={type.key}
                  onClick={() => handleTypeChange(type.key as RankingType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TypeIcon className={`h-4 w-4 ${isActive ? 'text-white' : type.color}`} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 랭킹 결과 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <IconComponent className={`h-6 w-6 mr-2 ${currentTypeInfo.color}`} />
              {title}
            </h2>
            <Badge variant="secondary">{formatNumber(count)}개</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          {etfList.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    순위
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    종목명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등락률
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {currentType === 'volume' ? '거래량' : 
                     currentType === 'amount' ? '거래대금' :
                     currentType === 'asset' ? '순자산총액' : '등락률'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {etfList.map((etf, index) => (
                  <tr key={etf.isinCd} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${
                          index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <a 
                          href={`/etf/${etf.isinCd}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {etf.itmsNm}
                        </a>
                        <div className="text-sm text-gray-500">{etf.srtnCd}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(etf.closePrice)}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPriceColorClass(etf.fltRt)}`}>
                        {etf.fltRt > 0 ? '+' : ''}{etf.fltRt}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getTypeValue(etf, currentType)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getCategoryColorClass(etf.category)}>
                        {etf.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">데이터가 없습니다</h3>
              <p>데이터 동기화가 필요합니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
