'use client';
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const GoogleMap = () => {
  // 두리무역 정확한 주소와 좌표
  const address = '인천광역시 연수구 센트럴로 313 B2512';
  const encodedAddress = encodeURIComponent(address + ' 송도 센트로드');

  // Google Maps Embed API URL - 주소 검색 기반
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}&zoom=17&language=ko`;

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight={600}>
          찾아오시는 길
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '400px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <iframe
          width="100%"
          height="100%"
          style={{
            border: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          title="두리무역 위치"
        />
      </Box>
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary">
          📍 {address} (송도동, 송도 센트로드)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          🚇 지하철: 인천1호선 센트럴파크역 3번 출구 도보 5분
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          🚌 버스: 6-1, 8, 909번 센트로드 정류장 하차
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            구글 지도에서 크게 보기 →
          </a>
        </Typography>
      </Box>
    </Paper>
  );
};

export default GoogleMap;
