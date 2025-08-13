import PageContainer from '@/app/components/container/PageContainer';
import Banner from '../../components/frontend-pages/homepage/banner/Banner';
import HeaderAlert from '../../components/frontend-pages/shared/header/HeaderAlert';
import HpHeader from '../../components/frontend-pages/shared/header/HpHeader';
import Features from '../../components/frontend-pages/homepage/features/Features';
import DefendFocus from '../../components/frontend-pages/homepage/defend-focus';
import AITradeSystem from '../../components/frontend-pages/homepage/ai-trade-system';
import RealtimeTranslation from '../../components/frontend-pages/homepage/realtime-translation';
import AIIntelligenceSystem from '../../components/frontend-pages/homepage/ai-intelligence';
import FAQ from '../../components/frontend-pages/homepage/faq';
import ServiceOverview from '../../components/frontend-pages/homepage/service-overview';
import C2aEnhanced from '../../components/frontend-pages/shared/c2a-enhanced';
import Footer from '../../components/frontend-pages/shared/footer';
import ScrollToTop from '../../components/frontend-pages/shared/scroll-to-top';

const HomePage = () => {
  return (
    <PageContainer
      title="두리무역 - 한중 무역 전문 서비스"
      description="7년간의 경험을 바탕으로 한-중 무역의 모든 과정을 지원하는 두리무역입니다. 시장조사, 샘플링, 대량주문, 검품감사 전문 서비스를 제공합니다."
    >
      <HeaderAlert />
      <HpHeader />
      <Banner />
      <Features />
      <ServiceOverview />
      <RealtimeTranslation />
      {/* 무거운 섹션 임시 제외: ShippingShowcase, PowerfulDozens */}
      <AIIntelligenceSystem />
      <AITradeSystem />
      <DefendFocus />
      <FAQ />
      <C2aEnhanced />
      <Footer />
      <ScrollToTop />
    </PageContainer>
  );
};

export default HomePage;
