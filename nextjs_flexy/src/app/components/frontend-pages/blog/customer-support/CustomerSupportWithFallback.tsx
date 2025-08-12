'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import CustomerSupportView from './CustomerSupportView';
import CustomerSupportList from './CustomerSupportList';

const CustomerSupportWithFallback = () => {
  const [useDatabase, setUseDatabase] = useState(true);
  const [checking, setChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkDatabaseAvailability();
  }, []);

  const checkDatabaseAvailability = async () => {
    try {
      // notices 테이블이 존재하는지 확인
      const { error } = await supabase
        .from('notices')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        // 테이블이 없는 경우
        console.log('Database tables not found, using local data');
        setUseDatabase(false);
      } else {
        // 테이블이 있는 경우
        console.log('Database tables found, using database');
        setUseDatabase(true);
      }
    } catch (err) {
      console.error('Error checking database:', err);
      setUseDatabase(false);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return null; // 또는 로딩 스피너
  }

  // DB 테이블이 있으면 CustomerSupportView (읽기 전용), 없으면 로컬 데이터 컴포넌트 사용
  return useDatabase ? <CustomerSupportView /> : <CustomerSupportList />;
};

export default CustomerSupportWithFallback;