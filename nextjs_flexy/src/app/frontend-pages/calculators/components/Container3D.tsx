'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box as Box3D, Grid, Line, Text, Instance, Instances } from '@react-three/drei';
import { Card, CardContent, Typography, Box as MuiBox, Alert, Chip, Stack } from '@mui/material';
import { useMemo } from 'react';
import * as THREE from 'three';

interface Container3DProps {
  boxSize: { width: number; height: number; depth: number };
  quantity: number;
  containerType: '20ft' | '40ft' | '40hc';
}

// 컨테이너 사양 (미터 단위)
const CONTAINERS = {
  '20ft': { length: 5.89, width: 2.35, height: 2.39, cbm: 33.2 },
  '40ft': { length: 12.03, width: 2.35, height: 2.39, cbm: 67.7 },
  '40hc': { length: 12.03, width: 2.35, height: 2.70, cbm: 76.4 }
};

export default function Container3D({ boxSize, quantity, containerType }: Container3DProps) {
  const container = CONTAINERS[containerType];
  
  // 박스 크기 (cm를 미터로 변환)
  const boxDimensions = {
    width: boxSize.width / 100,
    height: boxSize.height / 100,
    depth: boxSize.depth / 100
  };

  // 박스 배치 계산
  const boxPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const { length, width, height } = container;
    const { width: boxW, height: boxH, depth: boxD } = boxDimensions;
    
    // 컨테이너에 들어갈 수 있는 박스 개수 계산
    const boxesX = Math.floor(length / boxW);
    const boxesY = Math.floor(width / boxD);
    const boxesZ = Math.floor(height / boxH);
    
    const maxBoxes = Math.min(boxesX * boxesY * boxesZ, quantity);
    
    // 박스 위치 생성
    let count = 0;
    for (let z = 0; z < boxesZ && count < maxBoxes; z++) {
      for (let y = 0; y < boxesY && count < maxBoxes; y++) {
        for (let x = 0; x < boxesX && count < maxBoxes; x++) {
          positions.push([
            -length/2 + boxW/2 + x * boxW,
            -height/2 + boxH/2 + z * boxH,
            -width/2 + boxD/2 + y * boxD
          ]);
          count++;
        }
      }
    }
    
    return positions;
  }, [boxSize, quantity, containerType]);

  // 공간 활용률 계산
  const efficiency = useMemo(() => {
    const boxVolume = (boxSize.width * boxSize.height * boxSize.depth) / 1000000; // m³
    const totalBoxVolume = boxVolume * boxPositions.length;
    return (totalBoxVolume / container.cbm) * 100;
  }, [boxSize, boxPositions, container]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            3D 시뮬레이션
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Chip label={`${containerType.toUpperCase()} 컨테이너`} color="primary" />
            <Chip label={`박스 ${boxPositions.length}/${quantity}개`} />
            <Chip label={`공간 활용률 ${efficiency.toFixed(1)}%`} color={efficiency > 70 ? "success" : "warning"} />
          </Stack>
          
          {boxPositions.length < quantity && (
            <Alert severity="warning">
              {containerType} 컨테이너에는 {boxPositions.length}개만 적재 가능합니다.
              나머지 {quantity - boxPositions.length}개는 추가 컨테이너가 필요합니다.
            </Alert>
          )}
          
          <MuiBox 
            sx={{ 
              height: 500, 
              bgcolor: 'grey.100', 
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Canvas camera={{ position: [15, 10, 15], fov: 50 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 10, 5]} castShadow intensity={1} />
              
              {/* 컨테이너 외곽선 */}
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(container.length, container.height, container.width)]} />
                <lineBasicMaterial color="black" linewidth={2} />
              </lineSegments>
              
              {/* 컨테이너 반투명 벽 */}
              <Box3D args={[container.length, container.height, container.width]}>
                <meshStandardMaterial color="#e0e0e0" transparent opacity={0.1} side={THREE.BackSide} />
              </Box3D>
              
              {/* 박스들 렌더링 - 인스턴싱 사용 */}
              {boxPositions.length > 100 ? (
                <Instances limit={boxPositions.length}>
                  <boxGeometry args={[boxDimensions.width, boxDimensions.height, boxDimensions.depth]} />
                  <meshStandardMaterial color="#1976d2" />
                  {boxPositions.map((position, i) => (
                    <Instance key={i} position={position} />
                  ))}
                </Instances>
              ) : (
                boxPositions.map((position, i) => (
                  <Box3D
                    key={i}
                    position={position}
                    args={[boxDimensions.width, boxDimensions.height, boxDimensions.depth]}
                  >
                    <meshStandardMaterial color="#1976d2" opacity={0.9} transparent />
                  </Box3D>
                ))
              )}
              
              {/* 바닥 그리드 */}
              <Grid 
                args={[20, 20]} 
                cellColor="gray" 
                sectionColor="darkgray"
                position={[0, -container.height/2 - 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              />
              
              {/* 컨트롤 */}
              <OrbitControls 
                enableDamping 
                dampingFactor={0.05}
                maxPolarAngle={Math.PI / 2}
                minDistance={5}
                maxDistance={30}
              />
            </Canvas>
          </MuiBox>
          
          <Typography variant="caption" color="text.secondary">
            마우스로 드래그하여 회전, 스크롤로 줌 인/아웃
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}