# MUI v7 Grid 사용 가이드 (필독!)

## 🚨 중요: MUI v7에서 Grid 변경사항

MUI v7에서 Grid 컴포넌트가 대폭 개선되었습니다. **Grid2가 Grid로 통합**되었고, 사용법이 변경되었습니다.

## 📦 Import 방법

### ❌ 잘못된 방법 (에러 발생!)
```jsx
// 이렇게 하면 안됩니다!
import { Grid } from '@mui/material';  // ❌ 구식 방법
import Grid2 from '@mui/material/Grid2';  // ❌ Grid2는 더 이상 존재하지 않음
import Grid from '@mui/material/Unstable_Grid2';  // ❌ v5/v6 방식
```

### ✅ 올바른 방법 (MUI v7)
```jsx
// MUI v7에서는 이렇게 사용하세요!
import Grid from '@mui/material/Grid';  // ✅ 정답!
```

## 🎯 기본 사용법

### 1. Container와 Item 구조 (MUI v7)
```jsx
import Grid from '@mui/material/Grid';

// MUI v7 방식 - size prop 사용
<Grid container spacing={2}>
  <Grid size={12}>전체 너비</Grid>
  <Grid size={6}>반 너비</Grid>
  <Grid size={6}>반 너비</Grid>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>반응형</Grid>
</Grid>
```

### 2. 주요 변경사항

#### ❌ 구식 방법 (v5/v6)
```jsx
// 이전 버전 방식 - 더 이상 사용하지 마세요!
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>  {/* item과 xs, sm, md 사용 */}
    콘텐츠
  </Grid>
</Grid>
```

#### ✅ 새로운 방법 (v7)
```jsx
// MUI v7 방식 - size prop 사용!
<Grid container spacing={2}>
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>  {/* size prop으로 통합! */}
    콘텐츠
  </Grid>
  
  {/* 단일 값도 가능 */}
  <Grid size={6}>반 너비</Grid>
  
  {/* grow 옵션 */}
  <Grid size="grow">남은 공간 채우기</Grid>
  
  {/* auto 옵션 */}
  <Grid size="auto">콘텐츠 크기만큼</Grid>
</Grid>
```

## 🔄 마이그레이션 가이드

### 이전 코드를 v7로 변경하기

```jsx
// 🔴 Before (MUI v5/v6)
import Grid from '@mui/material/Grid';

<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card>내용</Card>
  </Grid>
</Grid>

// 🟢 After (MUI v7)
import Grid from '@mui/material/Grid';

<Grid container spacing={3}>
  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
    <Card>내용</Card>
  </Grid>
</Grid>
```

### offset 사용법 변경

```jsx
// 🔴 Before
<Grid item xs={6} xsOffset={3}>

// 🟢 After  
<Grid size={6} offset={3}>

// 반응형 offset
<Grid size={{ xs: 12, sm: 6 }} offset={{ xs: 0, sm: 3 }}>
```

## 📱 반응형 디자인 예제

```jsx
import Grid from '@mui/material/Grid';

function ResponsiveLayout() {
  return (
    <Grid container spacing={2}>
      {/* 모바일: 12칸(전체), 태블릿: 6칸(반), 데스크톱: 4칸(1/3), 큰화면: 3칸(1/4) */}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
        <ProductCard />
      </Grid>
      
      {/* 모바일에서만 숨기기 */}
      <Grid size={{ xs: 0, sm: 6 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Sidebar />
      </Grid>
      
      {/* 남은 공간 채우기 */}
      <Grid size="grow">
        <MainContent />
      </Grid>
    </Grid>
  );
}
```

## ⚠️ 자주하는 실수들

### 1. item prop 사용 (v7에서 제거됨)
```jsx
// ❌ 잘못된 코드
<Grid item size={6}>  {/* item은 더 이상 필요없음! */}

// ✅ 올바른 코드
<Grid size={6}>
```

### 2. xs, sm, md, lg prop 직접 사용
```jsx
// ❌ 잘못된 코드
<Grid xs={12} sm={6} md={4}>  {/* 개별 prop 사용 안됨! */}

// ✅ 올바른 코드
<Grid size={{ xs: 12, sm: 6, md: 4 }}>
```

### 3. Grid2 import 시도
```jsx
// ❌ 잘못된 코드
import Grid2 from '@mui/material/Grid2';  {/* Grid2는 없음! */}

// ✅ 올바른 코드
import Grid from '@mui/material/Grid';
```

## 🎨 유용한 패턴들

### 1. 상품 그리드 (전자상거래)
```jsx
<Grid container spacing={2}>
  {products.map((product) => (
    <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <ProductCard product={product} />
    </Grid>
  ))}
</Grid>
```

### 2. 사이드바 레이아웃
```jsx
<Grid container spacing={3}>
  {/* 사이드바 */}
  <Grid size={{ xs: 12, md: 3 }}>
    <Sidebar />
  </Grid>
  
  {/* 메인 콘텐츠 */}
  <Grid size={{ xs: 12, md: 9 }}>
    <MainContent />
  </Grid>
</Grid>
```

### 3. 센터 정렬 레이아웃
```jsx
<Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh' }}>
  <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
    <LoginForm />
  </Grid>
</Grid>
```

## 📚 추가 속성들

```jsx
<Grid 
  container
  spacing={2}                    // 간격
  direction="row"                // row | column
  justifyContent="center"        // flex 정렬
  alignItems="center"            // flex 정렬
  wrap="wrap"                    // wrap | nowrap
  columns={12}                   // 기본 12칸, 변경 가능
>
  <Grid 
    size={6}                     // 크기
    offset={2}                   // 오프셋
    sx={{ bgcolor: 'primary.main' }}  // 스타일
  >
    콘텐츠
  </Grid>
</Grid>
```

## 🔧 마이그레이션 자동화

프로젝트 전체를 자동으로 마이그레이션하려면:

```bash
# MUI codemod 사용
npx @mui/codemod@latest v7.0.0/grid-props <path/to/folder>
```

## 📖 참고 자료

- [MUI v7 Migration Guide](https://mui.com/material-ui/migration/upgrade-to-v7/)
- [Grid Component Documentation](https://mui.com/material-ui/react-grid/)
- [Grid v2 Upgrade Guide](https://mui.com/material-ui/migration/upgrade-to-grid-v2/)

---

**작성일**: 2025-01-28  
**MUI 버전**: v7.x  
**중요도**: ⭐⭐⭐⭐⭐ (필수 숙지!)

> 💡 **팁**: 이 문서를 프로젝트 루트에 두고 팀원들과 공유하세요. MUI v7 Grid 사용 시 참고하면 실수를 줄일 수 있습니다!