'use client'
import { useContext } from "react";

import Link from "next/link";
import { styled } from "@mui/material";
import config from '@/app/context/config'
import Image from "next/image";
import { CustomizerContext } from "@/app/context/customizerContext";

const Logo = () => {
  const { isCollapse, isSidebarHover, activeDir, activeMode } = useContext(CustomizerContext);
  const TopbarHeight = config.topbarHeight;

  const LinkStyled = styled(Link)(() => ({
    height: TopbarHeight,
    width: isCollapse == "mini-sidebar" && !isSidebarHover ? '50px' : '180px',
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  }));

  const logoWidth = isCollapse == "mini-sidebar" && !isSidebarHover ? 40 : 50;
  const logoHeight = isCollapse == "mini-sidebar" && !isSidebarHover ? 40 : 50;

  return (
    <LinkStyled href="/">
      <Image
        src="/images/duly-logo.png"
        alt="두리무역"
        height={logoHeight}
        width={logoWidth}
        priority
        style={{ objectFit: 'contain' }}
      />
      {!(isCollapse == "mini-sidebar" && !isSidebarHover) && (
        <span style={{ 
          marginLeft: '10px', 
          fontSize: '20px', 
          fontWeight: 'bold',
          color: activeMode === "dark" ? '#ffffff' : '#CC0000'
        }}>
          두리무역
        </span>
      )}
    </LinkStyled>
  );
};

export default Logo;
