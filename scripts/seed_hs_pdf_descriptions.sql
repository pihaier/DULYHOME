-- Seed sample for 04 chapter (adjust pages per your PDF)
insert into public.hs_pdf_descriptions (hs6_code, title_ko, description_ko, parent_labels, source)
values
('040110', '지방분 0.1% 이하 우유', '지방분이 전 중량의 0.1% 이하인 우유. 냉장/냉동/가당 여부 등 분류 기준 포함.', ARRAY['우유','냉장'], '2017 HS 해설서 p.xxx'),
('040120', '지방분 0.1% 초과~6% 우유', '지방분 범위(>0.1% ~ ≤6%)에 따른 분류. 가당/농축/형태 등 기준.', ARRAY['우유','가당','냉장'], '2017 HS 해설서 p.xxx'),
('040140', '기타(우유/크림 계열)', 'PDF 근거로 포함/제외 기준을 명확화. 상위 라벨 병기.', ARRAY['우유','냉동'], '2017 HS 해설서 p.xxx'),
('040150', '기타(우유/크림 계열)', 'PDF 근거로 포함/제외 기준을 명확화. 상위 라벨 병기.', ARRAY['크림','냉동'], '2017 HS 해설서 p.xxx')
ON CONFLICT (hs6_code) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  description_ko = EXCLUDED.description_ko,
  parent_labels = EXCLUDED.parent_labels,
  source = EXCLUDED.source,
  updated_at = now();
