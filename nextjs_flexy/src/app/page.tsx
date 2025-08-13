import PageContainer from '@/app/components/container/PageContainer';
import Banner from './components/frontend-pages/homepage/banner/Banner';
import HpHeader from './components/frontend-pages/shared/header/HpHeader';
import RealtimeTranslation from './components/frontend-pages/homepage/realtime-translation';
import AIIntelligence from './components/frontend-pages/homepage/ai-intelligence';
import AITradeSystem from './components/frontend-pages/homepage/ai-trade-system';
import ServiceOverview from './components/frontend-pages/homepage/service-overview';
// import ShippingShowcase from './components/frontend-pages/homepage/shipping-showcase';
// import PowerfulDozens from './components/frontend-pages/homepage/powerful-dozens';
import DefendFocus from './components/frontend-pages/homepage/defend-focus';
import ExceptionalFeature from './components/frontend-pages/homepage/exceptional-feature';
import FAQ from './components/frontend-pages/homepage/faq';
import C2a from './components/frontend-pages/shared/c2a';
import Footer from './components/frontend-pages/shared/footer';
import ScrollToTop from './components/frontend-pages/shared/scroll-to-top';

const HomePage = () => {
  return (
    <PageContainer
      title="두리무역 - 중국 무역 전문 서비스"
      description="두리무역은 중국 시장조사, 공장컨택, 검품감사 전문 서비스를 제공합니다. 구매·배송대행은 시스템 업데이트 중입니다."
    >
      <HpHeader />
      <Banner />
      <ServiceOverview />
      <RealtimeTranslation />
      <AIIntelligence />
      <AITradeSystem />
      {/* <ShippingShowcase /> */}
      {/* <PowerfulDozens /> */}
      {/* <DefendFocus /> */}
      <ExceptionalFeature />
      <FAQ />
      <C2a />
      <Footer />
      <ScrollToTop />
    </PageContainer>
  );
};

export default HomePage;
