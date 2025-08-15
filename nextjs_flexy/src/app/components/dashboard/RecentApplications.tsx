'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Fab, Stack, Chip, Skeleton } from '@mui/material';
import DashboardCard from '../shared/DashboardCard';
import { IconSearch, IconBuildingFactory, IconClipboardList } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/GlobalContext';

interface Application {
  id: string;
  reservation_number: string;
  product_name: string;
  company_name?: string;
  status: string;
  created_at: string;
  service_type: 'market_research' | 'factory_contact' | 'inspection';
}

const RecentApplications = () => {
  const router = useRouter();
  const { user } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentApplications();
    }
  }, [user]);

  const fetchRecentApplications = async () => {
    try {
      const supabase = createClient();
      const allApplications: Application[] = [];

      // 시장조사 신청 (내 것만)
      const { data: marketResearch } = await supabase
        .from('market_research_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (marketResearch) {
        allApplications.push(
          ...marketResearch.map((app) => ({
            ...app,
            service_type: 'market_research' as const,
          }))
        );
      }

      // 공장컨택 신청 (내 것만)
      const { data: factoryContact } = await supabase
        .from('factory_contact_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (factoryContact) {
        allApplications.push(
          ...factoryContact.map((app) => ({
            ...app,
            service_type: 'factory_contact' as const,
          }))
        );
      }

      // 검품 신청 (내 것만)
      const { data: inspection } = await supabase
        .from('inspection_applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (inspection) {
        allApplications.push(
          ...inspection.map((app) => ({
            ...app,
            service_type: 'inspection' as const,
          }))
        );
      }

      // 시간순 정렬 후 최근 10개만
      const sortedApplications = allApplications
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setApplications(sortedApplications);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'market_research':
        return <IconSearch width={20} height={20} />;
      case 'factory_contact':
        return <IconBuildingFactory width={20} height={20} />;
      case 'inspection':
        return <IconClipboardList width={20} height={20} />;
      default:
        return <IconClipboardList width={20} height={20} />;
    }
  };

  const getServiceInfo = (serviceType: string) => {
    switch (serviceType) {
      case 'market_research':
        return { name: '시장조사', color: 'primary' as const, bg: 'primary.light' };
      case 'factory_contact':
        return { name: '공장컨택', color: 'secondary' as const, bg: 'secondary.light' };
      case 'inspection':
        return { name: '검품감사', color: 'success' as const, bg: 'success.light' };
      default:
        return { name: serviceType, color: 'default' as const, bg: 'grey.light' };
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Chip label="접수완료" size="small" color="info" />;
      case 'in_progress':
        return <Chip label="진행중" size="small" color="warning" />;
      case 'completed':
        return <Chip label="완료" size="small" color="success" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleClick = (app: Application) => {
    const prefix = app.reservation_number.split('-')[0];
    let serviceRoute = '';

    switch (prefix) {
      case 'MR':
        serviceRoute = 'market-research';
        break;
      case 'FC':
        serviceRoute = 'factory-contact';
        break;
      case 'IN':
        serviceRoute = 'inspection';
        break;
    }

    if (serviceRoute) {
      router.push(`/dashboard/orders/${serviceRoute}/${app.reservation_number}`);
    }
  };

  return (
    <DashboardCard title="내 최근 신청" subtitle="내가 신청한 서비스 현황">
      <Box>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Stack key={index} direction="row" alignItems="center" mt={2} pt={1}>
              <Skeleton variant="circular" width={45} height={45} />
              <Box ml={2} flex={1}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
              <Skeleton variant="rectangular" width={60} height={24} />
            </Stack>
          ))
        ) : applications.length > 0 ? (
          applications.map((app) => {
            const serviceInfo = getServiceInfo(app.service_type);
            return (
              <Stack
                key={app.id}
                direction="row"
                alignItems="center"
                mt={2}
                pt={1}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderRadius: 1,
                  px: 1,
                }}
                onClick={() => handleClick(app)}
              >
                <Fab
                  sx={{
                    backgroundColor: serviceInfo.bg,
                    color: `${serviceInfo.color}.main`,
                    boxShadow: 'none',
                    height: '45px',
                    width: '45px',
                    borderRadius: '10px',
                    '&:hover': {
                      backgroundColor: serviceInfo.bg,
                    },
                  }}
                  aria-label={serviceInfo.name}
                >
                  {getServiceIcon(app.service_type)}
                </Fab>
                <Box ml={2} flex={1}>
                  <Typography variant="h5">{app.product_name}</Typography>
                  <Typography color="textSecondary" variant="h6" fontWeight="400">
                    {app.reservation_number} • {serviceInfo.name}
                  </Typography>
                </Box>
                <Box>{getStatusChip(app.status)}</Box>
              </Stack>
            );
          })
        ) : (
          <Typography color="textSecondary" textAlign="center" py={3}>
            신청 내역이 없습니다
          </Typography>
        )}
      </Box>
    </DashboardCard>
  );
};

export default RecentApplications;
