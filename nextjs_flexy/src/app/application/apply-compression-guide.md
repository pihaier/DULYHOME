# 파일 업로드 자동 압축 적용 가이드

## 1. Import 변경
```typescript
// 기존
import FileUpload from '@/app/components/forms/form-elements/FileUpload';

// 변경
import FileUploadWithCompression from '@/components/FileUploadWithCompression';
```

## 2. 컴포넌트 변경
```typescript
// 기존
<FileUpload
  label="제품 사진"
  description="제품 사진을 업로드해주세요"
  maxFiles={5}
  currentFiles={formData.files}
  onFilesChange={(files) => setFormData({ ...formData, files })}
/>

// 변경
<FileUploadWithCompression
  label="제품 사진"
  helperText="제품 사진을 업로드해주세요"
  maxFiles={5}
  files={formData.files}
  onChange={(files) => setFormData({ ...formData, files })}
/>
```

## 3. 주요 변경사항
- `description` → `helperText`
- `currentFiles` → `files`
- `onFilesChange` → `onChange`

## 4. 자동 압축 기능
- 5MB 이상의 이미지 파일을 자동으로 압축
- 최대 크기: 1920x1080
- 압축 품질: 80%
- 압축 결과를 사용자에게 표시

## 5. 적용 대상 페이지
- [x] 시장조사 (/application/import-agency/market-research)
- [ ] 샘플링 (/application/sampling)
- [ ] 대량주문 (/application/bulk-order)
- [ ] 검품감사 (/application/inspection)