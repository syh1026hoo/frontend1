'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { etfApi } from '@/lib/api';
import { EtfInfo, LoadingState } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Badge from '@/components/ui/Badge';
import { formatNumber, getPriceColorClass, getCategoryColorClass, debounce } from '@/lib/utils';
import { 
  MagnifyingGlassIcon, 
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const recommendedKeywords = [
  { text: '반도체', color: 'bg-blue-100 text-blue-800' },
  { text: 'KODEX', color: 'bg-green-100 text-green-800' },
  { text: 'TIGER', color: 'bg-yellow-100 text-yellow-800' },
  { text: 'AI', color: 'bg-purple-100 text-purple-800' },
  { text: '미국', color: 'bg-red-100 text-red-800' },
  { text: '배당', color: 'bg-gray-100 text-gray-800' },
];

const popularKeywords = [
  { text: '반도체', description: '반도체 관련 ETF', icon: '💻' },
  { text: 'KODEX', description: 'KODEX ETF', icon: '📈' },
  { text: 'AI', description: 'AI 관련 ETF', icon: '🤖' },
  { text: '미국', description: '미국 관련 ETF', icon: '🇺🇸' },
];

const searchTips = [
  '브랜드명으로 검색: KODEX, TIGER, SOL 등',
  '테마로 검색: 반도체, AI, 바이오 등',
  '지역으로 검색: 미국, 중국, 일본 등',
  '종목명 일부로 검색 가능',
];

export default function Search() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<EtfInfo[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [resultCount, setResultCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      setResultCount(0);
      return;
    }

    try {
      setLoadingState('loading');
      setHasSearched(true);
      
      const response = await etfApi.searchEtfs(searchKeyword);
      
      if (response.data.success) {
        setSearchResults(response.data.data || []);
        setResultCount(response.data.count || 0);
        setLoadingState('success');
      } else {
        setLoadingState('error');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setLoadingState('error');
    }
  };

  // 디바운스된 검색 함수
  const debouncedSearch = debounce(performSearch, 500);

  useEffect(() => {
    const initialKeyword = searchParams.get('keyword') || '';
    setKeyword(initialKeyword);
    if (initialKeyword) {
      performSearch(initialKeyword);
    }
  }, [searchParams]);

  const handleInputChange = (value: string) => {
    setKeyword(value);
    debouncedSearch(value);
    
    // URL 업데이트
    if (value.trim()) {
      window.history.pushState(null, '', `/search?keyword=${encodeURIComponent(value)}`);
    } else {
      window.history.pushState(null, '', '/search');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(keyword);
  };

  const handleRecommendedKeywordClick = (recommendedKeyword: string) => {
    setKeyword(recommendedKeyword);
    performSearch(recommendedKeyword);
    window.history.pushState(null, '', `/search?keyword=${encodeURIComponent(recommendedKeyword)}`);
  };

  const retrySearch = () => {
    if (keyword.trim()) {
      performSearch(keyword);
    }
  };

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <MagnifyingGlassIcon className="h-8 w-8 mr-2 text-blue-600" />
          ETF 검색
        </h1>
        <p className="mt-2 text-gray-600">종목명, 브랜드, 테마 등으로 ETF를 검색하세요</p>
      </div>

      {/* 검색 섹션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="ETF 이름, 브랜드 (KODEX, TIGER), 테마 (반도체, AI) 등을 입력하세요..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              검색
            </button>
          </div>

          {/* 추천 검색어 */}
          <div>
            <span className="text-sm text-gray-500 mr-2">추천 검색어:</span>
            <div className="inline-flex flex-wrap gap-2">
              {recommendedKeywords.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRecommendedKeywordClick(item.text)}
                  className={`px-2 py-1 text-xs rounded-full border-0 hover:opacity-80 transition-opacity ${item.color}`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* 검색 결과 */}
      {hasSearched && (
        <div className="space-y-6">
          {loadingState === 'loading' && (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex justify-center items-center">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">검색 중입니다...</span>
              </div>
            </div>
          )}

          {loadingState === 'error' && (
            <div className="bg-white rounded-lg shadow p-8">
              <ErrorMessage
                title="검색 중 오류가 발생했습니다"
                message="잠시 후 다시 시도해주세요"
                onRetry={retrySearch}
              />
            </div>
          )}

          {loadingState === 'success' && (
            <>
              {/* 검색 결과 헤더 */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  검색 결과 "{keyword}" <Badge variant="secondary">{formatNumber(resultCount)}</Badge>
                </h2>
              </div>

              {/* 검색 결과 목록 */}
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((etf) => (
                    <div key={etf.isinCd} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium text-gray-900 flex-1">
                            <a 
                              href={`/etf/${etf.isinCd}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {etf.itmsNm}
                            </a>
                          </h3>
                          <Badge className={getCategoryColorClass(etf.category)}>
                            {etf.category}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">종목코드</div>
                            <div className="font-medium">{etf.srtnCd}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">현재가</div>
                            <div className="font-medium">{formatNumber(etf.closePrice)}원</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-500">등락률</div>
                            <div className={`font-medium ${getPriceColorClass(etf.fltRt)}`}>
                              {etf.fltRt > 0 ? '+' : ''}{etf.fltRt}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">NAV</div>
                            <div className="font-medium">{formatNumber(etf.nav)}</div>
                          </div>
                        </div>

                        {etf.baseIndexName && (
                          <div className="mb-4">
                            <div className="text-sm text-gray-500">기초지수</div>
                            <div className="text-sm text-gray-700">{etf.baseIndexName}</div>
                          </div>
                        )}

                        {(etf.tradeVolume && etf.tradeVolume > 0) && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-gray-500">거래량</div>
                              <div className="text-sm">{formatNumber(etf.tradeVolume)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">거래대금</div>
                              <div className="text-sm">{formatNumber(etf.tradePrice / 100000000)}억원</div>
                            </div>
                          </div>
                        )}

                        <a
                          href={`/etf/${etf.isinCd}`}
                          className="block w-full text-center py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <InformationCircleIcon className="inline h-4 w-4 mr-1" />
                          상세보기
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-gray-600">다른 키워드로 검색해보세요</p>
                </div>
              )}

              {/* 더 많은 결과 알림 */}
              {resultCount > 20 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-blue-800">
                      더 많은 결과가 있습니다. 검색어를 더 구체적으로 입력해보세요.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 검색 전 추천 내용 */}
      {!hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 인기 검색어 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-red-500 mr-2">🔥</span>
                인기 검색어
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {popularKeywords.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleRecommendedKeywordClick(item.text)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{item.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{item.text}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 검색 팁 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                검색 팁
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {searchTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
