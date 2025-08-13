// Service type detection and routing utilities

export type ServiceType =
  | 'inspection'
  | 'market-research'
  | 'sampling'
  | 'bulk-order'
  | 'purchasing'
  | 'shipping'
  | 'unknown';

export interface ServiceTypeInfo {
  type: ServiceType;
  tableName: string;
  displayName: string;
  path: string;
}

/**
 * Get service type from reservation number prefix
 */
export function getServiceTypeFromReservationNumber(reservationNumber: string): ServiceType {
  const prefix = reservationNumber.split('-')[0];

  switch (prefix) {
    case 'DLKP':
    case 'IN':
      return 'inspection';
    case 'DLSY':
      return 'market-research';
    case 'DLSP':
      return 'sampling';
    case 'DLBO':
    case 'BO':
      return 'bulk-order';
    case 'DLGM':
      return 'purchasing';
    case 'DLBS':
      return 'shipping';
    default:
      return 'unknown';
  }
}

/**
 * Get service type information
 */
export function getServiceTypeInfo(serviceType: ServiceType): ServiceTypeInfo {
  const serviceMap: Record<ServiceType, ServiceTypeInfo> = {
    inspection: {
      type: 'inspection',
      tableName: 'inspection_applications',
      displayName: '검품감사',
      path: 'inspection',
    },
    'market-research': {
      type: 'market-research',
      tableName: 'market_research_requests',
      displayName: '시장조사',
      path: 'market-research',
    },
    sampling: {
      type: 'sampling',
      tableName: 'sample_orders',
      displayName: '샘플링',
      path: 'sampling',
    },
    'bulk-order': {
      type: 'bulk-order',
      tableName: 'bulk_orders',
      displayName: '대량주문',
      path: 'bulk-order',
    },
    purchasing: {
      type: 'purchasing',
      tableName: 'purchasing_orders',
      displayName: '구매대행',
      path: 'purchasing',
    },
    shipping: {
      type: 'shipping',
      tableName: 'shipping_agency_orders',
      displayName: '배송대행',
      path: 'shipping',
    },
    unknown: {
      type: 'unknown',
      tableName: '',
      displayName: '알 수 없음',
      path: '',
    },
  };

  return serviceMap[serviceType];
}

/**
 * Get all service tables for database queries
 */
export function getAllServiceTables(): ServiceTypeInfo[] {
  return [
    getServiceTypeInfo('inspection'),
    getServiceTypeInfo('market-research'),
    getServiceTypeInfo('sampling'),
    getServiceTypeInfo('bulk-order'),
    getServiceTypeInfo('purchasing'),
    getServiceTypeInfo('shipping'),
  ];
}

/**
 * Build service-specific detail page URL
 */
export function buildServiceDetailUrl(reservationNumber: string): string {
  const serviceType = getServiceTypeFromReservationNumber(reservationNumber);
  const serviceInfo = getServiceTypeInfo(serviceType);

  if (serviceType === 'unknown') {
    return `/dashboard/orders/${reservationNumber}`;
  }

  return `/dashboard/${serviceInfo.path}/${reservationNumber}`;
}
