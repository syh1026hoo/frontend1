'use client';

import { useEffect, useState } from 'react';
import { etfApi } from '@/lib/api';
import { ThemeCounts, LoadingState } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { 
  TagIcon, 
  ChartBarIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const mainThemes = [
  {
    key: 'KODEX',
    name: 'KODEX ETF',
    description: '삼성자산운용의 대표 ETF 브랜드',
    icon: '📈',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
  {
    key: 'TIGER',
    name: 'TIGER ETF',
    description: '미래에셋자산운용의 ETF 브랜드',
    icon: '🐅',
    color: 'bg-yellow-500',
    hoverColor: 'hover:bg-yellow-600',
  },
  {
    key: 'ACE',
    name: 'ACE ETF',
    description: '한국투자자산운용의 ETF 브랜드',
    icon: '🏆',
    color: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
  },
];

const popularThemes = [
  { text: 'AI', icon: '🤖' },
  { text: '배당', icon: '💰' },
  { text: '조선', icon: '🚢' },
  { text: '방산', icon: '🛡️' },
  { text: '원자력', icon: '⚛️' },
  { text: '미국', icon: '🇺🇸' },
];

export default function Themes() {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [themeCounts, setThemeCounts] = useState<ThemeCounts>({});
  const [categoryGroups, setCategoryGroups] = useState<{[key: string]: any[]}>({});
  const [searchKeyword, setSearchKeyword] = useState('');

  const loadThemesData = async () => {
    try {
      setLoadingState('loading');
      const response = await etfApi.getThemes();
      
      if (response.data.success) {
        setThemeCounts(response.data.themeCounts || {});
        setCategoryGroups(response.data.categoryGroups || {});
        setLoadingState('success');
      } else {
        setLoadingState('error');
      }
    } catch (error) {
      console.error('Themes load failed:', error);
      setLoadingState('error');
    }
  };

  useEffect(() => {
    loadThemesData();
  }, []);

  const handleViewTheme = (theme: string) => {
    window.location.href = `/search?keyword=${encodeURIComponent(theme)}`;
  };

  const handleSearchTheme = () => {
    if (searchKeyword.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(searchKeyword)}`;
    }
  };

  const handleSearchThemeKeyword = (keyword: string) => {
    window.location.href = `/search?keyword=${encodeURIComponent(keyword)}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchTheme();
    }
  };

  if (loadingState === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">테마 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <ErrorMessage
        title="테마 정보를 불러올 수 없습니다"
        message="일시적인 오류가 발생했습니다."
        onRetry={loadThemesData}
      />
    );
  }

  const sortedCategories = Object.keys(categoryGroups).sort();

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TagIcon className="h-8 w-8 mr-2 text-blue-600" />
          테마별 ETF
        </h1>
        <p className="mt-2 text-gray-600">관심 있는 테마와 브랜드별로 ETF를 찾아보세요</p>
      </div>

      {/* 주요 테마 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mainThemes.map((theme) => (
          <div
            key={theme.key}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleViewTheme(theme.key)}
          >
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">{theme.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{theme.name}</h3>
              <p className="text-gray-600 mb-4">{theme.description}</p>
              <div className="mb-4">
                <Badge variant="secondary" size="lg">
                  {formatNumber(themeCounts[theme.key] || 0)}개
                </Badge>
              </div>
              <button
                className={`w-full py-2 px-4 text-white rounded-lg font-medium transition-colors ${theme.color} ${theme.hoverColor}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewTheme(theme.key);
                }}
              >
                보러가기 →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 테마 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            전체 테마 목록
          </h2>
        </div>
        <div className="p-6">
          {sortedCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedCategories.map((category) => {
                const count = categoryGroups[category]?.length || 0;
                return (
                  <button
                    key={category}
                    onClick={() => handleViewTheme(category)}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                    <Badge variant="secondary">{formatNumber(count)}</Badge>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">테마 데이터가 없습니다</h3>
              <p className="text-gray-600">ETF 데이터를 먼저 동기화해주세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 테마 검색 섹션 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
          원하는 테마를 찾아보세요
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-3">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="AI, 배당, 부동산, 방산 등 관심 테마를 입력하세요..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleSearchTheme}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2 inline" />
            테마 검색
          </button>
        </div>

        <div>
          <span className="text-sm text-gray-600 mr-2">인기 테마:</span>
          <div className="inline-flex flex-wrap gap-2">
            {popularThemes.map((theme, index) => (
              <button
                key={index}
                onClick={() => handleSearchThemeKeyword(theme.text)}
                className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="mr-1">{theme.icon}</span>
                {theme.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
