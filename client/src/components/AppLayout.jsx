import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-layout" style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />
      <div 
        className="app-content-wrapper" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          flexGrow: 1, 
          minWidth: 0,
        }}
      >
        <Topbar
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <main className="app-content" style={{ flexGrow: 1, padding: "28px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
