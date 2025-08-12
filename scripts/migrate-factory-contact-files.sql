-- Factory Contact 파일 버킷 마이그레이션 스크립트
-- uploads -> application-files 버킷으로 이동

-- 1. 먼저 영향받는 레코드 확인
SELECT 
  COUNT(*) as total_files,
  COUNT(DISTINCT reservation_number) as affected_applications
FROM uploaded_files 
WHERE reservation_number LIKE 'FC-%'
  AND (file_path LIKE '%uploads%' OR file_url LIKE '%uploads%');

-- 2. 백업 테이블 생성 (안전을 위해)
CREATE TABLE IF NOT EXISTS uploaded_files_backup_20250131 AS 
SELECT * FROM uploaded_files 
WHERE reservation_number LIKE 'FC-%'
  AND (file_path LIKE '%uploads%' OR file_url LIKE '%uploads%');

-- 3. URL 업데이트 (uploads -> application-files)
UPDATE uploaded_files
SET 
  file_url = REPLACE(file_url, '/storage/v1/object/public/uploads/', '/storage/v1/object/public/application-files/'),
  file_path = REPLACE(file_path, 'uploads/', 'application-files/'),
  updated_at = NOW()
WHERE reservation_number LIKE 'FC-%'
  AND (file_path LIKE '%uploads%' OR file_url LIKE '%uploads%');

-- 4. 업데이트 결과 확인
SELECT 
  reservation_number,
  original_filename,
  file_path,
  file_url,
  updated_at
FROM uploaded_files
WHERE reservation_number LIKE 'FC-%'
ORDER BY updated_at DESC
LIMIT 10;

-- 5. 수동 작업 필요
-- Supabase Storage에서 실제 파일을 이동해야 합니다:
-- 1) Supabase Dashboard > Storage > uploads 버킷
-- 2) FC-로 시작하는 폴더들 선택
-- 3) application-files 버킷으로 이동

-- 참고: 파일을 실제로 이동하기 전에는 URL이 작동하지 않습니다!