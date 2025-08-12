[01:28:23.645] Running build in Washington, D.C., USA (East) – iad1
[01:28:23.646] Build machine configuration: 4 cores, 8 GB
[01:28:23.663] Retrieving list of deployment files...
[01:28:25.270] Downloading 1148 deployment files...
[01:28:31.899] Restored build cache from previous deployment (CVF8LfKZ8LLYx3kudTgWhB8A1pRc)
[01:28:46.024] Running "vercel build"
[01:28:46.523] Vercel CLI 44.7.3
[01:28:46.999] Installing dependencies...
[01:28:48.507] 
[01:28:48.507] up to date in 1s
[01:28:48.507] 
[01:28:48.507] 275 packages are looking for funding
[01:28:48.507]   run `npm fund` for details
[01:28:48.540] Detected Next.js version: 15.4.6
[01:28:48.546] Running "npm run build"
[01:28:48.663] 
[01:28:48.664] > flexy-main@6.0.0 build
[01:28:48.664] > next build
[01:28:48.664] 
[01:28:49.429]    ▲ Next.js 15.4.6
[01:28:49.430]    - Experiments (use with caution):
[01:28:49.430]      · optimizePackageImports
[01:28:49.430] 
[01:28:49.549]    Creating an optimized production build ...
[01:29:35.561]  ⚠ Compiled with warnings in 45s
[01:29:35.562] 
[01:29:35.562] ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
[01:29:35.562] Critical dependency: the request of a dependency is an expression
[01:29:35.562] 
[01:29:35.562] Import trace for requested module:
[01:29:35.562] ./node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
[01:29:35.562] ./node_modules/@supabase/realtime-js/dist/module/index.js
[01:29:35.563] ./node_modules/@supabase/supabase-js/dist/module/index.js
[01:29:35.563] ./src/lib/supabase/service.ts
[01:29:35.563] ./src/app/api/auth/custom-signup/route.ts
[01:29:35.563] 
[01:29:35.579]    Linting and checking validity of types ...
[01:29:49.867] 
[01:29:49.868] ./src/app/application/factory-contact/page.tsx
[01:29:49.868] 121:6  Warning: React Hook React.useEffect has a missing dependency: 'formData.company_name'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.868] 
[01:29:49.868] ./src/app/application/sampling/page.tsx
[01:29:49.868] 148:6  Warning: React Hook useEffect has a missing dependency: 'fetchSavedShippingAddresses'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.868] 
[01:29:49.868] ./src/app/apps/sampling/[reservationNumber]/page.tsx
[01:29:49.868] 61:6  Warning: React Hook useEffect has a missing dependency: 'fetchData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.869] 
[01:29:49.869] ./src/app/components/dashboard/MyOrderStatsCards.tsx
[01:29:49.869] 42:6  Warning: React Hook useEffect has a missing dependency: 'fetchMyStats'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.869] 
[01:29:49.869] ./src/app/components/dashboard/RecentApplications.tsx
[01:29:49.870] 35:6  Warning: React Hook useEffect has a missing dependency: 'fetchRecentApplications'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.870] 
[01:29:49.870] ./src/app/components/dashboard/ServiceOverviewChart.tsx
[01:29:49.870] 30:6  Warning: React Hook useEffect has a missing dependency: 'fetchServiceData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.870] 
[01:29:49.873] ./src/app/components/dashboard/UnreadMessagesWidget.tsx
[01:29:49.873] 40:6  Warning: React Hook useEffect has a missing dependency: 'fetchUnreadMessages'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.874] 
[01:29:49.874] ./src/app/components/forms/form-elements/CompanyAddressSelector.tsx
[01:29:49.874] 83:6  Warning: React Hook useEffect has a missing dependency: 'fetchAddresses'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.874] 
[01:29:49.874] ./src/app/components/forms/form-elements/CompanyInfoForm.tsx
[01:29:49.874] 82:6  Warning: React Hook useEffect has missing dependencies: 'onChange' and 'value'. Either include them or remove the dependency array. If 'onChange' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
[01:29:49.875] 89:6  Warning: React Hook useEffect has a missing dependency: 'fetchSavedAddresses'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.875] 133:18  Warning: Assignments to the 'onSubmit' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect.  react-hooks/exhaustive-deps
[01:29:49.875] 
[01:29:49.875] ./src/app/components/forms/form-elements/FileUpload.tsx
[01:29:49.875] 132:6  Warning: React Hook React.useEffect has a missing dependency: 'currentFiles'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.876] 
[01:29:49.876] ./src/app/components/frontend-pages/blog/customer-support/CustomerSupportList.tsx
[01:29:49.876] 81:6  Warning: React Hook useEffect has a missing dependency: 'ADMIN_EMAILS'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.876] 
[01:29:49.876] ./src/app/components/frontend-pages/blog/customer-support/CustomerSupportListDB.tsx
[01:29:49.877] 114:6  Warning: React Hook useEffect has a missing dependency: 'fetchData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.877] 
[01:29:49.877] ./src/app/components/frontend-pages/blog/customer-support/CustomerSupportWithFallback.tsx
[01:29:49.877] 15:6  Warning: React Hook useEffect has a missing dependency: 'checkDatabaseAvailability'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.877] 
[01:29:49.877] ./src/app/components/shared/FileManager.tsx
[01:29:49.877] 76:6  Warning: React Hook React.useEffect has a missing dependency: 'loadFiles'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.878] 
[01:29:49.878] ./src/app/dashboard/orders/[reservationNumber]/hooks/useOrderData.tsx
[01:29:49.878] 181:6  Warning: React Hook useEffect has a missing dependency: 'fetchOrderDetails'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.878] 
[01:29:49.878] ./src/app/dashboard/orders/[reservationNumber]/page.tsx
[01:29:49.878] 269:6  Warning: React Hook useCallback has missing dependencies: 'getServiceTitle' and 'supabase'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.886] 372:6  Warning: React Hook useEffect has missing dependencies: 'fetchOrderDetails', 'loadChatMessages', and 'supabase'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.886] 
[01:29:49.886] ./src/app/dashboard/orders/_components/ChatPanel.tsx
[01:29:49.886] 204:6  Warning: React Hook useEffect has missing dependencies: 'fetchChatMessages' and 'supabase'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.886] 
[01:29:49.886] ./src/app/dashboard/orders/bulk-order/page.tsx
[01:29:49.886] 53:6  Warning: React Hook useEffect has a missing dependency: 'fetchBulkOrders'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.887] 
[01:29:49.887] ./src/app/dashboard/orders/factory-contact/[reservationNumber]/page.tsx
[01:29:49.887] 161:6  Warning: React Hook useEffect has a missing dependency: 'supabase'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.887] 
[01:29:49.887] ./src/app/dashboard/orders/factory-contact/page.tsx
[01:29:49.887] 57:6  Warning: React Hook useEffect has a missing dependency: 'fetchFactoryContactOrders'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.887] 
[01:29:49.887] ./src/app/dashboard/orders/inspection/page.tsx
[01:29:49.887] 56:6  Warning: React Hook useEffect has a missing dependency: 'fetchInspectionOrders'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.887] 
[01:29:49.887] ./src/app/dashboard/orders/market-research/page.tsx
[01:29:49.887] 55:6  Warning: React Hook useEffect has a missing dependency: 'fetchMarketResearchOrders'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.887] 
[01:29:49.887] ./src/app/dashboard/orders/sampling/[reservationNumber]/page.tsx
[01:29:49.888] 126:6  Warning: React Hook useEffect has a missing dependency: 'supabase'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.889] 
[01:29:49.889] ./src/app/dashboard/orders/sampling/page.tsx
[01:29:49.889] 58:6  Warning: React Hook useEffect has a missing dependency: 'fetchSamplingOrders'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.889] 
[01:29:49.890] ./src/app/dashboard/profile/ProfileInfoTab.tsx
[01:29:49.890] 86:6  Warning: React Hook useEffect has a missing dependency: 'refreshUser'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.890] 
[01:29:49.890] ./src/app/dashboard/profile/ShippingInfoTab.tsx
[01:29:49.890] 66:6  Warning: React Hook useEffect has a missing dependency: 'fetchShippingAddresses'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.890] 
[01:29:49.890] ./src/app/dashboard/staff/bulk-order/page.tsx
[01:29:49.890] 157:6  Warning: React Hook useEffect has a missing dependency: 'loadMarketResearchData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.890] 
[01:29:49.890] ./src/app/frontend-pages/calculators/components/Container3D.tsx
[01:29:49.890] 61:6  Warning: React Hook useMemo has missing dependencies: 'boxDimensions' and 'container'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.890] 
[01:29:49.890] ./src/app/inquiry/bulk-order/[reservationNumber]/page.tsx
[01:29:49.890] 56:6  Warning: React Hook useEffect has a missing dependency: 'fetchOrderData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.890] 
[01:29:49.891] ./src/app/inquiry/inspection/[reservationNumber]/page.tsx
[01:29:49.891] 56:6  Warning: React Hook useEffect has a missing dependency: 'fetchInspectionData'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.891] 
[01:29:49.891] ./src/components/FileUploadCarousel.tsx
[01:29:49.891] 99:6  Warning: React Hook useEffect has a missing dependency: 'previewUrls'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.891] 
[01:29:49.891] ./src/lib/context/GlobalContext.tsx
[01:29:49.891] 175:6  Warning: React Hook useEffect has missing dependencies: 'fetchUserProfile', 'refreshUser', and 'supabase.auth'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
[01:29:49.891] 
[01:29:49.891] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[01:30:17.595] Failed to compile.
[01:30:17.595] 
[01:30:17.595] ./src/app/dashboard/bulk-orders/page.tsx:22:3
[01:30:17.595] Type error: '"@mui/material"' has no exported member named 'Grid2'. Did you mean 'Grid'?
[01:30:17.595] 
[01:30:17.595] [0m [90m 20 |[39m   [33mCircularProgress[39m[33m,[39m
[01:30:17.595]  [90m 21 |[39m   [33mAlert[39m[33m,[39m
[01:30:17.595] [31m[1m>[22m[39m[90m 22 |[39m   [33mGrid2[39m [36mas[39m [33mGrid[39m[33m,[39m
[01:30:17.595]  [90m    |[39m   [31m[1m^[22m[39m
[01:30:17.595]  [90m 23 |[39m   useTheme[33m,[39m
[01:30:17.595]  [90m 24 |[39m   useMediaQuery[33m,[39m
[01:30:17.595]  [90m 25 |[39m   [33mDivider[39m[33m,[39m[0m
[01:30:17.676] Next.js build worker exited with code: 1 and signal: null
[01:30:17.719] Error: Command "npm run build" exited with 1


 Context7을 사용하여 MUI Grid 관련 정보를 검색하겠습니다.

● context7-mcp - resolve-library-id (MCP)(libraryName: "MUI Grid component responsive")
  ⎿  Available Libraries (top matches):

     Each result includes:
     … +278 lines (ctrl+r to expand)

● context7-mcp - get-library-docs (MCP)(context7CompatibleLibraryID: "/mui/material-ui", topic: "Grid
                                       component responsive breakpoints", tokens: 2000)
  ⎿  ========================        
     CODE SNIPPETS
     ========================
     … +1820 lines (ctrl+r to expand)

> --seq--desktop

● Sequential Thinking과 Desktop MCP를 사용하여 Grid 문제를 체계적으로 해결하겠습니다.

● mcp-sequentialthinking-tools - sequentialthinking_tools (MCP)
MUI v7에서 Grid와 GridLegacy만 있고 Grid2는 없습니다. Grid를 그대로 사용해야 합니다. Grid import


  ⎿  To https://github.com/pihaier/DULYHOME.git
        a6d9425c..489da410  final-deploy -> final-deploy


● Bash(cd nextjs_flexy && git checkout deploy-branch && git merge final-deploy)
  ⎿  Waiting…

  ⎿  Error: error: Your local changes to the following files would be overwritten by checkout:
        database-schema/verlcellog.md
     Please commit your changes or stash them before you switch branches.
     Aborting


● Bash(cd .. && git stash && cd nextjs_flexy && git checkout deploy-branch)
  ⎿  Waiting…

  ⎿  Error: cd in 'C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료' was blocked. For security, Claude        
     Code may only change directories to the allowed working directories for this session:
     'C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom'.


● Bash(git stash && cd nextjs_flexy && git checkout deploy-branch)
  ⎿  Waiting…

  ⎿ Saved working directory and index state WIP on final-deploy: 489da410 fix: MUI v7 Grid 컴포넌트
    모바일 반응형 수
    정
    Switched to branch 'deploy-branch'





● deploy-branch로 체크아웃했는데 모바일 반응형 코드가 없어졌습니다. final-deploy 브랜치의 변경사항을
  병합하겠습니다.


● Bash(cd nextjs_flexy && git merge final-deploy)
  ⎿  Waiting…

  ⎿  Error: fatal: refusing to merge unrelated histories


● Bash(cd nextjs_flexy && git merge final-deploy --allow-unrelated-histories)
  ⎿  Waiting…

  ⎿  Error: Auto-merging .github/workflows/ci.yml
     CONFLICT (add/add): Merge conflict in .git
     hub/workflows/ci.yml
     Auto-merging CODE_REVIEW_ISSUES.md
     Auto-merging nextjs_flexy/next.config.mjs
     CONFLICT (add/add): Merge conflict in nextjs_flexy/next.config.mjs
     Auto-merging nextjs_flexy/package-lock.json
     CONFLICT (add/add): Merge conflict in nextjs_flexy/package-lock.json
     Auto-merging nextjs_flexy/package.json
     CONFLICT (add/add): Merge conflict in nextjs_flexy/package.json
     Auto-merging nextjs_flexy/scripts/import-hs-codes.js
     … +56 lines (ctrl+r to see all)