'use client';
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import Link from 'next/link';
import './carousel.css';
import { Box } from '@mui/material';
import Image from 'next/image';

const DozensCarousel = () => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 4500,
    autoplay: true,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <Slider {...settings} className="dozenscarousel">
        {/* 시장조사 */}
        <div>
          <Box
            width={380}
            height={300}
            borderRadius="16px"
            sx={{ boxShadow: (theme) => theme.shadows[10], overflow: 'hidden', bgcolor: 'white' }}
          >
            <Link href="/application/market-research" prefetch={false}>
              <Image
                src="/images/services/home1.jpg"
                alt="두리무역 스크린샷 1"
                width={380}
                height={300}
                style={{ borderRadius: '16px', objectFit: 'contain', padding: 16 }}
              />
            </Link>
          </Box>
        </div>
        {/* 공장컨택 */}
        <div>
          <Box
            width={380}
            height={300}
            borderRadius="16px"
            sx={{ boxShadow: (theme) => theme.shadows[10], overflow: 'hidden', bgcolor: 'white' }}
          >
            <Link href="/application/factory-contact" prefetch={false}>
              <Image
                src="/images/services/home2.jpg"
                alt="두리무역 스크린샷 2"
                width={380}
                height={300}
                style={{ borderRadius: '16px', objectFit: 'contain', padding: 16 }}
              />
            </Link>
          </Box>
        </div>
        {/* 검품감사 */}
        <div>
          <Box
            width={380}
            height={300}
            borderRadius="16px"
            sx={{ boxShadow: (theme) => theme.shadows[10], overflow: 'hidden', bgcolor: 'white' }}
          >
            <Link href="/application/inspection" prefetch={false}>
              <Image
                src="/images/services/home3.jpg"
                alt="두리무역 스크린샷 3"
                width={380}
                height={300}
                style={{ borderRadius: '16px', objectFit: 'contain', padding: 16 }}
              />
            </Link>
          </Box>
        </div>
        {/* HS 코드/계산기 */}
        <div>
          <Box
            width={380}
            height={300}
            borderRadius="16px"
            sx={{ boxShadow: (theme) => theme.shadows[10], overflow: 'hidden', bgcolor: 'white' }}
          >
            <Link href="/frontend-pages/calculators" prefetch={false}>
              <Image
                src="/images/services/home4.jpg"
                alt="두리무역 스크린샷 4"
                width={380}
                height={300}
                style={{ borderRadius: '16px', objectFit: 'contain', padding: 16 }}
              />
            </Link>
          </Box>
        </div>
      </Slider>
    </>
  );
};

export default DozensCarousel;
