-- Add PDF-derived description columns to hs_codes (4-digit, 6-digit)
ALTER TABLE public.hs_codes
  ADD COLUMN IF NOT EXISTS pdf_title_ko_4 text,
  ADD COLUMN IF NOT EXISTS pdf_description_ko_4 text,
  ADD COLUMN IF NOT EXISTS pdf_parent_labels_4 text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pdf_source_4 text,
  ADD COLUMN IF NOT EXISTS pdf_title_ko_6 text,
  ADD COLUMN IF NOT EXISTS pdf_description_ko_6 text,
  ADD COLUMN IF NOT EXISTS pdf_parent_labels_6 text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pdf_source_6 text;

-- Optional GIN indexes for array filters
CREATE INDEX IF NOT EXISTS idx_hs_codes_pdf_parent_labels_4 ON public.hs_codes USING gin (pdf_parent_labels_4);
CREATE INDEX IF NOT EXISTS idx_hs_codes_pdf_parent_labels_6 ON public.hs_codes USING gin (pdf_parent_labels_6);
