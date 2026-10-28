import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const Layout = ({ config, onConfigUpdate }) => {
  return (
    <div className="app-container">
      <Sidebar config={config} onConfigUpdate={onConfigUpdate} />
      <div className="main-content">
        <Header config={config} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
