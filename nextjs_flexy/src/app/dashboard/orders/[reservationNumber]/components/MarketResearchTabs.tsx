import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack
} from '@mui/material';
import { OrderData } from '../hooks/useOrderData';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface MarketResearchTabsProps {
  orderData: OrderData;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`market-research-tabpanel-${index}`}
      aria-labelledby={`market-research-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MarketResearchTabs: React.FC<MarketResearchTabsProps> = ({ orderData }) => {
  const [value, setValue] = useState(0);
  const serviceData = orderData.serviceData;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="시장조사 탭">
          <Tab icon={<BusinessIcon />} label="신청정보" iconPosition="start" />
          <Tab icon={<LocalShippingIcon />} label="공장정보" iconPosition="start" />
          <Tab icon={<InventoryIcon />} label="제품정보" iconPosition="start" />
          <Tab icon={<AttachMoneyIcon />} label="가격정보" iconPosition="start" />
          <Tab icon={<AttachFileIcon />} label="관련자료" iconPosition="start" />
        </Tabs>
      </Box>

      {/* 신청정보 탭 */}
      <TabPanel value={value} index={0}>
        <Stack spacing={3}>
          {/* 신청 정보 */}
          <Card variant="outlined" sx={{ bgcolor: 'info.lighter' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                신청 정보
              </Typography>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '15%' }}>
                      품명
                    </TableCell>
                    <TableCell sx={{ width: '35%' }}>{serviceData.product_name || '-'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '15%' }}>
                      조사수량
                    </TableCell>
                    <TableCell sx={{ width: '35%' }}>{serviceData.research_quantity?.toLocaleString() || '-'}개</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      신청일시
                    </TableCell>
                    <TableCell>{serviceData.created_at ? new Date(serviceData.created_at).toLocaleDateString('ko-KR') : '-'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      상세 페이지 URL
                    </TableCell>
                    <TableCell>
                      {serviceData.detail_page ? (
                        <a href={serviceData.detail_page} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                          {serviceData.detail_page}
                        </a>
                      ) : '없음'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      추가 요청사항
                    </TableCell>
                    <TableCell colSpan={3}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box>
                          <Typography variant="caption" color="text.secondary">MOQ 확인</Typography>
                          <Typography variant="body2">{serviceData.moq_check ? '확인 필요' : '미확인'}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                          <Typography variant="caption" color="text.secondary">로고 인쇄</Typography>
                          <Typography variant="body2">{serviceData.logo_required ? '요청' : '요청 없음'}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                          <Typography variant="caption" color="text.secondary">커스텀 박스</Typography>
                          <Typography variant="body2">{serviceData.custom_box_required ? '요청' : '요청 없음'}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 요청사항 */}
          <Card variant="outlined" sx={{ bgcolor: 'warning.lighter' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                요청사항
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {serviceData.requirements || '요청사항이 없습니다.'}
              </Typography>
            </CardContent>
          </Card>

          {/* 로고 상세정보 */}
          {serviceData.logo_details && (
            <Card variant="outlined" sx={{ bgcolor: 'primary.lighter' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  로고 인쇄 상세 정보
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {serviceData.logo_details}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* 박스 상세정보 */}
          {serviceData.box_details && (
            <Card variant="outlined" sx={{ bgcolor: 'secondary.lighter' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  박스 제작 상세 정보
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {serviceData.box_details}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      </TabPanel>

      {/* 공장정보 탭 */}
      <TabPanel value={value} index={1}>
        <Stack spacing={3}>
          <Card variant="outlined" sx={{ bgcolor: 'warning.lighter' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                공장 정보
              </Typography>
              <Table>
                <TableBody>
                  {/* 기업 신용정보 */}
                  <TableRow>
                    <TableCell colSpan={2} sx={{ bgcolor: 'info.lighter', fontWeight: 'bold', textAlign: 'center', borderTop: '2px solid #ddd' }}>
                      기업 신용정보
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '30%' }}>
                      업종
                    </TableCell>
                    <TableCell>{serviceData.industry_kr || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      법인/개인
                    </TableCell>
                    <TableCell>{serviceData.legal_type_kr || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      인원규모
                    </TableCell>
                    <TableCell>{serviceData.company_size_kr || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      개업시간
                    </TableCell>
                    <TableCell>{serviceData.established_date || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      영업범위
                    </TableCell>
                    <TableCell>{serviceData.business_scope_kr || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      등록자본
                    </TableCell>
                    <TableCell>{serviceData.registered_capital || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      등록주소
                    </TableCell>
                    <TableCell>{serviceData.registered_address || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      기업상태
                    </TableCell>
                    <TableCell>{serviceData.company_status || '조사중'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Stack>
      </TabPanel>

      {/* 제품정보 탭 */}
      <TabPanel value={value} index={2}>
        <Stack spacing={3}>
          <Card variant="outlined" sx={{ bgcolor: 'primary.lighter' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                제품 조사 정보
              </Typography>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '30%' }}>
                      소요시간
                    </TableCell>
                    <TableCell>{serviceData.work_duration || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      출고가격 (RMB)
                    </TableCell>
                    <TableCell>¥{serviceData.factory_price_rmb || '조사중'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      수출항
                    </TableCell>
                    <TableCell>{serviceData.export_port || '조사중'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 시장 동향 */}
          {serviceData.market_trends && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  시장 동향
                </Typography>
                <List>
                  {serviceData.market_trends.map((trend: string, idx: number) => (
                    <ListItem key={idx}>
                      <ListItemText primary={`• ${trend}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      </TabPanel>

      {/* 가격정보 탭 */}
      <TabPanel value={value} index={3}>
        <Stack spacing={3}>
          <Card variant="outlined" sx={{ bgcolor: 'success.lighter' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                가격 정보
              </Typography>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '30%' }}>
                      목표 단가
                    </TableCell>
                    <TableCell>{serviceData.target_price || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      실제 단가
                    </TableCell>
                    <TableCell>{serviceData.factory_candidates?.[0]?.price_per_unit || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      MOQ (최소주문수량)
                    </TableCell>
                    <TableCell>{serviceData.moq?.toLocaleString() || '-'}개</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      예상 주문량
                    </TableCell>
                    <TableCell>{serviceData.expected_order_quantity || `${serviceData.production_quantity?.toLocaleString()}개`}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 조사 결과 요약 */}
          {serviceData.research_findings && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  조사 결과 요약
                </Typography>
                <Table>
                  <TableBody>
                    {Object.entries(serviceData.research_findings).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '30%' }}>
                          {key}
                        </TableCell>
                        <TableCell>{value as string}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* 경쟁사 분석 */}
          {serviceData.competitor_analysis && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  경쟁사 분석
                </Typography>
                <Table>
                  <TableBody>
                    {Object.entries(serviceData.competitor_analysis).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50', width: '30%' }}>
                          {key}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(value) ? value.join(', ') : value as string}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Stack>
      </TabPanel>

      {/* 관련자료 탭 */}
      <TabPanel value={value} index={4}>
        <Stack spacing={3}>
          {/* 문서 자료 */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                조사 보고서
              </Typography>
              {orderData.status === 'completed' ? (
                <Stack spacing={2}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1">📄 시장 조사 보고서</Typography>
                    <Typography variant="caption" color="text.secondary">
                      중국 시장 내 해당 제품의 경쟁 현황 및 가격 분석
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1">📄 최적 공급업체 선정</Typography>
                    <Typography variant="caption" color="text.secondary">
                      검증된 공급업체 정보 및 상세 분석
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1">📄 견적서</Typography>
                    <Typography variant="caption" color="text.secondary">
                      선정된 공급업체의 상세 견적 및 조건
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1">📄 추천 의견</Typography>
                    <Typography variant="caption" color="text.secondary">
                      전문가의 공급업체 선택 가이드
                    </Typography>
                  </Paper>
                </Stack>
              ) : (
                <Alert severity="info">
                  조사가 완료되면 보고서가 제공됩니다.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 진행 상태 */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                진행 상태
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="1단계: 신청 접수"
                    secondary="완료"
                    secondaryTypographyProps={{ color: 'success.main' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="2단계: 결제 확인"
                    secondary={serviceData.payment_status === 'paid' ? '완료' : '대기 중'}
                    secondaryTypographyProps={{ 
                      color: serviceData.payment_status === 'paid' ? 'success.main' : 'warning.main' 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="3단계: 조사원 배정"
                    secondary={serviceData.assigned_researcher ? '완료' : '대기 중'}
                    secondaryTypographyProps={{ 
                      color: serviceData.assigned_researcher ? 'success.main' : 'warning.main' 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="4단계: 시장 조사 진행"
                    secondary={serviceData.research_start_date ? '진행 중' : '대기 중'}
                    secondaryTypographyProps={{ 
                      color: serviceData.research_start_date ? 'primary.main' : 'text.secondary' 
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="5단계: 보고서 작성"
                    secondary={orderData.status === 'completed' ? '완료' : '대기 중'}
                    secondaryTypographyProps={{ 
                      color: orderData.status === 'completed' ? 'success.main' : 'text.secondary' 
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Stack>
      </TabPanel>
    </Card>
  );
};

export default MarketResearchTabs;