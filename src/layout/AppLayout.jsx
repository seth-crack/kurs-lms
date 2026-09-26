import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import MobileDrawer from './MobileDrawer';
import { useUsers } from '../store/useUsers';
import { useHomework } from '../store/useHomework';
import { useGroups } from '../store/useGroups';
import { useChats } from '../store/useChats';
import { useSchedule } from '../store/useSchedule';
import { useMaterials } from '../store/useMaterials';
import { useAttendance } from '../store/useAttendance';
import { useFinalGrades } from '../store/useFinalGrades';
import { useNotifs } from '../store/useNotifs';

export default function AppLayout({ children, page }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    useUsers.getState().refresh();
    useHomework.getState().refresh();
    useGroups.getState().refresh();
    useSchedule.getState().refresh();
    useMaterials.getState().refresh();
    useAttendance.getState().refresh();
    useFinalGrades.getState().refresh();
  }, []);

  useEffect(() => {
    return () => {
      useChats.getState().reset();
      useNotifs.getState().reset();
    };
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar page={page} />
        <MobileHeader
          onMenu={() => setDrawerOpen(true)}
          onNotifs={() => setDrawerOpen(true)}
        />

        <main className="content">{children}</main>

        <MobileNav />
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}