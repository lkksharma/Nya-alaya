import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  Users, 
  Menu, 
  X,
  Landmark
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/cases', name: 'Cases', icon: FileText },
    { path: '/judges', name: 'Judges', icon: Scale },
    { path: '/lawyers', name: 'Lawyers', icon: Users },
  ];

  return (
    <div className="layout">
      {/* Header */}
      <motion.header 
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="header-content">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="logo-section">
              <Landmark className="logo-icon" size={32} />
              <div className="logo-text">
                <h1>Nya-Alaya</h1>
                <p className="logo-subtitle">न्याय आलय - Court Scheduling System</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="emblem-section">
              <div className="emblem-text">
                <p className="sanskrit">सत्यमेव जयते</p>
                <p className="translation">Truth Alone Triumphs</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="main-container">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside 
              className="sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <nav className="sidebar-nav">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link 
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="nav-item-content"
                      >
                        <Icon size={20} />
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div 
                            className="active-indicator"
                            layoutId="activeTab"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              <div className="sidebar-footer">
                <div className="version-info">
                  <p>Version 1.0.0</p>
                  <p className="copyright">© 2025 Nya-Alaya</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

