import PageContainer from '@/app/components/container/PageContainer';
import HeaderAlert from '../../components/frontend-pages/shared/header/HeaderAlert';
import HpHeader from '../../components/frontend-pages/shared/header/HpHeader';
import Footer from '../../components/frontend-pages/shared/footer';
import ScrollToTop from '../../components/frontend-pages/shared/scroll-to-top';
import ServicesBanner from '../../components/frontend-pages/services/banner';
import ServicesContent from '../../components/frontend-pages/services/content';
import C2a from '../../components/frontend-pages/shared/c2a';

const Services = () => {
    return (
        <PageContainer title="서비스 - 두리무역" description="두리무역의 한-중 무역 전문 서비스를 소개합니다">
            <HeaderAlert />
            <HpHeader />
            <ServicesBanner />
            <ServicesContent />
            <C2a />
            <Footer />
            <ScrollToTop />
        </PageContainer>
    );
};

export default Services;