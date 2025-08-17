import { uniqueId } from 'lodash';

import {
  IconBuildingFactory,
  IconChartPie,
  IconClipboardList,
  IconFileText,
  IconHome,
  IconMessage2,
  IconPackage,
  IconSearch,
  IconShoppingCart,
  IconTruck,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: '🏠 메인',
  },
  {
    id: uniqueId(),
    title: '마이페이지',
    icon: IconHome,
    href: '/dashboard',
  },
  {
    navlabel: true,
    subheader: '📋 서비스 신청',
  },
  {
    id: uniqueId(),
    title: '시장조사',
    icon: IconSearch,
    href: '/application/market-research',
    chip: 'MR',
    chipColor: 'primary',
  },
  {
    id: uniqueId(),
    title: '공장컨택',
    icon: IconBuildingFactory,
    href: '/application/factory-contact',
    chip: 'FC',
    chipColor: 'secondary',
  },
  {
    id: uniqueId(),
    title: '검품감사',
    icon: IconClipboardList,
    href: '/application/inspection',
    chip: 'QC',
    chipColor: 'success',
  },
  // 샘플링과 대량발주는 숨김 처리 (삭제하지 않음)
  // {
  //   id: uniqueId(),
  //   title: "샘플링",
  //   icon: IconPackage,
  //   href: "/application/import-agency/sampling",
  //   chip: "DLSP",
  //   chipColor: "secondary",
  // },
  // {
  //   id: uniqueId(),
  //   title: "대량발주",
  //   icon: IconTruck,
  //   href: "/application/import-agency/bulk-order",
  //   chip: "DLBO",
  //   chipColor: "warning",
  // },
  {
    navlabel: true,
    subheader: '🛒 구매대행',
  },
  {
    id: uniqueId(),
    title: '1688 장바구니',
    icon: IconShoppingCart,
    href: '/dashboard/1688/cart',
    chip: 'NEW',
    chipColor: 'error',
  },
  {
    navlabel: true,
    subheader: '📊 주문 조회',
  },
  {
    id: uniqueId(),
    title: '시장조사 조회',
    icon: IconSearch,
    href: '/dashboard/orders/market-research',
  },
  {
    id: uniqueId(),
    title: '공장컨택 조회',
    icon: IconBuildingFactory,
    href: '/dashboard/orders/factory-contact',
  },
  {
    id: uniqueId(),
    title: '검품감사 조회',
    icon: IconClipboardList,
    href: '/dashboard/orders/inspection',
  },
  // 샘플링과 대량주문 조회는 숨김 처리 (삭제하지 않음)
  // {
  //   id: uniqueId(),
  //   title: "샘플링 조회",
  //   icon: IconPackage,
  //   href: "/dashboard/orders/sampling",
  // },
  // {
  //   id: uniqueId(),
  //   title: "대량주문 조회",
  //   icon: IconTruck,
  //   href: "/dashboard/orders/bulk-order",
  // },
  {
    navlabel: true,
    subheader: '⚡ 빠른 액세스',
  },
  {
    id: uniqueId(),
    title: '내 프로필',
    icon: IconUserCircle,
    href: '/dashboard/profile',
  },
];

export default Menuitems;
