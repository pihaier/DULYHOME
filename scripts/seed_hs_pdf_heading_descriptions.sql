-- Seed sample for 04 heading (adjust pages per your PDF)
insert into public.hs_pdf_heading_descriptions (hs4_code, title_ko, description_ko, parent_labels, source)
values
('0401', '우유 및 크림(유지방 함유)', '0401 범주 포함/제외 기준 요약. 지방 함량/가공/가당/형태 등.', ARRAY['우유','크림'], '2017 HS 해설서 p.xxx')
ON CONFLICT (hs4_code) DO UPDATE SET
  title_ko = EXCLUDED.title_ko,
  description_ko = EXCLUDED.description_ko,
  parent_labels = EXCLUDED.parent_labels,
  source = EXCLUDED.source,
  updated_at = now();
