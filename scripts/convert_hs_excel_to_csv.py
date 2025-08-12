"""
HS 코드 엑셀 파일을 시트별 CSV로 변환하는 스크립트
"""
import pandas as pd
import os
from pathlib import Path

# 파일 경로 설정
excel_file = r"C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\마케팅\컨설팅\관세청_HS부호 단위별 품목명_20250101.xlsx"
output_dir = r"C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom\data\hs_codes"

# 출력 디렉토리 생성
Path(output_dir).mkdir(parents=True, exist_ok=True)

def convert_excel_to_csv():
    """엑셀 파일의 각 시트를 개별 CSV로 변환"""
    
    try:
        # 엑셀 파일 읽기
        xl_file = pd.ExcelFile(excel_file)
        
        print(f"발견된 시트: {xl_file.sheet_names}")
        
        # 각 시트별로 처리
        sheet_mapping = {
            'HS2단위': 'hs_codes_2digit.csv',
            'HS4단위': 'hs_codes_4digit.csv', 
            'HS6단위': 'hs_codes_6digit.csv',
            'HS7-9단위': 'hs_codes_7to9digit.csv',
            'HS10단위': 'hs_codes_10digit.csv'
        }
        
        for sheet_name in xl_file.sheet_names:
            try:
                # 시트 읽기
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                
                # 데이터 정리
                df = df.dropna(how='all')  # 완전히 비어있는 행 제거
                
                # 컬럼명 표준화
                column_mapping = {
                    'HS2단위': 'hs_code',
                    'HS4단위': 'hs_code',
                    'HS6단위': 'hs_code',
                    'HS8단위': 'hs_code',
                    'HS10단위': 'hs_code',
                    '한글품목명': 'name_ko',
                    '영문품목명': 'name_en',
                    '품목명(한글)': 'name_ko',
                    '품목명(영문)': 'name_en'
                }
                
                # 컬럼명 변경
                for old_name, new_name in column_mapping.items():
                    if old_name in df.columns:
                        df.rename(columns={old_name: new_name}, inplace=True)
                
                # CSV 파일명 결정
                output_filename = sheet_mapping.get(sheet_name, f"{sheet_name}.csv")
                output_path = os.path.join(output_dir, output_filename)
                
                # CSV로 저장
                df.to_csv(output_path, index=False, encoding='utf-8-sig')
                
                print(f"✅ {sheet_name} → {output_filename} (행: {len(df)}, 열: {len(df.columns)})")
                print(f"   컬럼: {', '.join(df.columns)}")
                print(f"   샘플 데이터:")
                print(df.head(3).to_string())
                print("")
                
            except Exception as e:
                print(f"❌ {sheet_name} 시트 처리 실패: {str(e)}")
    
    except Exception as e:
        print(f"❌ 엑셀 파일 읽기 실패: {str(e)}")
        return False
    
    return True

def analyze_hierarchy():
    """계층 구조 분석 및 parent_code 추가"""
    
    print("\n=== 계층 구조 분석 ===\n")
    
    # 각 레벨의 CSV 읽기
    files = {
        2: os.path.join(output_dir, 'hs_codes_2digit.csv'),
        4: os.path.join(output_dir, 'hs_codes_4digit.csv'),
        6: os.path.join(output_dir, 'HS6단위(5단위포함).csv'),  # 실제 파일명
        8: os.path.join(output_dir, 'HS8단위(7, 9단위포함).csv'),  # 8자리도 추가
        10: os.path.join(output_dir, 'hs_codes_10digit.csv')
    }
    
    dfs = {}
    for level, filepath in files.items():
        if os.path.exists(filepath):
            df = pd.read_csv(filepath)
            
            # hs_code를 문자열로 변환
            df['hs_code'] = df['hs_code'].astype(str)
            
            # 자리수에 맞게 패딩
            if level in [2, 4, 6, 8, 10]:
                # 5자리, 7자리, 9자리도 처리
                df['hs_code'] = df['hs_code'].apply(lambda x: x.zfill(len(x)))
            
            # 실제 자리수 확인하여 level 설정
            df['level'] = df['hs_code'].str.len()
            
            # parent_code 컬럼 추가
            df['parent_code'] = df.apply(lambda row: 
                None if row['level'] == 2 else
                row['hs_code'][:2] if row['level'] in [3, 4] else
                row['hs_code'][:4] if row['level'] in [5, 6] else
                row['hs_code'][:6] if row['level'] in [7, 8, 9, 10] else
                None, axis=1)
            
            dfs[level] = df
            
            # 업데이트된 CSV 저장
            df.to_csv(filepath, index=False, encoding='utf-8-sig')
            
            print(f"Level {level}: {len(df)} items")
            print(f"샘플:")
            print(df[['hs_code', 'parent_code', 'name_ko']].head(3).to_string())
            print("")
    
    # 통합 파일 생성
    print("=== 통합 파일 생성 ===\n")
    all_codes = pd.concat(dfs.values(), ignore_index=True)
    all_codes.to_csv(os.path.join(output_dir, 'hs_codes_all.csv'), index=False, encoding='utf-8-sig')
    print(f"✅ 통합 파일 생성 완료: {len(all_codes)} items")
    
    return True

if __name__ == "__main__":
    print("=== HS 코드 엑셀 → CSV 변환 시작 ===\n")
    
    # 1. 엑셀을 CSV로 변환
    if convert_excel_to_csv():
        print("\n✅ 모든 시트 변환 완료!")
        
        # 2. 계층 구조 분석 및 parent_code 추가
        if analyze_hierarchy():
            print("\n✅ 계층 구조 분석 완료!")
            print(f"\n📁 출력 디렉토리: {output_dir}")
    else:
        print("\n❌ 변환 실패")