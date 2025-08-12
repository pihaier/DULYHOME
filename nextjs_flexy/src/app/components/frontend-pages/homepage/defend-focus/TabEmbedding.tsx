'use client';
import * as React from 'react';
import { Box, Divider, Typography, Grid, Button } from '@mui/material';

import { styled } from "@mui/material/styles";
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useState } from 'react';


const StyledAccordian = styled(Accordion)(() => ({
    boxShadow: 'none',
    marginBottom: '0 !important',
    backgroundColor: 'transparent',

    '&.Mui-expanded': {
        margin: '0'
    },
    '& .MuiAccordionSummary-root': {
        padding: 0,
        minHeight: '60px'
    },
    '& .MuiAccordionDetails-root': {
        padding: '0 0 20px'
    }
}));


const TabEmbedding = () => {

    const [expanded, setExpanded] = useState(true);
    const [expanded2, setExpanded2] = useState(false);
    const [expanded3, setExpanded3] = useState(false);

    const handleChange2 = () => {
        setExpanded(!expanded);
    };

    const handleChange3 = () => {
        setExpanded2(!expanded2);
    };

    const handleChange4 = () => {
        setExpanded3(!expanded3);
    };

    return (
        (<Grid container spacing={{ xs: 3, lg: 8 }}>
            <Grid
                size={{
                    xs: 12,
                    lg: 6
                }}>
                <Box
                    sx={{
                        width: "100%",
                        height: "400px",
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <Image src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20quality%20inspection%20service%20illustration%20with%20magnifying%20glass%2C%20checklist%2C%20product%20testing%2C%20quality%20control%20equipment%2C%20inspector%20examining%20products%2C%20modern%20industrial%20style%2C%20orange%20and%20white%20color%20scheme&image_size=square_hd" width={500} height={500} style={{
                        width: '100%',
                        height: '120%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: '0',
                        left: '0'
                    }} alt="검품감사 서비스" />
                </Box>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    lg: 6
                }}>
                <Typography variant='h4' sx={{
                    fontSize: {
                        lg: '40px',
                        xs: '35px'
                    }
                }} fontWeight="700" mt={5}>검품감사 서비스</Typography>
                <Box mt={4}>
                    <StyledAccordian expanded={expanded3} onChange={handleChange4}>
                        <AccordionSummary
                            expandIcon={expanded3 ? <IconMinus size="21" stroke="1.5" /> : <IconPlus size="21" stroke="1.5" />}
                            aria-controls="panel3-content"
                            id="panel3-header"
                        >
                            <Typography fontSize="17px" fontWeight="600">현지 직접 출장 검품</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                중국 현지 공장에 직접 방문하여 제품의 품질, 수량, 포장 상태를 꼼꼼히 검수합니다. 검품 전 과정을 사진과 동영상으로 기록하여 실시간 공유합니다.
                            </Typography>
                        </AccordionDetails>
                    </StyledAccordian>
                    <Divider />
                    <StyledAccordian expanded={expanded} onChange={handleChange2}>
                        <AccordionSummary
                            expandIcon={expanded ? <IconMinus size="21" stroke="1.5" /> : <IconPlus size="21" stroke="1.5" />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography fontSize="17px" fontWeight="600">철저한 품질 검수 시스템</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                7년간 축적된 검품 노하우를 바탕으로 체계적인 품질 검수를 진행합니다. 불량품 선별, 규격 확인, 기능 테스트까지 완벽하게 수행합니다.
                            </Typography>
                        </AccordionDetails>
                    </StyledAccordian>
                    <Divider />
                    <StyledAccordian expanded={expanded2} onChange={handleChange3}>
                        <AccordionSummary
                            expandIcon={expanded2 ? <IconMinus size="21" stroke="1.5" /> : <IconPlus size="21" stroke="1.5" />}
                            aria-controls="panel2-content"
                            id="panel2-header"
                        >
                            <Typography fontSize="17px" fontWeight="600">상세한 검품 보고서 제공</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                검품 결과를 상세한 보고서로 작성하여 제공합니다. 제품별 상태, 불량률, 개선사항 등을 체계적으로 정리하여 의사결정에 도움을 드립니다.
                            </Typography>
                        </AccordionDetails>
                    </StyledAccordian>
                    <Divider />

                    <Box mt={3}>
                        <Button variant='contained' color="primary" size="large">검품감사 문의하기</Button>
                    </Box>
                </Box>
            </Grid>
        </Grid>)
    );
};
export default TabEmbedding;
