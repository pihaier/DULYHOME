import PageContainer from '@/app/components/container/PageContainer';
import HeaderAlert from '../../components/frontend-pages/shared/header/HeaderAlert';
import HpHeader from '../../components/frontend-pages/shared/header/HpHeader';
import { Box, Typography, Container, Grid } from "@mui/material";
import C2a from '../../components/frontend-pages/shared/c2a';
import Footer from '../../components/frontend-pages/shared/footer';
import Form from '../../components/frontend-pages/contact/form';
import ScrollToTop from '../../components/frontend-pages/shared/scroll-to-top';

const Contact = () => {
    return (
        <PageContainer title="Contact" description="this is Contact">

            <HeaderAlert />
            <HpHeader />
            
            {/* 배너 섹션 - 큰 지도 제거하고 텍스트만 표시 */}
            <Box bgcolor="primary.light" sx={{
                paddingTop: {
                    xs: '40px',
                    lg: '100px',
                },
                paddingBottom: {
                    xs: '40px',
                    lg: '100px',
                }
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} justifyContent="center">
                        <Grid
                            alignItems="center"
                            textAlign="center"
                            size={{
                                xs: 12,
                                lg: 8
                            }}>
                            <Typography color="primary.main" textTransform="uppercase" fontSize="13px">문의하기</Typography>
                            <Typography variant="h1" mb={3} lineHeight={1.4} fontWeight={700} sx={{
                                fontSize: {
                                    xs: '34px', sm: '48px', lg: '56px'
                                }
                            }}>두리무역에 문의해주세요</Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            
            <Form />
            <C2a />
            <Footer />
            <ScrollToTop />
        </PageContainer>
    );
};

export default Contact;
