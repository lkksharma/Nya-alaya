import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  Users, 
  Home,
  Info,
  Grid,
  Gavel,
  Menu,
  X,
  Search
} from 'lucide-react';
import './Layout.css';

/* Add these styles to Layout.css via a separate tool call or append here if possible. 
   Since I can't append to a different file in this tool call, I'll assume I need to update Layout.css next.
   For now, I'll just update the import.
*/

const navItems = [
  { path: '/', name: 'Home', icon: Home, theme: 'var(--bg-body)' },
  { path: '/about', name: 'About', icon: Info, theme: '#f8fafc' },
  { path: '/tools', name: 'Tools', icon: Grid, theme: '#f0fdf4' },
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, theme: '#f1f5f9' },
];

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const currentTheme = navItems.find(item => item.path === location.pathname)?.theme || 'var(--bg-body)';

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tools = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cases', path: '/cases', icon: FileText },
    { name: 'Judges', path: '/judges', icon: Scale },
    { name: 'Lawyers', path: '/lawyers', icon: Users },
    { name: 'Tools', path: '/tools', icon: Grid },
    { name: 'About', path: '/about', icon: Info },
  ];

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div 
      className="app-layout"
      animate={{ backgroundColor: currentTheme }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <header className="top-navbar glass-panel">
        <div className="navbar-container">
          <div className="logo-section">
            <div className="logo-icon">
              <Gavel size={24} color="white" />
            </div>
            <span className="logo-text">Nya-Alaya</span>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div 
                      className="active-underline"
                      layoutId="activeUnderline"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="search-trigger-btn"
              onClick={() => setSearchOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.2)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ opacity: 0.7 }}>Search...</span>
              <span style={{ 
                background: 'rgba(0,0,0,0.1)', 
                padding: '0.1rem 0.4rem', 
                borderRadius: '4px', 
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}>⌘K</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="search-modal-overlay" onClick={() => setSearchOpen(false)}>
          <motion.div 
            className="search-modal glass-panel"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="search-modal-header">
              <Search size={20} className="search-icon" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search tools..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="modal-search-input"
              />
              <button onClick={() => setSearchOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="search-results">
              {filteredTools.map(tool => (
                <Link 
                  key={tool.path} 
                  to={tool.path} 
                  className="search-result-item"
                  onClick={() => setSearchOpen(false)}
                >
                  <tool.icon size={18} />
                  <span>{tool.name}</span>
                  <span className="result-arrow">→</span>
                </Link>
              ))}
              {filteredTools.length === 0 && (
                <div className="no-results">No results found</div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Nav */}
      <motion.div 
        className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}
        initial={false}
        animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
      >
        <div className="mobile-nav-content glass-panel">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </motion.div>
  );
};

export default Layout;
