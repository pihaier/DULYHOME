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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function PrivacyPage() {
  const sections = [
    { id: 'overview', title: '개인정보 처리방침 개요' },
    { id: 'collection', title: '제1조 개인정보의 수집 항목 및 수집 방법' },
    { id: 'purpose', title: '제2조 개인정보의 수집 및 이용 목적' },
    { id: 'retention', title: '제3조 개인정보의 보유 및 이용 기간' },
    { id: 'thirdparty', title: '제4조 개인정보의 제3자 제공' },
    { id: 'consignment', title: '제5조 개인정보처리의 위탁' },
    { id: 'rights', title: '제6조 정보주체의 권리와 의무 및 행사방법' },
    { id: 'destruction', title: '제7조 개인정보의 파기' },
    { id: 'safety', title: '제8조 개인정보의 안전성 확보조치' },
    { id: 'officer', title: '제9조 개인정보보호책임자' },
    { id: 'amendment', title: '제10조 개인정보처리방침의 변경' },
    { id: 'remedy', title: '제11조 권익침해 구제방법' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const thirdPartyProviders = [
    {
      recipient: 'OpenAI (GPT-4)',
      purpose: '실시간 한중 번역 서비스 제공',
      items: '채팅 메시지, 문서 내용',
      period: '서비스 이용 시점',
      country: '미국',
    },
    {
      recipient: 'Amazon Web Services (AWS)',
      purpose: '클라우드 인프라 및 데이터 저장',
      items: '서비스 이용 데이터 전체',
      period: '서비스 이용 기간',
      country: '미국/한국',
    },
    {
      recipient: 'Supabase',
      purpose: '데이터베이스 관리 및 인증 서비스',
      items: '회원정보, 서비스 이용 데이터',
      period: '서비스 이용 기간',
      country: '미국',
    },
    {
      recipient: '중국 현지 협력사',
      purpose: '시장조사, 공장컨택, 검품 서비스 수행',
      items: '회사명, 담당자명, 연락처, 제품정보',
      period: '서비스 제공 기간',
      country: '중국',
    },
    {
      recipient: '관세사무소',
      purpose: '수입통관 업무 처리',
      items: '사업자정보, 수입신고 관련 정보',
      period: '통관 업무 처리 기간',
      country: '한국',
    },
    {
      recipient: '법무법인',
      purpose: '법률 자문 및 분쟁 해결',
      items: '분쟁 관련 정보',
      period: '법률 업무 처리 기간',
      country: '한국',
    },
  ];

  return (
    <PageContainer title="개인정보처리방침" description="두리무역 ERP 서비스 개인정보처리방침">
      <Box sx={{ py: 4 }}>
        {/* 헤더 */}
        <Paper sx={{ p: 4, mb: 3, bgcolor: 'primary.lighter' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            개인정보처리방침
          </Typography>
          <Typography variant="body1" color="text.secondary">
            두리무역 ERP 서비스의 개인정보 처리에 관한 방침입니다.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label="시행일: 2025년 2월 1일" size="small" />
            <Chip label="버전: 1.0" size="small" sx={{ ml: 1 }} />
          </Box>
        </Paper>

        {/* 중요 알림 */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            두리무역(이하 '회사')은 개인정보보호법에 따라 이용자의 개인정보를 보호하고 있으며,
            개인정보와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이
            개인정보처리방침을 수립·공개합니다.
          </Typography>
        </Alert>

        {/* 목차 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            목차
          </Typography>
          <List dense>
            {sections.map((section) => (
              <ListItem
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                  },
                  cursor: 'pointer',
                }}
              >
                <ListItemText primary={section.title} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* 개인정보처리방침 내용 */}
        <Paper sx={{ p: 4 }}>
          <Box id="overview" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              개인정보 처리방침 개요
            </Typography>
            <Typography variant="body1" paragraph>
              두리무역 ERP 서비스는 회원의 개인정보를 매우 중요하게 생각하며, 『개인정보보호법』,
              『정보통신망 이용촉진 및 정보보호 등에 관한 법률』 등 관련 법령을 준수하고 있습니다.
            </Typography>
            <Typography variant="body1" paragraph>
              본 개인정보처리방침은 회사가 제공하는 서비스 이용 과정에서 어떤 정보를 수집하고,
              어떻게 사용하며, 어떻게 보호하는지에 대해 설명합니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="collection" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제1조 개인정보의 수집 항목 및 수집 방법
            </Typography>

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              1. 수집하는 개인정보 항목
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              회원가입 시 (필수)
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• 이메일 주소" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 비밀번호 (암호화 저장)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 이름 (담당자명)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 회사명" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 휴대전화번호" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 사업자등록번호 (사업자 회원)" />
              </ListItem>
            </List>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              서비스 이용 시 (선택)
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• 회사 주소" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 팩스번호" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 제품 정보 (품명, 규격, 수량 등)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 공장 정보 (공장명, 담당자, 연락처 등)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 결제 정보 (카드번호 일부, 결제 내역)" />
              </ListItem>
            </List>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              자동 수집 정보
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• IP 주소" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 쿠키 (Cookie)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 접속 로그" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서비스 이용 기록" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 기기 정보 (OS, 브라우저 종류 등)" />
              </ListItem>
            </List>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
              2. 개인정보 수집 방법
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 홈페이지 회원가입 및 서비스 신청" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서면 양식" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 이메일, 팩스, 전화" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 생성정보 수집 툴을 통한 자동 수집" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="purpose" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제2조 개인정보의 수집 및 이용 목적
            </Typography>

            <Typography variant="body1" paragraph>
              회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              1. 서비스 제공에 관한 계약 이행 및 서비스 제공
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• 시장조사 서비스 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 공장컨택 서비스 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 검품 서비스 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 구매대행 서비스 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 통관 및 배송 서비스 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 실시간 번역 서비스 제공" />
              </ListItem>
            </List>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              2. 회원 관리
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• 회원제 서비스 이용에 따른 본인확인" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 개인식별" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 불량회원의 부정 이용 방지" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 가입 의사 확인" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 고충처리" />
              </ListItem>
            </List>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              3. 마케팅 및 광고에 활용
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• 신규 서비스 개발 및 맞춤 서비스 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 이벤트 및 광고성 정보 제공 (동의한 회원에 한함)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서비스 이용 통계" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="retention" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제3조 개인정보의 보유 및 이용 기간
            </Typography>

            <Typography variant="body1" paragraph>
              원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              1. 회사 내부 방침에 의한 정보보유
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• 부정이용기록" secondary="보존 기간: 1년" />
              </ListItem>
            </List>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              2. 관련 법령에 의한 정보보유
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="• 계약 또는 청약철회 등에 관한 기록"
                  secondary="보존 근거: 전자상거래법 / 보존 기간: 5년"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 대금결제 및 재화 등의 공급에 관한 기록"
                  secondary="보존 근거: 전자상거래법 / 보존 기간: 5년"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 소비자의 불만 또는 분쟁처리에 관한 기록"
                  secondary="보존 근거: 전자상거래법 / 보존 기간: 3년"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 웹사이트 방문기록"
                  secondary="보존 근거: 통신비밀보호법 / 보존 기간: 3개월"
                />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="thirdparty" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제4조 개인정보의 제3자 제공
            </Typography>

            <Typography variant="body1" paragraph>
              회사는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 범위 내에서 처리하며, 이용자의
              사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다. 다만,
              아래의 경우에는 예외로 합니다.
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
              개인정보 제3자 제공 현황
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>제공받는 자</TableCell>
                    <TableCell>제공 목적</TableCell>
                    <TableCell>제공 항목</TableCell>
                    <TableCell>보유/이용 기간</TableCell>
                    <TableCell>국가</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {thirdPartyProviders.map((provider, index) => (
                    <TableRow key={index}>
                      <TableCell>{provider.recipient}</TableCell>
                      <TableCell>{provider.purpose}</TableCell>
                      <TableCell>{provider.items}</TableCell>
                      <TableCell>{provider.period}</TableCell>
                      <TableCell>{provider.country}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>해외 이전 고지:</strong> OpenAI, AWS, Supabase는 미국에 서버를 두고 있어
                개인정보가 해외로 이전됩니다. 해당 서비스들은 각자의 개인정보보호정책에 따라 정보를
                안전하게 관리하고 있습니다.
              </Typography>
            </Alert>

            <Typography variant="body1" sx={{ mt: 2 }}>
              위의 경우를 제외하고는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="consignment" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제5조 개인정보처리의 위탁
            </Typography>

            <Typography variant="body1" paragraph>
              회사는 서비스 향상을 위해 아래와 같이 개인정보를 위탁하고 있으며, 관계 법령에 따라
              위탁계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 사항을 규정하고 있습니다.
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>수탁업체</TableCell>
                    <TableCell>위탁업무 내용</TableCell>
                    <TableCell>보유 및 이용기간</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Amazon Web Services</TableCell>
                    <TableCell>클라우드 서버 운영 및 관리</TableCell>
                    <TableCell>회원 탈퇴 시 또는 위탁계약 종료 시</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Supabase</TableCell>
                    <TableCell>데이터베이스 관리 및 인증 서비스</TableCell>
                    <TableCell>회원 탈퇴 시 또는 위탁계약 종료 시</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>OpenAI</TableCell>
                    <TableCell>AI 번역 서비스 제공</TableCell>
                    <TableCell>서비스 이용 완료 즉시</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Vercel</TableCell>
                    <TableCell>웹 호스팅 서비스</TableCell>
                    <TableCell>회원 탈퇴 시 또는 위탁계약 종료 시</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="rights" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제6조 정보주체의 권리와 의무 및 행사방법
            </Typography>

            <Typography variant="body1" paragraph>
              이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
            </Typography>

            <List>
              <ListItem>
                <ListItemText
                  primary="1. 개인정보 열람권"
                  secondary="이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있습니다."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. 개인정보 정정·삭제권"
                  secondary="이용자는 언제든지 자신의 개인정보에 대한 정정 또는 삭제를 요청할 수 있습니다."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. 개인정보 처리정지권"
                  secondary="이용자는 언제든지 개인정보 처리의 정지를 요청할 수 있습니다."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="4. 동의철회권"
                  secondary="이용자는 언제든지 개인정보 수집 및 이용에 대한 동의를 철회할 수 있습니다."
                />
              </ListItem>
            </List>

            <Typography variant="body1" paragraph>
              위의 권리 행사는 회사에 대해 서면, 전화, 이메일 등을 통하여 하실 수 있으며, 회사는
              이에 대해 지체 없이 조치하겠습니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="destruction" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제7조 개인정보의 파기
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              1. 파기절차
            </Typography>
            <Typography variant="body1" paragraph>
              이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에
              따라 일정기간 저장된 후 혹은 즉시 파기됩니다.
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold">
              2. 파기방법
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다." />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다." />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="safety" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제8조 개인정보의 안전성 확보조치
            </Typography>

            <Typography variant="body1" paragraph>
              회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
            </Typography>

            <List>
              <ListItem>
                <ListItemText
                  primary="1. 관리적 조치"
                  secondary="내부관리계획 수립·시행, 정기적 직원 교육 등"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="2. 기술적 조치"
                  secondary="개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="3. 물리적 조치"
                  secondary="전산실, 자료보관실 등의 접근통제"
                />
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>보안 기술:</strong> 모든 비밀번호는 bcrypt로 암호화되며, 중요 데이터는
                AES-256 암호화를 적용합니다. SSL/TLS 프로토콜을 통해 전송 구간 암호화를 적용하고
                있습니다.
              </Typography>
            </Alert>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="officer" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제9조 개인정보보호책임자
            </Typography>

            <Typography variant="body1" paragraph>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고
              있습니다.
            </Typography>

            <Paper sx={{ p: 2, bgcolor: 'grey.50' }} variant="outlined">
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                개인정보보호책임자
              </Typography>
              <Typography variant="body2">성명: 김두호</Typography>
              <Typography variant="body2">직책: 대표이사</Typography>
              <Typography variant="body2">연락처: 031-699-8781</Typography>
              <Typography variant="body2">이메일: duly@duly.co.kr</Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }} variant="outlined">
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                개인정보보호 담당부서
              </Typography>
              <Typography variant="body2">부서명: 개인정보보호팀</Typography>
              <Typography variant="body2">담당자: 이준호</Typography>
              <Typography variant="body2">연락처: 031-699-8781</Typography>
              <Typography variant="body2">이메일: duly@duly.co.kr</Typography>
            </Paper>

            <Typography variant="body1" sx={{ mt: 2 }}>
              정보주체는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리,
              피해구제 등에 관한 사항을 개인정보보호책임자 및 담당부서로 문의하실 수 있습니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="amendment" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제10조 개인정보처리방침의 변경
            </Typography>

            <Typography variant="body1" paragraph>
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제
              및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </Typography>

            <Typography variant="body1" paragraph>
              다만, 이용자의 권리에 중요한 변경이 있을 경우에는 최소 30일 전에 고지합니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="remedy" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제11조 권익침해 구제방법
            </Typography>

            <Typography variant="body1" paragraph>
              정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
              한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
              개인정보 침해신고 및 상담 기관
            </Typography>

            <List>
              <ListItem>
                <ListItemText
                  primary="개인정보분쟁조정위원회"
                  secondary="(국번없이) 1833-6972 (www.kopico.go.kr)"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="개인정보침해신고센터"
                  secondary="(국번없이) 118 (privacy.kisa.or.kr)"
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="대검찰청" secondary="(국번없이) 1301 (www.spo.go.kr)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="경찰청" secondary="(국번없이) 182 (ecrm.cyber.go.kr)" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 부칙 */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              부칙
            </Typography>
            <Typography variant="body2" paragraph>
              본 개인정보처리방침은 2025년 2월 1일부터 적용됩니다.
            </Typography>
            <Typography variant="body2">
              이전 개인정보처리방침은 고객센터에서 확인하실 수 있습니다.
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
            <Typography variant="body2">고객센터: 031-699-8781</Typography>
            <Typography variant="body2">이메일: duly@duly.co.kr</Typography>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
