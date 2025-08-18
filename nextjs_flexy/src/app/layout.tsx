import React from 'react';
import { CustomizerContextProvider } from './context/customizerContext';
import { GlobalProvider } from '@/lib/context/GlobalContext';
import { ChatTranslationProvider } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import MyApp from './app';
import './global.css';
import NextTopLoader from 'nextjs-toploader';

export const metadata = {
  title: '두리무역 ERP 시스템',
  description:
    '중국 무역 전문 서비스 - 시장조사·공장컨택·검품감사 중심, 구매·배송대행은 업데이트 중',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/duly-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader color="#1e4db7" />
        <GlobalProvider>
          <ChatTranslationProvider>
            <CustomizerContextProvider>
              <MyApp>{children}</MyApp>
            </CustomizerContextProvider>
          </ChatTranslationProvider>
        </GlobalProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
