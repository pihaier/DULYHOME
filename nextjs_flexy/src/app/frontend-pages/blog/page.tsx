import React from "react";
import CustomerSupportWithFallback from "../../components/frontend-pages/blog/customer-support/CustomerSupportWithFallback";
import PageContainer from '@/app/components/container/PageContainer';
import HeaderAlert from '../../components/frontend-pages/shared/header/HeaderAlert';
import HpHeader from '../../components/frontend-pages/shared/header/HpHeader';
import C2a from '../../components/frontend-pages/shared/c2a';
import Footer from '../../components/frontend-pages/shared/footer';
import ScrollToTop from '../../components/frontend-pages/shared/scroll-to-top';

const CustomerSupportPage = () => {

    return (
        <>
            <PageContainer title="고객지원 - 두리무역" description="두리무역 고객지원 센터 - 공지사항과 자주 묻는 질문">

                <HeaderAlert />
                <HpHeader />
                <CustomerSupportWithFallback />
                <C2a />
                <Footer />
                <ScrollToTop />
            </PageContainer>
        </>
    );
};

export default CustomerSupportPage;