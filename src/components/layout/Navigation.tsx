'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ChartBarIcon, 
  TrophyIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { cn, session } from '@/lib/utils';

const navigation = [
  { name: '랭킹', href: '/rankings', icon: TrophyIcon },
  { name: '검색', href: '/search', icon: MagnifyingGlassIcon },
  { name: '테마별', href: '/themes', icon: TagIcon },
  { name: '관심종목', href: '/watchlist', icon: HeartIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = () => {
      const loginStatus = session.get('isLoggedIn');
      const userData = session.get('user');
      
      setIsLoggedIn(!!loginStatus);
      setCurrentUser(userData);
    };

    checkLoginStatus();
    
    // 세션 변화 감지를 위한 storage 이벤트 리스너
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    session.remove('isLoggedIn');
    session.remove('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    // 홈페이지로 리다이렉트
    window.location.href = '/';
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <ChartBarIcon className="h-8 w-8" />
              <span className="text-xl font-bold">ETF 정보 플랫폼</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-blue-100 text-sm">
                  안녕하세요, <span className="font-medium">{currentUser?.username}</span>님
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                <span>로그인</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
