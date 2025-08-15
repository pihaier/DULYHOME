/**
 * HS 코드 검색 서비스
 * GPT-5-mini를 활용한 계층적 검색
 */

import { createClient } from '@/lib/supabase/client';

export interface HSCodeResult {
  hs_code: string;
  level: number;
  name_ko: string;
  name_en?: string;
  confidence: number;
  path?: HSCodeResult[]; // 계층 경로
}

export interface SearchOptions {
  useGPT?: boolean;
  skipLevel2?: boolean; // 2자리는 GPT가 잘 예측하므로 건너뛰기
  maxResults?: number;
}

class HSCodeSearchService {
  private supabase = createClient();

  /**
   * 제품명으로 HS 코드 검색
   */
  async searchHSCode(productName: string, options: SearchOptions = {}): Promise<HSCodeResult[]> {
    const { useGPT = true, skipLevel2 = true, maxResults = 5 } = options;

    // 1. 먼저 별칭 테이블에서 정확히 매칭되는지 확인
    const aliasResult = await this.searchByAlias(productName);
    if (aliasResult.length > 0) {
      return aliasResult;
    }

    // 2. 키워드 검색
    const keywordResult = await this.searchByKeyword(productName);
    if (keywordResult.length > 0) {
      return keywordResult.slice(0, maxResults);
    }

    // 3. GPT를 활용한 계층적 검색
    if (useGPT) {
      return await this.searchWithGPT(productName, skipLevel2);
    }

    // 4. 폴백: 텍스트 검색
    return await this.searchByText(productName, maxResults);
  }

  /**
   * 별칭으로 검색
   */
  private async searchByAlias(productName: string): Promise<HSCodeResult[]> {
    const { data, error } = await this.supabase
      .from('hs_codes_hierarchy')
      .select('*')
      .contains('common_aliases', [productName.toLowerCase()])
      .limit(1);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((item) => ({
      hs_code: item.hs_code,
      level: item.level,
      name_ko: item.name_ko,
      name_en: item.name_en,
      confidence: 1.0, // 별칭 매칭은 100% 신뢰
    }));
  }

  /**
   * 키워드로 검색
   */
  private async searchByKeyword(productName: string): Promise<HSCodeResult[]> {
    const { data, error } = await this.supabase
      .from('hs_codes_hierarchy')
      .select('*')
      .contains('search_keywords', [productName.toLowerCase()])
      .order('level', { ascending: false })
      .limit(5);

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      hs_code: item.hs_code,
      level: item.level,
      name_ko: item.name_ko,
      name_en: item.name_en,
      confidence: 0.9, // 키워드 매칭은 90% 신뢰
    }));
  }

  /**
   * GPT를 활용한 계층적 검색
   */
  private async searchWithGPT(
    productName: string,
    skipLevel2: boolean = true
  ): Promise<HSCodeResult[]> {
    try {
      // API 엔드포인트 호출
      const response = await fetch('/api/hs-code/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, skipLevel2 }),
      });

      if (!response.ok) {
        throw new Error('GPT 분류 실패');
      }

      const result = await response.json();
      return result.results;
    } catch (error) {
      // 폴백으로 텍스트 검색
      return await this.searchByText(productName, 5);
    }
  }

  /**
   * 텍스트 검색 (폴백)
   */
  private async searchByText(productName: string, maxResults: number = 5): Promise<HSCodeResult[]> {
    const { data, error } = await this.supabase
      .from('hs_codes_hierarchy')
      .select('*')
      .or(`name_ko.ilike.%${productName}%,name_en.ilike.%${productName}%`)
      .eq('level', 10) // 10자리 코드만
      .limit(maxResults);

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      hs_code: item.hs_code,
      level: item.level,
      name_ko: item.name_ko,
      name_en: item.name_en,
      confidence: 0.5, // 텍스트 매칭은 50% 신뢰
    }));
  }

  /**
   * HS 코드 계층 경로 가져오기
   */
  async getHSCodePath(hsCode: string): Promise<HSCodeResult[]> {
    const path: HSCodeResult[] = [];

    // 10자리 → 6자리 → 4자리 → 2자리
    const codes = [hsCode.substring(0, 2), hsCode.substring(0, 4), hsCode.substring(0, 6), hsCode];

    for (const code of codes) {
      const { data } = await this.supabase
        .from('hs_codes_hierarchy')
        .select('*')
        .eq('hs_code', code)
        .single();

      if (data) {
        path.push({
          hs_code: data.hs_code,
          level: data.level,
          name_ko: data.name_ko,
          name_en: data.name_en,
          confidence: 1.0,
        });
      }
    }

    return path;
  }

  /**
   * 검색 로그 저장 (학습용)
   */
  async logSearch(searchTerm: string, selectedHSCode?: string, userId?: string): Promise<void> {
    await this.supabase.from('hs_search_logs').insert({
      search_term: searchTerm,
      selected_hs_code: selectedHSCode,
      user_id: userId,
    });
  }
}

export const hsCodeSearch = new HSCodeSearchService();
