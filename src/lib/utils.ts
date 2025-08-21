import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 숫자 포맷팅
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Number(num).toLocaleString('ko-KR');
};

// 가격 색상 클래스 반환
export const getPriceColorClass = (value: number | null | undefined): string => {
  if (!value || value === 0) return 'text-gray-500';
  return value > 0 ? 'text-red-600' : 'text-blue-600';
};

// 카테고리별 뱃지 색상 클래스
export const getCategoryColorClass = (category: string): string => {
  switch (category) {
    case 'KODEX':
      return 'bg-green-100 text-green-800';
    case 'TIGER':
      return 'bg-yellow-100 text-yellow-800';
    case 'ACE':
      return 'bg-gray-100 text-gray-800';
    case 'SOL':
      return 'bg-blue-100 text-blue-800';
    case '반도체':
      return 'bg-purple-100 text-purple-800';
    case 'AI':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 가격 방향별 뱃지 색상
export const getDirectionColorClass = (direction: string): string => {
  switch (direction) {
    case '상승':
      return 'bg-red-100 text-red-800';
    case '하락':
      return 'bg-blue-100 text-blue-800';
    case '보합':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 로컬 스토리지 헬퍼
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Local storage error:', error);
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// 세션 스토리지 헬퍼
export const session = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Session storage error:', error);
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },
};

// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('ko-KR');
  } catch {
    return dateString;
  }
};

// URL 쿼리 파라미터 파싱
export const getQueryParam = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

// 디바운스 함수
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};
