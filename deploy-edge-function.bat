@echo off
echo Deploying Edge Function...
cd C:\Users\bishi\Desktop\💻_개발_프로그램\개발자료\erp-custom
npx supabase functions deploy get-product-detail --no-verify-jwt
echo Done!