"""
HS 코드 CSV 데이터를 Supabase에 업로드하는 스크립트
"""
import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import time

# 환경변수 로드
env_path = r"C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\nextjs_flexy\.env.local"
load_dotenv(env_path)

# Supabase 클라이언트 설정
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("❌ 환경변수를 찾을 수 없습니다.")
    print(f"   .env.local 경로: {env_path}")
    print(f"   URL: {url}")
    print(f"   KEY: {'있음' if key else '없음'}")
    exit(1)
supabase: Client = create_client(url, key)

# 데이터 디렉토리
data_dir = r"C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\data\hs_codes"

def upload_hs_codes():
    """CSV 파일들을 Supabase에 업로드"""
    
    # 통합 파일 읽기
    all_codes_path = os.path.join(data_dir, 'hs_codes_all.csv')
    
    if not os.path.exists(all_codes_path):
        print("❌ 통합 파일이 없습니다. convert_hs_excel_to_csv.py를 먼저 실행하세요.")
        return False
    
    # CSV 읽기
    df = pd.read_csv(all_codes_path)
    
    print(f"총 {len(df)} 개의 HS 코드를 업로드합니다...")
    print(f"레벨별 분포:")
    print(df['level'].value_counts().sort_index())
    
    # NaN 값을 None으로 변환
    df = df.where(pd.notnull(df), None)
    
    # 배치 처리 (100개씩)
    batch_size = 100
    total_uploaded = 0
    
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i+batch_size]
        
        # 데이터 준비
        records = []
        for _, row in batch.iterrows():
            record = {
                'hs_code': str(row['hs_code']),
                'level': int(row['level']),
                'parent_code': str(row['parent_code']) if row['parent_code'] else None,
                'name_ko': row['name_ko'],
                'name_en': row.get('name_en'),
                'description': None,
                'common_aliases': [],
                'search_keywords': []
            }
            records.append(record)
        
        try:
            # Supabase에 삽입
            result = supabase.table('hs_codes_hierarchy').upsert(
                records,
                on_conflict='hs_code'
            ).execute()
            
            total_uploaded += len(records)
            print(f"✅ {total_uploaded}/{len(df)} 업로드 완료")
            
        except Exception as e:
            print(f"❌ 배치 {i//batch_size + 1} 업로드 실패: {str(e)}")
            return False
        
        # API 제한 방지를 위한 딜레이
        time.sleep(0.1)
    
    print(f"\n✅ 총 {total_uploaded} 개의 HS 코드 업로드 완료!")
    return True

def add_common_aliases():
    """자주 사용되는 별칭 추가"""
    
    print("\n=== 일반적인 별칭 추가 ===")
    
    # 별칭 매핑 (예시)
    aliases = [
        {'hs_code': '8471301000', 'aliases': ['노트북', '랩톱', '노트북컴퓨터', 'laptop'], 'keywords': ['휴대용', '컴퓨터', '노트북PC']},
        {'hs_code': '8517121020', 'aliases': ['스마트폰', '휴대폰', '핸드폰', '모바일폰'], 'keywords': ['전화기', '휴대전화', '이동전화']},
        {'hs_code': '8528722000', 'aliases': ['TV', '티비', '텔레비전', '텔레비젼'], 'keywords': ['텔레비전', '수상기', '모니터']},
        {'hs_code': '6110301000', 'aliases': ['스웨터', '스웨타', '풀오버'], 'keywords': ['니트', '메리야스', '편물']},
        {'hs_code': '6404191000', 'aliases': ['운동화', '스니커즈', '런닝화'], 'keywords': ['신발', '스포츠화', '운동용']},
        {'hs_code': '9503001100', 'aliases': ['인형', '봉제인형', '플러시토이'], 'keywords': ['장난감', '완구', '어린이']},
        {'hs_code': '8471494000', 'aliases': ['데스크톱', '데스크탑', 'PC'], 'keywords': ['컴퓨터', '개인용컴퓨터', '본체']},
        {'hs_code': '8471604020', 'aliases': ['키보드'], 'keywords': ['입력장치', '자판', '컴퓨터키보드']},
        {'hs_code': '8471607000', 'aliases': ['마우스'], 'keywords': ['입력장치', '포인팅장치', '컴퓨터마우스']},
    ]
    
    for item in aliases:
        try:
            # 별칭과 키워드 업데이트
            result = supabase.table('hs_codes_hierarchy').update({
                'common_aliases': item['aliases'],
                'search_keywords': item['keywords']
            }).eq('hs_code', item['hs_code']).execute()
            
            if result.data:
                print(f"✅ {item['hs_code']}: 별칭 {len(item['aliases'])}개, 키워드 {len(item['keywords'])}개 추가")
            else:
                print(f"⚠️ {item['hs_code']}: HS 코드를 찾을 수 없음")
                
        except Exception as e:
            print(f"❌ {item['hs_code']}: 업데이트 실패 - {str(e)}")
    
    print("\n✅ 별칭 추가 완료!")

def verify_upload():
    """업로드 검증"""
    
    print("\n=== 업로드 검증 ===")
    
    # 각 레벨별 개수 확인
    for level in [2, 4, 6, 10]:
        result = supabase.table('hs_codes_hierarchy').select('count', count='exact').eq('level', level).execute()
        print(f"Level {level}: {result.count} items")
    
    # 샘플 데이터 확인
    print("\n샘플 데이터:")
    result = supabase.table('hs_codes_hierarchy').select('*').limit(5).execute()
    for item in result.data:
        print(f"  {item['hs_code']} (L{item['level']}): {item['name_ko'][:30]}...")

if __name__ == "__main__":
    print("=== HS 코드 Supabase 업로드 시작 ===\n")
    
    # 1. HS 코드 업로드
    if upload_hs_codes():
        
        # 2. 별칭 추가
        add_common_aliases()
        
        # 3. 업로드 검증
        verify_upload()
    else:
        print("\n❌ 업로드 실패")