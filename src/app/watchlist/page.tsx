'use client';

import { useEffect, useState } from 'react';
import { userApi, watchlistApi, etfApi } from '@/lib/api';
import { WatchlistItem, PopularEtf, LoadingState } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Badge from '@/components/ui/Badge';
import { formatNumber, getPriceColorClass, getCategoryColorClass, session } from '@/lib/utils';
import { 
  HeartIcon, 
  FireIcon, 
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function Watchlist() {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [popularEtfs, setPopularEtfs] = useState<PopularEtf[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCheckedLogin, setHasCheckedLogin] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    
    // 페이지가 포커스를 받을 때마다 로그인 상태 재확인
    const handleFocus = () => {
      console.log('Page focus - rechecking login status');
      checkLoginStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const checkLoginStatus = () => {
    console.log('=== 관심종목 로그인 상태 확인 시작 ===');
    
    // 세션 스토리지 전체 내용 확인
    if (typeof window !== 'undefined') {
      console.log('SessionStorage 전체 내용:');
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const loginStatus = session.get('isLoggedIn');
    const userData = session.get('user');
    
    console.log('세션에서 가져온 데이터:', { 
      loginStatus: loginStatus,
      loginStatusType: typeof loginStatus,
      userData: userData,
      userDataType: typeof userData,
      hasUserId: userData ? userData.id : 'no user data'
    });
    
    setHasCheckedLogin(true);
    
    // 더 엄격한 로그인 상태 확인
    if (loginStatus === true && userData && userData.id) {
      console.log('✅ 사용자 로그인 상태 확인됨:', userData);
      setIsLoggedIn(true);
      setCurrentUser(userData);
      setLoadingState('loading'); // 데이터를 로드하기 전에 로딩 상태로 변경
      loadAllData(userData);
    } else {
      console.log('❌ 사용자 로그인되지 않음 또는 데이터 부족');
      console.log('  - loginStatus:', loginStatus, '(예상: true)');
      console.log('  - userData:', userData, '(예상: 사용자 객체)');
      console.log('  - userData.id:', userData ? userData.id : 'undefined', '(예상: 숫자)');
      setIsLoggedIn(false);
      setLoadingState('success'); // 로그인 안 된 상태도 정상 상태로 처리
    }
    
    console.log('=== 관심종목 로그인 상태 확인 완료 ===');
  };

  const loadAllData = async (user: any) => {
    try {
      setLoadingState('loading');
      
      // 병렬로 데이터 로드
      const [watchlistRes, popularRes] = await Promise.all([
        loadWatchlist(user.id),
        loadPopularEtfs()
      ]);

      setLoadingState('success');
    } catch (error) {
      console.error('Data loading failed:', error);
      setLoadingState('error');
    }
  };

  const loadWatchlist = async (userId: number) => {
    try {
      const response = await watchlistApi.getWatchlist(userId);
      if (response.data.success) {
        setWatchlist(response.data.data || []);
        return response.data;
      }
    } catch (error) {
      console.error('Watchlist load failed:', error);
    }
    return null;
  };

  const loadPopularEtfs = async () => {
    try {
      console.log('인기 ETF 로딩 시작...');
      const response = await watchlistApi.getPopularEtfs();
      console.log('인기 ETF API 응답:', response.data);
      
      if (response.data.success) {
        setPopularEtfs(response.data.data || []);
        console.log('인기 ETF 데이터 설정 완료:', response.data.data);
        return response.data;
      } else {
        console.log('인기 ETF API 실패:', response.data.message);
      }
    } catch (error) {
      console.error('Popular ETFs load failed:', error);
    }
    return null;
  };



  const removeFromWatchlist = async (watchlistId: number) => {
    if (!currentUser) return;

    try {
      const response = await watchlistApi.removeFromWatchlist(watchlistId);
      if (response.data.success) {
        setWatchlist(prev => prev.filter(item => item.id !== watchlistId));
        showToast('관심종목에서 삭제되었습니다.', 'success');
      } else {
        showToast('삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Remove failed:', error);
      showToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const addToWatchlistFromPopular = async (isinCd: string) => {
    if (!currentUser) {
      showToast('로그인이 필요합니다.', 'error');
      return;
    }

    try {
      const response = await watchlistApi.addToWatchlist({
        userId: currentUser.id,
        isinCd: isinCd
      });
      
      if (response.data.success) {
        showToast('관심종목에 추가되었습니다.', 'success');
        // 관심종목 목록 다시 로드
        loadWatchlist(currentUser.id);
      } else {
        showToast(response.data.message || '추가에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Add to watchlist failed:', error);
      showToast('관심종목 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  const refreshWatchlist = () => {
    if (currentUser) {
      loadAllData(currentUser);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // 간단한 토스트 알림 (실제로는 toast 라이브러리 사용 권장)
    alert(message);
  };

  // 로그인 상태 확인이 완료되지 않았거나 로딩 중인 경우
  if (!hasCheckedLogin || (loadingState === 'loading' && isLoggedIn)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {!hasCheckedLogin ? '로그인 상태를 확인하는 중...' : '관심종목을 불러오는 중...'}
          </p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <ErrorMessage
        title="데이터를 불러올 수 없습니다"
        message="일시적인 오류가 발생했습니다."
        onRetry={refreshWatchlist}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">관심종목을 관리하려면 로그인하세요</h2>
        <p className="text-gray-600 mb-6">로그인하시면 관심 있는 ETF를 저장하고 관리할 수 있습니다.</p>
        <a
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          로그인하기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <HeartIcon className="h-8 w-8 mr-2 text-red-500" />
          관심종목
        </h1>
        <p className="mt-2 text-gray-600">관심 있는 ETF를 추가하고 관리하세요.</p>
      </div>

      {/* 인기 ETF TOP 5 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FireIcon className="h-6 w-6 mr-2 text-orange-500" />
            인기 ETF TOP 5
          </h2>
        </div>
        <div className="p-6">
          {popularEtfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {popularEtfs.map((etf, index) => (
                <div key={etf.isinCd} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-600">#{index + 1}</span>
                    <button
                      onClick={() => addToWatchlistFromPopular(etf.isinCd)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="관심종목에 추가"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">{etf.itmsNm}</h4>
                  <div className="text-xs text-gray-500 mb-2">{etf.srtnCd}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(etf.closePrice)}원
                  </div>
                  <div className={`text-sm ${getPriceColorClass(etf.fltRt)}`}>
                    {etf.fltRt > 0 ? '+' : ''}{etf.fltRt}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FireIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p>인기 ETF 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>



      {/* 관심종목 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <HeartIcon className="h-6 w-6 mr-2 text-red-500" />
              내 관심종목
            </h2>
            <button
              onClick={refreshWatchlist}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              새로고침
            </button>
          </div>
        </div>

        {watchlist.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                    NAV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {watchlist.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <a 
                          href={`/etf/${item.etfInfo.isinCd}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {item.etfInfo.itmsNm}
                        </a>
                        <div className="text-sm text-gray-500">{item.etfInfo.srtnCd}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(item.etfInfo.closePrice)}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPriceColorClass(item.etfInfo.fltRt)}`}>
                        {item.etfInfo.fltRt > 0 ? '+' : ''}{item.etfInfo.fltRt}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatNumber(item.etfInfo.nav)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getCategoryColorClass(item.etfInfo.category)}>
                        {item.etfInfo.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="관심종목에서 삭제"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <HeartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">관심종목이 없습니다</h3>
            <p className="text-gray-600 mb-4">관심 있는 ETF를 추가해보세요</p>
            <a
              href="/search"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              ETF 검색하기
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
