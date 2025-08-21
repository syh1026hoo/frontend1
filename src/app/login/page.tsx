'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { session } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Login() {
  const router = useRouter();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const clearAlert = () => setAlert(null);

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
    setTimeout(clearAlert, 5000); // 5초 후 자동 제거
  };

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    clearAlert();
    setLoginData({ username: '', password: '' });
    setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlert();

    if (!loginData.username.trim() || !loginData.password.trim()) {
      showAlert('사용자명과 비밀번호를 입력해주세요.', 'error');
      return;
    }

    console.log('Login attempt:', loginData); // 디버깅용
    setIsLoading(true);
    try {
      const response = await userApi.login(loginData);
      console.log('=== 로그인 API 응답 전체 ===');
      console.log('전체 응답:', response);
      console.log('응답 데이터:', response.data);
      console.log('성공 여부:', response.data.success);
      console.log('사용자 데이터 (data 필드):', response.data.data);
      console.log('사용자 데이터 (user 필드):', response.data.user);
      console.log('user 필드 타입:', typeof response.data.user);
      
      if (response.data.success) {
        // 백엔드에서는 'user' 필드로 사용자 데이터를 반환
        const userData = response.data.user; // data가 아니라 user 필드
        console.log('=== 로그인 성공 ===');
        console.log('서버에서 받은 사용자 데이터:', userData);
        
        showAlert('로그인에 성공했습니다!', 'success');
        
        // 세션에 로그인 정보 저장
        console.log('세션에 데이터 저장 중...');
        session.set('isLoggedIn', true);
        session.set('user', userData);
        
        // 저장 확인
        const savedLoginStatus = session.get('isLoggedIn');
        const savedUser = session.get('user');
        console.log('저장 후 세션 확인:', {
          isLoggedIn: savedLoginStatus,
          isLoggedInType: typeof savedLoginStatus,
          user: savedUser,
          userType: typeof savedUser,
          userId: savedUser ? savedUser.id : 'no id'
        });
        
        // 세션 스토리지 직접 확인
        console.log('SessionStorage 직접 확인:');
        console.log('  isLoggedIn:', sessionStorage.getItem('isLoggedIn'));
        console.log('  user:', sessionStorage.getItem('user'));
        
        // 페이지 새로고침으로 네비게이션 상태 업데이트
        setTimeout(() => {
          console.log('홈페이지로 리다이렉트 중...');
          window.location.href = '/';
        }, 1000); // 디버깅을 위해 딜레이 증가
      } else {
        showAlert(response.data.message || '로그인에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Login failed:', error);
      showAlert('로그인 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlert();

    if (!registerData.username.trim()) {
      showAlert('사용자명을 입력해주세요.', 'error');
      return;
    }
    if (!registerData.email.trim()) {
      showAlert('이메일을 입력해주세요.', 'error');
      return;
    }
    if (!registerData.password.trim()) {
      showAlert('비밀번호를 입력해주세요.', 'error');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      showAlert('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    console.log('Register attempt:', registerData); // 디버깅용
    setIsLoading(true);
    try {
      const response = await userApi.register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
      console.log('=== 회원가입 API 응답 ===');
      console.log('전체 응답:', response);
      console.log('응답 데이터:', response.data);
      console.log('성공 여부:', response.data.success);
      console.log('사용자 데이터:', response.data.user);
      
      if (response.data.success) {
        showAlert('회원가입이 완료되었습니다! 로그인해주세요.', 'success');
        
        // 로그인 폼으로 전환
        setTimeout(() => {
          setIsLoginForm(true);
          setRegisterData({ username: '', email: '', password: '', confirmPassword: '' });
          clearAlert();
        }, 2000);
      } else {
        showAlert(response.data.message || '회원가입에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Register failed:', error);
      showAlert('회원가입 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {isLoginForm ? '로그인' : '회원가입'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginForm ? 'ETF 정보 플랫폼에 로그인하세요' : '새 계정을 만들어보세요'}
          </p>
        </div>

        {/* 알림 메시지 */}
        {alert && (
          <div className={`rounded-lg p-4 ${
            alert.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              {alert.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              )}
              <span className={`text-sm ${
                alert.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {alert.message}
              </span>
            </div>
          </div>
        )}

        {/* 폼 컨테이너 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {isLoginForm ? (
            // 로그인 폼
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="loginUsername" className="block text-sm font-medium text-gray-700 mb-2">
                  사용자명
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="loginUsername"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="사용자명을 입력하세요"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="비밀번호를 입력하세요"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          ) : (
            // 회원가입 폼
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="registerUsername" className="block text-sm font-medium text-gray-700 mb-2">
                  사용자명
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="registerUsername"
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="사용자명을 입력하세요"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="registerEmail"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="이메일을 입력하세요"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="registerPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="비밀번호를 입력하세요"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="비밀번호를 다시 입력하세요"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    가입 중...
                  </>
                ) : (
                  '회원가입'
                )}
              </button>
            </form>
          )}

          {/* 폼 전환 버튼 */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              {isLoginForm ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            </span>
            <button
              onClick={toggleForm}
              disabled={isLoading}
              className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              {isLoginForm ? '회원가입' : '로그인'}
            </button>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            로그인하시면 관심종목 관리, 개인화된 추천 등의 서비스를 이용하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
