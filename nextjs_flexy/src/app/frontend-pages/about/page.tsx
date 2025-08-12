import PageContainer from '@/app/components/container/PageContainer';
import HpHeader from '../../components/frontend-pages/shared/header/HpHeader';
import C2a from '../../components/frontend-pages/shared/c2a';
import Footer from '../../components/frontend-pages/shared/footer';
import Banner from '../../components/frontend-pages/about/banner';
import CompanyIntro from '../../components/frontend-pages/about/company-intro';
import ScrollToTop from '../../components/frontend-pages/shared/scroll-to-top';

const About = () => {
    return (
        <PageContainer title="회사소개 - 두리무역" description="두리무역은 7년간의 한-중 무역 경험을 바탕으로 전문적인 수입대행 및 검품감사 서비스를 제공합니다">
            <HpHeader />
            <Banner />
            <CompanyIntro />
            <C2a />
            <Footer />
            <ScrollToTop />
        </PageContainer>
    );
};

export default About;
