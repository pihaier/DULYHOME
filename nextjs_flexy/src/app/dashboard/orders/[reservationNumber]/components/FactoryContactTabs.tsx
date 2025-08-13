import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  Alert,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { OrderData } from '../hooks/useOrderData';

interface FactoryContactTabsProps {
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
      id={`factory-contact-tabpanel-${index}`}
      aria-labelledby={`factory-contact-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const FactoryContactTabs: React.FC<FactoryContactTabsProps> = ({ orderData }) => {
  const [value, setValue] = useState(0);
  const serviceData = orderData.serviceData;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="공장컨택 탭">
          <Tab label="기본정보" />
          <Tab label="공장현황" />
          <Tab label="거래조건" />
          <Tab label="진행상황" />
          <Tab label="문서/샘플" />
        </Tabs>
      </Box>

      {/* 기본정보 탭 */}
      <TabPanel value={value} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              제품 정보
            </Typography>
            <List>
              <ListItem divider>
                <ListItemText primary="제품명 (한국어)" secondary={serviceData.product_name} />
              </ListItem>

              <ListItem divider>
                <ListItemText primary="카테고리" secondary={serviceData.product_category} />
              </ListItem>
              <ListItem divider>
                <ListItemText
                  primary="목표 단가"
                  secondary={`₩${serviceData.target_price?.toLocaleString()} / ${serviceData.target_price_rmb}`}
                />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="MOQ" secondary={`${serviceData.moq?.toLocaleString()}개`} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="첫 주문 수량"
                  secondary={`${serviceData.first_order_quantity?.toLocaleString()}개`}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              상세 사양
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }} elevation={0}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {serviceData.required_specs}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 공장현황 탭 */}
      <TabPanel value={value} index={1}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          공장 컨택 현황
        </Typography>
        <Stack spacing={2}>
          {serviceData.preferred_factories?.map((factory: any, idx: number) => (
            <Paper key={idx} sx={{ p: 2 }} elevation={0} variant="outlined">
              <Typography variant="subtitle1" fontWeight="bold">
                {factory.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {factory.location}
              </Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2">담당자: {factory.contact}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2">견적: {factory.quote}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2">납기: {factory.lead_time}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Chip
                    label={factory.status}
                    size="small"
                    color={factory.status === '견적 접수완료' ? 'success' : 'warning'}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>

        {serviceData.factory_audit_score && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              공장 평가 점수
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(serviceData.factory_audit_score).map(([factory, score]) => (
                <Grid size={{ xs: 12, md: 4 }} key={factory}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2">{factory}</Typography>
                      <Typography variant="h4" color="primary">
                        {String(score)}점
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </TabPanel>

      {/* 거래조건 탭 */}
      <TabPanel value={value} index={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              거래 조건
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>배송 조건</TableCell>
                  <TableCell>{serviceData.delivery_terms}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>결제 조건</TableCell>
                  <TableCell>{serviceData.payment_terms}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>검품 조건</TableCell>
                  <TableCell>{serviceData.inspection_terms}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>보증 조건</TableCell>
                  <TableCell>{serviceData.warranty_terms}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              인증 현황
            </Typography>
            <Stack spacing={1}>
              {serviceData.certification_status &&
                Object.entries(serviceData.certification_status).map(([cert, status]) => (
                  <Box
                    key={cert}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="body2">{cert}</Typography>
                    <Chip
                      label={String(status)}
                      size="small"
                      color={
                        String(status) === '보유'
                          ? 'success'
                          : String(status) === '진행중'
                            ? 'warning'
                            : 'default'
                      }
                    />
                  </Box>
                ))}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            특별 요구사항
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {serviceData.special_requirements}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* 진행상황 탭 */}
      <TabPanel value={value} index={3}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          컨택 진행 이력
        </Typography>
        <Stack spacing={2}>
          {serviceData.contact_progress?.map((progress: any, idx: number) => (
            <Paper key={idx} sx={{ p: 2 }} elevation={0} variant="outlined">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    날짜
                  </Typography>
                  <Typography variant="body2">{progress.date}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    공장
                  </Typography>
                  <Typography variant="body2">{progress.factory}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    진행 내용
                  </Typography>
                  <Typography variant="body2">{progress.action}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    결과
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {progress.result}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>

        {serviceData.confirmation_requests && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              확인 요청 사항
            </Typography>
            <Stack spacing={2}>
              {serviceData.confirmation_requests.map((req: any) => (
                <Card key={req.id} variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {req.title}
                      </Typography>
                      <Chip
                        label={req.status === 'confirmed' ? '확인완료' : '대기중'}
                        color={req.status === 'confirmed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {req.description}
                    </Typography>
                    {req.status === 'confirmed' && (
                      <Typography variant="body2" color="primary">
                        고객 응답: {req.customer_response}
                      </Typography>
                    )}
                    {req.deadline && req.status !== 'confirmed' && (
                      <Typography variant="caption" color="error">
                        마감일: {req.deadline}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </TabPanel>

      {/* 문서/샘플 탭 */}
      <TabPanel value={value} index={4}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              샘플 정보
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <List dense>
                  <ListItem divider>
                    <ListItemText primary="샘플 상태" />
                    <Chip
                      label={serviceData.sample_status}
                      size="small"
                      color={serviceData.sample_status === '발송완료' ? 'success' : 'warning'}
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary="운송장 번호" secondary={serviceData.sample_tracking} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="도착 예정일"
                      secondary={serviceData.sample_received_date}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="피드백 상태" secondary={serviceData.sample_feedback} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              문서 자료
            </Typography>
            <Stack spacing={1}>
              {serviceData.documents?.map((doc: any, idx: number) => (
                <Card key={idx} variant="outlined">
                  <CardContent sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2">📄 {doc.name}</Typography>
                      <Button size="small" disabled>
                        다운로드
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Alert severity="info">모든 문서는 계약 체결 후 원본이 제공됩니다.</Alert>
        </Box>
      </TabPanel>
    </Card>
  );
};

export default FactoryContactTabs;
