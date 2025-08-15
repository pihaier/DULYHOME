import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface OrderData {
  id: string;
  reservationNumber: string;
  serviceType: string;
  status: string;
  createdAt: string;
  companyName?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  [key: string]: any;
}

export function useOrderData(reservationNumber: string) {
  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const getServiceType = (reservationNumber: string) => {
    const prefix = reservationNumber.split('-')[0];
    switch (prefix) {
      case 'DLSY':
        return 'market_research';
      case 'IN':
        return 'inspection';
      case 'DLSP':
        return 'sampling';
      case 'BO':
      case 'DLBO':
        return 'bulk_order';
      default:
        return null;
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const serviceType = getServiceType(reservationNumber);
      if (!serviceType) {
        throw new Error('유효하지 않은 예약번호입니다.');
      }

      let orderData: OrderData | null = null;

      // 서비스별 직접 조회 (API Route 사용하지 않음)
      switch (serviceType) {
        case 'market_research': {
          const { data, error } = await supabase
            .from('market_research_requests')
            .select(
              `
              *,
              market_research_info!inner(*),
              market_research_suppliers!inner(*),
              market_research_products!inner(*),
              market_research_samples!inner(*)
            `
            )
            .eq('reservation_number', reservationNumber)
            .single();

          if (error) throw error;
          orderData = {
            ...data,
            serviceType: 'market_research',
            // 탭별로 데이터 정리
            applicationInfo: {
              companyName: data.company_name,
              contactPerson: data.contact_person,
              contactPhone: data.contact_phone,
              contactEmail: data.contact_email,
              productName: data.product_name,
              targetPrice: data.target_price,
              targetMinOrder: data.target_min_order,
              expectedQuantity: data.expected_quantity,
              surveyPeriod: data.survey_period,
              additionalRequests: data.additional_requests,
            },
            factoryInfo: data.market_research_suppliers?.[0] || {},
            productInfo: data.market_research_products?.[0] || {},
            priceInfo: data.market_research_info?.[0] || {},
            sampleInfo: data.market_research_samples?.[0] || {},
          };
          break;
        }

        case 'inspection': {
          const { data, error } = await supabase
            .from('inspection_applications')
            .select('*')
            .eq('reservation_number', reservationNumber)
            .single();

          if (error) throw error;
          orderData = {
            ...data,
            serviceType: 'inspection',
          };
          break;
        }

        case 'sampling': {
          // orders 테이블과 sample_orders 테이블 조인
          const { data: samplingData, error: orderError } = await supabase
            .from('orders')
            .select(
              `
              *,
              sample_orders!inner(*)
            `
            )
            .eq('reservation_number', reservationNumber)
            .single();

          if (orderError) throw orderError;

          orderData = {
            ...samplingData,
            serviceType: 'sampling',
            sampleItems: samplingData.sample_orders || [],
          };
          break;
        }

        case 'bulk_order': {
          const { data, error } = await supabase
            .from('bulk_orders')
            .select(
              `
              *,
              orders!inner(*)
            `
            )
            .eq('reservation_number', reservationNumber)
            .single();

          if (error) throw error;
          orderData = {
            ...data,
            ...data.orders,
            serviceType: 'bulk_order',
          };
          break;
        }
      }

      // 사용자 권한 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        // 고객은 회사 정보 필드 숨김
        if (profile?.role === 'customer' && orderData) {
          delete orderData.companyName;
          delete orderData.contactPerson;
          delete orderData.contactPhone;
          delete orderData.contactEmail;

          if (orderData.applicationInfo) {
            delete orderData.applicationInfo.companyName;
            delete orderData.applicationInfo.contactPerson;
            delete orderData.applicationInfo.contactPhone;
            delete orderData.applicationInfo.contactEmail;
          }
        }
      }

      setData(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reservationNumber) {
      fetchOrderDetails();
    }
  }, [reservationNumber]);

  return { data, loading, error, refetch: fetchOrderDetails };
}
