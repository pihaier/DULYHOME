"use client";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Breadcrumb from "@/app/dashboard/layout/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/container/PageContainer";
import NoteSidebar from "@/app/components/apps/notes/NoteSidebar";
import NoteContent from "@/app/components/apps/notes/NoteContent";
import AppCard from "@/app/components/shared/AppCard";
import { NotesProvider } from '@/app/context/NotesContext/index'
import { usePathname } from "next/navigation";
import { mutate } from "swr";


const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Notes",
  },
];

export default function Notes() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));

  const location = usePathname();


  // Reset Notes on browser refresh
  const handleResetTickets = async () => {
    const response = await fetch("/api/notes", {
      method: 'GET',
      headers: {
        "broserRefreshed": "true"
      }
    });
    const result = await response.json();
    await mutate("/api/notes");
  }

  useEffect(() => {
    const isPageRefreshed = sessionStorage.getItem("isPageRefreshed");
    if (isPageRefreshed === "true") {
      console.log("page refreshed");
      sessionStorage.removeItem("isPageRefreshed");
      handleResetTickets();
    }
  }, [location]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("isPageRefreshed", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  return (
    <NotesProvider>
      <PageContainer title="Note App" description="this is Note App">
        <Breadcrumb title="Note app" items={BCrumb} />
        <AppCard>
          {lgDown ? (
            <NoteSidebar
              isMobileSidebarOpen={isMobileSidebarOpen}
              onSidebarClose={() => setMobileSidebarOpen(false)}
            />
          ) : (
            <NoteSidebar
              isMobileSidebarOpen={true}
              onSidebarClose={() => setMobileSidebarOpen(false)}
            />
          )}

          <Box flexGrow={1}>
            <NoteContent
              toggleNoteSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
            />
          </Box>
        </AppCard>
      </PageContainer>
    </NotesProvider>
  );
}
