"use client";
import React, { useState, useRef } from "react";
import {
  Avatar,
  CardContent,
  Divider,
  Stack,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

function SampleNextArrow(props: any) {
  const { className, onClick } = props;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      className={className}
      sx={{
        cursor: "pointer",
        position: "absolute",
        left: "125px",
        zIndex: 1,
        bottom: "45px",
        right: 0,
        backgroundColor: (theme) => theme.palette.grey[100],
        width: "32px",
        height: "32px",
        borderRadius: "50%",
      }}
      onClick={onClick}
    >
      <IconChevronRight strokeWidth={1.5} size={20} />
    </Box>
  );
}

function SamplePrevArrow(props: any) {
  const { className, onClick } = props;
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      className={className}
      sx={{
        cursor: "pointer",
        position: "absolute",
        left: "48px",
        zIndex: 1,
        bottom: "45px",
        right: "60px",
        backgroundColor: (theme) => theme.palette.grey[100],
        width: "32px",
        height: "32px",
        borderRadius: "50%",
      }}
      onClick={onClick}
    >
      <IconChevronLeft strokeWidth={1.5} size={20} />
    </Box>
  );
}

const Reviews = [
  {
    id: 1,
    img: "/images/users/1.jpg",
    name: "㈜대한무역 김철수 대표",
    text: "두리무역과 함께한 지 3년째입니다. 현지 상주팀의 꼼꼼한 검수와 신속한 대응 덕분에 안심하고 거래할 수 있었습니다. 특히 실시간 진행상황 공유가 큰 도움이 됩니다.",
  },
  {
    id: 2,
    img: "/images/users/2.jpg",
    name: "㈜글로벌상사 이영희 부장",
    text: "처음 중국 무역을 시작할 때 막막했는데, 두리무역의 체계적인 시스템과 전문적인 조언 덕분에 성공적으로 사업을 확장할 수 있었습니다. 강력 추천합니다!",
  },
  {
    id: 3,
    img: "/images/users/3.jpg",
    name: "㈜코리아트레이드 박민수 이사",
    text: "품질 검수부터 통관까지 원스톱으로 처리해주셔서 업무 효율이 크게 향상되었습니다. 7년 경력의 전문성이 느껴지는 서비스입니다.",
  },
  {
    id: 4,
    img: "/images/users/4.jpg",
    name: "㈜아시아무역 최지현 팀장",
    text: "타 업체와 비교해도 두리무역의 서비스는 월등합니다. 특히 문제 발생 시 신속한 대처와 투명한 커뮤니케이션이 인상적이었습니다.",
  },
  {
    id: 5,
    img: "/images/users/5.jpg",
    name: "㈜한중교역 정대호 과장",
    text: "중국 현지 사정에 밝은 전문팀 덕분에 시행착오 없이 안정적인 거래를 이어가고 있습니다. 합리적인 가격과 우수한 서비스 품질에 매우 만족합니다.",
  },
];

const ReviewCarousel = ({ isRTL }: any) => {
  const [oldSlide, setOldSlide] = useState(0);
  const [activeSlide, setActiveSlide] = useState(1);
  const [activeSlide2, setActiveSlide2] = useState(1);

  let sliderRef = useRef<Slider | null>(null); 

  const settings = {
    dots: false,
    fade: true,
    infinite: true,
    speed: 500,
    rtl: isRTL,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    beforeChange: (current: any, next: any) => {
      setOldSlide(current);
      setActiveSlide(next);
    },
    afterChange: (current: any) => setActiveSlide2(current),
  };

  return (
    <>
      <Slider
        ref={(slider: Slider | null) => {
          sliderRef.current = slider;
        }}
        {...settings}
      >
        {Reviews.map((review, i) => (
          <div key={i}>
            <Paper variant="outlined" sx={{ borderRadius: "16px" }}>
              <CardContent sx={{ p: "48px !important" }}>
                <Typography
                  variant="h4"
                  lineHeight={1.4}
                  mb={3}
                  fontWeight={600}
                  fontSize="24px"
                >
                  고객 후기
                </Typography>
                <Stack direction="row" alignItems="center" gap={3} mb={3}>
                  <Avatar src={review.img} alt="user" />
                  <Typography variant="body1" fontWeight={600}>
                    {review.name}
                  </Typography>
                </Stack>
                <Typography variant="body1" lineHeight={1.8} mb={2}>
                  {review.text}
                </Typography>
                <Divider />

                <Typography fontSize="14px" fontWeight={500} ml={5} mt={3}>
                  {" "}
                  {activeSlide} / {Reviews.length}
                </Typography>
              </CardContent>
            </Paper>
          </div>
        ))}
      </Slider>
    </>
  );
};

export default ReviewCarousel;
