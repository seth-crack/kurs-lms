import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import MobileDrawer from './MobileDrawer';

export default function AppLayout({ children, page }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

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