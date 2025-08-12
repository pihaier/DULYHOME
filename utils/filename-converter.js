// 한글 파일명을 안전한 영문 파일명으로 변환

function convertToSafeFilename(originalFilename) {
  // 파일명과 확장자 분리
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const name = originalFilename.substring(0, lastDotIndex);
  const extension = originalFilename.substring(lastDotIndex);
  
  // 한글 -> 영문 매핑 (주요 단어만)
  const koreanToEnglish = {
    '회사소개서': 'company-intro',
    '회사소개': 'company-intro',
    '검품': 'inspection',
    '체크리스트': 'checklist',
    '검품체크리스트': 'inspection-checklist',
    '서비스안내': 'service-guide',
    '서비스가이드': 'service-guide',
    '가격표': 'price-table',
    '신청서': 'application-form',
    '양식': 'template',
    '견적서': 'quotation',
    '두리무역': 'duly',
    '가이드': 'guide',
    '매뉴얼': 'manual',
    '샘플': 'sample',
    '카탈로그': 'catalog',
    '브로셔': 'brochure'
  };
  
  // 매핑된 영문명이 있으면 사용
  let safeName = name;
  for (const [korean, english] of Object.entries(koreanToEnglish)) {
    if (name.includes(korean)) {
      safeName = safeName.replace(korean, english);
    }
  }
  
  // 여전히 한글이 있으면 타임스탬프로 대체
  if (/[가-힣]/.test(safeName)) {
    safeName = `document-${Date.now()}`;
  }
  
  // 특수문자 제거 및 공백을 하이픈으로 변경
  safeName = safeName
    .replace(/[^a-zA-Z0-9-_]/g, '-')  // 특수문자를 하이픈으로
    .replace(/--+/g, '-')               // 연속된 하이픈 제거
    .replace(/^-|-$/g, '')              // 시작/끝 하이픈 제거
    .toLowerCase();                     // 소문자로 변환
  
  return safeName + extension;
}

// 사용 예시
const testFiles = [
  "회사소개서.pdf",
  "검품체크리스트.xlsx",
  "두리무역_서비스안내.pdf",
  "2024년_가격표.pdf",
  "샘플 신청서 양식.docx"
];

console.log('파일명 변환 테스트:');
testFiles.forEach(file => {
  console.log(`${file} → ${convertToSafeFilename(file)}`);
});

module.exports = { convertToSafeFilename };