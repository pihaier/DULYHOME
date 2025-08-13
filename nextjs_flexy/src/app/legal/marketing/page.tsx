'use client';
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function MarketingPage() {
  return (
    <PageContainer
      title="마케팅 정보 수신 동의"
      description="두리무역 ERP 서비스 마케팅 정보 수신 동의"
    >
      <Box sx={{ py: 4 }}>
        {/* 헤더 */}
        <Paper sx={{ p: 4, mb: 3, bgcolor: 'primary.lighter' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            마케팅 정보 수신 동의
          </Typography>
          <Typography variant="body1" color="text.secondary">
            두리무역 ERP 서비스의 마케팅 정보 수신에 관한 동의입니다.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label="선택 사항" size="small" color="info" />
            <Chip label="버전: 1.0" size="small" sx={{ ml: 1 }} />
          </Box>
        </Paper>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            마케팅 정보 수신은 선택사항이며, 동의하지 않으셔도 서비스 이용에는 제한이 없습니다. 동의
            후에도 언제든지 수신거부 하실 수 있습니다.
          </Typography>
        </Alert>

        {/* 마케팅 동의 내용 */}
        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제1조 (수집 및 이용 목적)
            </Typography>
            <Typography variant="body1" paragraph>
              두리무역(이하 "회사")은 다음과 같은 목적으로 마케팅 정보를 활용합니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 신규 서비스 안내 및 업데이트 소식" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 이벤트 및 프로모션 정보 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 중국 수입 시장 동향 및 유용한 정보 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서비스 이용 팁 및 교육 자료 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 맞춤형 서비스 추천" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 고객 만족도 조사 및 서비스 개선 안내" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제2조 (수집 항목)
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 이메일 주소" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 휴대전화번호" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서비스 이용 기록 및 관심 분야" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제3조 (발송 방법)
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 이메일" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• SMS/LMS/MMS" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 카카오톡 알림톡" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 앱 푸시 알림 (앱 서비스 출시 시)" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제4조 (발송 빈도)
            </Typography>
            <Typography variant="body1" paragraph>
              마케팅 정보는 다음과 같은 빈도로 발송됩니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="정기 뉴스레터" secondary="월 1~2회" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="이벤트 및 프로모션"
                  secondary="이벤트 진행 시 (월 최대 4회)"
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="중요 공지사항" secondary="필요 시" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제5조 (보유 및 이용 기간)
            </Typography>
            <Typography variant="body1" paragraph>
              마케팅 정보 수신 동의는 다음의 경우까지 유효합니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 회원 탈퇴 시까지" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 수신 동의 철회 시까지" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 2년간 서비스 미이용 시 자동 해지" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제6조 (동의 철회 방법)
            </Typography>
            <Typography variant="body1" paragraph>
              마케팅 정보 수신 동의는 언제든지 철회하실 수 있습니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="이메일 수신거부"
                  secondary="이메일 하단의 '수신거부' 링크 클릭"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="SMS 수신거부"
                  secondary="'수신거부' 또는 '080-XXX-XXXX'로 회신"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="마이페이지"
                  secondary="로그인 후 마이페이지 > 알림 설정에서 변경"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="고객센터"
                  secondary="031-699-8781 또는 duly@duly.co.kr로 연락"
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제7조 (개인정보 보호)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 수집된 개인정보는 마케팅 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 단, 다음의 경우는 예외로 합니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 이용자가 사전에 동의한 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 법령의 규정에 의한 경우" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              3. 마케팅 위탁 업체:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="이메일 발송" secondary="SendGrid, AWS SES 활용" />
              </ListItem>
              <ListItem>
                <ListItemText primary="SMS 발송" secondary="알리고, 솔루션링크 활용" />
              </ListItem>
              <ListItem>
                <ListItemText primary="카카오톡 알림톡" secondary="카카오비즈니스 활용" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제8조 (혜택 안내)
            </Typography>
            <Typography variant="body1" paragraph>
              마케팅 정보 수신 동의 고객님께는 다음과 같은 혜택을 제공합니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 신규 기능 우선 체험 기회" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 특별 할인 쿠폰 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 중국 시장 동향 리포트 무료 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• VIP 고객 전용 이벤트 초대" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제9조 (문의처)
            </Typography>
            <Typography variant="body1" paragraph>
              마케팅 정보 수신과 관련한 문의사항은 아래로 연락주시기 바랍니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="고객센터" secondary="031-699-8781 (평일 09:00~18:00)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="이메일" secondary="duly@duly.co.kr" />
              </ListItem>
              <ListItem>
                <ListItemText primary="카카오톡 채널" secondary="@두리무역" />
              </ListItem>
            </List>
          </Box>

          {/* 부칙 */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              부칙
            </Typography>
            <Typography variant="body2" paragraph>
              본 마케팅 정보 수신 동의는 2025년 2월 1일부터 시행됩니다.
            </Typography>
            <Typography variant="body2">
              동의 내용 변경 시 이메일 또는 서비스 내 공지를 통해 안내드립니다.
            </Typography>
          </Box>

          {/* 회사 정보 */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.lighter', borderRadius: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              회사 정보
            </Typography>
            <Typography variant="body2">상호: 두리무역</Typography>
            <Typography variant="body2">대표자: 김두호</Typography>
            <Typography variant="body2">사업자등록번호: 605-29-80697</Typography>
            <Typography variant="body2">
              주소: 인천광역시 연수구 센트럴로 313 B2512 (송도동, 송도 센트로드)
            </Typography>
            <Typography variant="body2">마케팅 문의: duly@duly.co.kr</Typography>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
