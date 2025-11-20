import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Scale, Users, ArrowRight, Gavel, Shield, BookOpen } from 'lucide-react';
import './Tools.css';

const Tools = () => {
  const tools = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Real-time overview of court statistics, pending cases, and daily schedules.',
      icon: LayoutDashboard,
      link: '/dashboard',
      color: 'primary',
      bgPattern: 'pattern-1'
    },
    {
      id: 'cases',
      title: 'Case Management',
      description: 'Add, update, and track legal cases with detailed metadata and status tracking.',
      icon: FileText,
      link: '/cases',
      color: 'success',
      bgPattern: 'pattern-2'
    },
    {
      id: 'judges',
      title: 'Judge Management',
      description: 'Manage judge profiles, availability, and view individual schedules.',
      icon: Scale,
      link: '/judges',
      color: 'warning',
      bgPattern: 'pattern-3'
    },
    {
      id: 'lawyers',
      title: 'Lawyer Management',
      description: 'Register lawyers, track their caseloads, and manage their court appearances.',
      icon: Users,
      link: '/lawyers',
      color: 'info',
      bgPattern: 'pattern-4'
    }
  ];

  const quickLinks = [
    { title: 'Court Rules', icon: Gavel },
    { title: 'Legal Code', icon: BookOpen },
    { title: 'Security', icon: Shield },
  ];

  return (
    <div className="tools-page">
      <div className="tools-header-section">
        <motion.div 
          className="header-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Judicial Tools</h1>
          <p>Select a tool to manage court operations and access legal resources</p>
        </motion.div>
        
        <motion.div 
          className="quick-links"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {quickLinks.map((link, i) => (
            <button key={i} className="quick-link-btn glass-panel">
              <link.icon size={16} />
              <span>{link.title}</span>
            </button>
          ))}
        </motion.div>
      </div>

      <div className="tools-grid">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              className={`tool-card glass-panel ${tool.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className={`card-bg-pattern ${tool.bgPattern}`}></div>
              <div className="tool-content-wrapper">
                <div className="tool-header">
                  <div className="tool-icon-box">
                    <Icon size={32} />
                  </div>
                  <Link to={tool.link} className="tool-action-btn">
                    <ArrowRight size={20} />
                  </Link>
                </div>
                
                <div className="tool-info">
                  <h2>{tool.title}</h2>
                  <p>{tool.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Tools;
