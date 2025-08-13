'use client';
import React from 'react';
import { Box, Typography, Paper, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';

export default function TermsPage() {
  const sections = [
    { id: 'purpose', title: '제1조 (목적)' },
    { id: 'definitions', title: '제2조 (용어의 정의)' },
    { id: 'services', title: '제3조 (서비스 제공)' },
    { id: 'restrictions', title: '제4조 (서비스 이용 제한)' },
    { id: 'contract', title: '제5조 (계약의 성립)' },
    { id: 'costs', title: '제6조 (구매대행비용 및 사후정산)' },
    { id: 'inspection', title: '제7조 (검수)' },
    { id: 'customs', title: '제8조 (통관)' },
    { id: 'emergency', title: '제9조 (긴급조치)' },
    { id: 'withdrawal', title: '제10조 (청약철회 및 환급기준)' },
    { id: 'compensation', title: '제11조 (손해배상)' },
    { id: 'liability', title: '제12조 (책임의 특별소멸사유와 시효)' },
    { id: 'dispute', title: '제13조 (분쟁해결)' },
    { id: 'jurisdiction', title: '제14조 (관할법원 및 준거법)' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageContainer title="이용약관" description="두리무역 ERP 서비스 이용약관">
      <Box sx={{ py: 4 }}>
        {/* 헤더 */}
        <Paper sx={{ p: 4, mb: 3, bgcolor: 'primary.lighter' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            서비스 이용약관
          </Typography>
          <Typography variant="body1" color="text.secondary">
            두리무역 ERP 서비스 이용에 관한 약관입니다.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label="시행일: 2025년 2월 1일" size="small" />
            <Chip label="버전: 1.0" size="small" sx={{ ml: 1 }} />
          </Box>
        </Paper>

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

        {/* 약관 내용 */}
        <Paper sx={{ p: 4 }}>
          <Box id="purpose" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제1조 (목적)
            </Typography>
            <Typography variant="body1" paragraph>
              본 약관은 두리무역(이하 "회사"라 합니다)이 제공하는 중국 수입대행 ERP 서비스(이하
              "서비스"라 합니다)의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을
              규정함을 목적으로 합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              회사는 위임형 구매대행 서비스를 제공하며, 고객의 요청에 따라 중국 현지에서 제품
              시장조사, 공장 컨택, 검품, 구매대행, 통관 및 배송 서비스를 수행합니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="definitions" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제2조 (용어의 정의)
            </Typography>
            <Typography variant="body1" paragraph>
              본 약관에서 사용하는 용어의 정의는 다음과 같습니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="1. '서비스'란 회사가 제공하는 모든 중국 수입대행 관련 서비스를 의미합니다." />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. '회원'이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 의미합니다." />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. '구매대행'이란 회원의 요청에 따라 중국 현지에서 물품을 구매하여 한국으로 배송하는 서비스를 의미합니다." />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. '시장조사'란 회원이 요청한 제품의 중국 시장 가격, 공급업체 정보 등을 조사하는 서비스를 의미합니다." />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. '검품'이란 제품의 품질, 수량, 규격 등을 확인하는 서비스를 의미합니다." />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="services" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제3조 (서비스 제공)
            </Typography>
            <Typography variant="body1" paragraph>
              회사는 다음과 같은 서비스를 제공합니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="1. 시장조사 서비스: 중국 시장 내 제품 가격, 품질, 공급업체 정보 조사" />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. 공장컨택 서비스: 중국 현지 공장과의 커뮤니케이션 및 협상 대행" />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. 검품 서비스: 제품 품질 검사 및 보고서 제공" />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. 구매대행 서비스: 제품 구매, 결제, 물류 대행" />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. 통관 서비스: 수입 통관 절차 대행" />
              </ListItem>
              <ListItem>
                <ListItemText primary="6. 배송 서비스: 한국 내 지정 장소까지 배송" />
              </ListItem>
              <ListItem>
                <ListItemText primary="7. 실시간 번역 서비스: GPT-4 기반 한중 실시간 번역" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="restrictions" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제4조 (서비스 이용 제한)
            </Typography>
            <Typography variant="body1" paragraph>
              회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 거부할 수 있습니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="1. 수입금지 품목 또는 위법한 물품의 구매를 요청하는 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="2. 허위 정보를 제공한 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="3. 대금 결제를 지연하거나 거부하는 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="4. 타인의 정보를 도용한 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="5. 서비스 운영을 고의로 방해하는 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="6. 기타 관련 법령을 위반하는 경우" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="contract" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제5조 (계약의 성립)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 서비스 이용계약은 회원이 본 약관에 동의하고 회원가입을 신청한 후, 회사가 이를
              승낙함으로써 성립합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을
              해지할 수 있습니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 실명이 아니거나 타인의 명의를 이용한 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 기타 규정한 제반 사항을 위반하여 신청하는 경우" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="costs" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제6조 (구매대행비용 및 사후정산)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 구매대행비용은 다음과 같이 구성됩니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 제품 구매 대금" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 중국 내 물류비" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 국제 운송비" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 관세 및 부가세" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서비스 수수료" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              2. 회사는 서비스 완료 후 실제 발생한 비용을 기준으로 정산하며, 차액이 발생한 경우 추가
              청구 또는 환불합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              3. 환율 변동으로 인한 차액은 결제 시점의 환율을 기준으로 정산합니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="inspection" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제7조 (검수)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 회사는 회원의 요청에 따라 제품 검수 서비스를 제공합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 검수 내용은 다음과 같습니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 제품의 외관 상태" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 수량 확인" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 규격 및 사양 확인" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 기능 테스트 (회원 요청 시)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 포장 상태 확인" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              3. 검수 결과는 보고서 형태로 제공되며, 사진 및 동영상 자료를 포함합니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="customs" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제8조 (통관)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 회사는 정식 통관 절차를 통해 물품을 수입합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 통관에 필요한 서류는 회원이 제공해야 하며, 회사는 통관 절차를 대행합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              3. 관세 및 부가세는 회원이 부담하며, 회사는 대납 후 정산합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              4. 통관 불가 물품의 경우, 회사는 즉시 회원에게 통보하고 처리 방안을 협의합니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="emergency" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제9조 (긴급조치)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 회사는 다음과 같은 긴급 상황 발생 시 회원의 사전 동의 없이 필요한 조치를 취할 수
              있습니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 통관 문제 발생 시" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 제품 하자 발견 시" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 배송 지연 발생 시" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 기타 긴급한 조치가 필요한 경우" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              2. 회사는 긴급조치 후 즉시 회원에게 그 내용을 통보합니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="withdrawal" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제10조 (청약철회 및 환급기준)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 회원은 다음의 경우 청약철회가 가능합니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 서비스 신청 후 24시간 이내 (단, 이미 진행된 서비스 제외)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 회사의 귀책사유로 서비스가 제공되지 않은 경우" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 계약 내용과 다른 서비스가 제공된 경우" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              2. 환급 기준:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 서비스 착수 전: 100% 환급" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서비스 진행 중: 진행된 부분을 제외한 나머지 환급" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 서비스 완료 후: 환급 불가 (단, 회사 귀책사유 시 협의)" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="compensation" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제11조 (손해배상)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 회사는 고의 또는 중과실로 회원에게 손해를 입힌 경우 배상책임을 집니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 다음의 경우 회사는 책임을 지지 않습니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 천재지변, 전쟁, 테러 등 불가항력적 사유" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 회원의 고의 또는 과실로 인한 손해" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 제3자의 불법행위로 인한 손해" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 중국 현지 법규 변경으로 인한 서비스 제한" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              3. 손해배상은 실제 발생한 직접 손해에 한하며, 간접 손해는 배상하지 않습니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="liability" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제12조 (책임의 특별소멸사유와 시효)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 회원이 물품을 수령한 후 7일 이내에 이의를 제기하지 않은 경우, 회사의 책임은
              소멸합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 손해배상 청구권은 회원이 손해를 안 날로부터 1년, 손해가 발생한 날로부터 3년이
              경과하면 소멸합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              3. 단, 회사의 고의 또는 중과실로 인한 손해의 경우 민법상 일반 시효가 적용됩니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="dispute" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제13조 (분쟁해결)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 회사와 회원 간 발생한 분쟁은 상호 협의하여 해결함을 원칙으로 합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 협의가 이루어지지 않을 경우, 다음의 방법으로 해결합니다:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• 한국소비자원 소비자분쟁조정위원회 조정" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 대한상사중재원 중재" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• 민사소송" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box id="jurisdiction" sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              제14조 (관할법원 및 준거법)
            </Typography>
            <Typography variant="body1" paragraph>
              1. 본 약관에 관한 소송의 관할법원은 회사의 본점 소재지를 관할하는 법원으로 합니다.
            </Typography>
            <Typography variant="body1" paragraph>
              2. 본 약관은 대한민국 법률에 따라 규율되고 해석됩니다.
            </Typography>
            <Typography variant="body1" paragraph>
              3. 국제 거래에 관한 사항은 관련 국제협약 및 관례를 따릅니다.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 부칙 */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              부칙
            </Typography>
            <Typography variant="body2" paragraph>
              1. 본 약관은 2025년 2월 1일부터 시행합니다.
            </Typography>
            <Typography variant="body2" paragraph>
              2. 회사는 필요한 경우 약관을 개정할 수 있으며, 개정 약관은 공지 후 7일이 경과한 날부터
              효력이 발생합니다.
            </Typography>
            <Typography variant="body2">
              3. 기존 회원에게는 개정 약관 시행 전 이메일 또는 서비스 내 공지를 통해 변경 사항을
              안내합니다.
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
