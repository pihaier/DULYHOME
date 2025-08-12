'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  user_id: string;
  company_name?: string;
  contact_person?: string;
  phone?: string;
  role: 'customer' | 'chinese_staff' | 'korean_team' | 'admin' | 'inspector' | 'factory';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // 세금계산서 정보
  tax_company_name?: string;
  tax_registration_number?: string;
  tax_representative?: string;
  tax_address?: string;
  tax_business_type?: string;
  tax_business_item?: string;
  tax_email?: string;
  tax_phone?: string;
  tax_fax?: string;
  // 배송 정보
  business_number?: string;
  default_shipping_address?: string;
  default_receiver_name?: string;
  default_receiver_phone?: string;
}

interface GlobalContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  supabase: ReturnType<typeof createClient>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // supabase 인스턴스를 useMemo로 메모이제이션
  const supabase = React.useMemo(() => createClient(), []);
  const userRef = React.useRef<User | null>(null);
  const isRefreshingRef = React.useRef(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      
      // RLS가 비활성화되어 있으므로 SDK 직접 사용
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        // 프로필이 없으면 null 반환 (빈칸으로 표시)
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will show empty form');
          return null;
        }
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Exception in fetchUserProfile:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    // 이미 새로고침 중이면 중복 실행 방지
    if (isRefreshingRef.current) {
      return;
    }
    
    isRefreshingRef.current = true;
    setLoading(true);
    
    try {
      // 먼저 세션을 확인하여 인증 상태 체크
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setUserProfile(null);
        userRef.current = null;
        setLoading(false);
        return;
      }

      // 세션이 없으면 로그인하지 않은 상태
      if (!session) {
        setUser(null);
        setUserProfile(null);
        userRef.current = null;
        setLoading(false);
        return;
      }

      // 세션이 있으면 user 정보 설정
      setUser(session.user);
      userRef.current = session.user;

      if (session.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setUserProfile(null);
      userRef.current = null;
      setLoading(false);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // user 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let isInitialLoad = true;
    
    // 초기 사용자 상태 확인 - 즉시 실행
    refreshUser();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        
        // 초기 로드 중에는 모든 이벤트 무시 (refreshUser가 처리함)
        if (isInitialLoad) {
          // 첫 이벤트 후에는 초기 로드 플래그를 해제
          setTimeout(() => { isInitialLoad = false; }, 100);
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          // 이미 로그인된 사용자인지 확인
          if (userRef.current?.id === session.user.id) {
            return;
          }
          // SIGNED_IN 이벤트는 실제 로그인 시에만 처리
          await refreshUser();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // 토큰 갱신 시에는 프로필만 다시 가져옴
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // supabase를 의존성에서 제거

  const value: GlobalContextType = {
    user,
    userProfile,
    loading,
    refreshUser,
    supabase,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useUser() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a GlobalProvider');
  }
  return context;
}