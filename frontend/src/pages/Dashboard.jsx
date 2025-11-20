import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Activity,
  Calendar,
  Scale,
  Sparkles
} from 'lucide-react';
import { casesAPI, judgesAPI, lawyersAPI, planningAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeJudges: 0,
    activeLawyers: 0,
    pendingCases: 0
  });
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [recentCases, setRecentCases] = useState([]);
  const [casesTrend, setCasesTrend] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, judgesRes, lawyersRes] = await Promise.all([
          casesAPI.getAll(),
          judgesAPI.getAll(),
          lawyersAPI.getAll()
        ]);

        setStats({
          totalCases: casesRes.data.length,
          activeJudges: judgesRes.data.length,
          activeLawyers: lawyersRes.data.length,
          pendingCases: casesRes.data.filter(c => !c.is_resolved).length
        });
        
        // Get recent cases (last 5)
        const recent = casesRes.data
          .sort((a, b) => new Date(b.filed_in) - new Date(a.filed_in))
          .slice(0, 5);
        setRecentCases(recent);
        
        // Calculate case trend for last 7 days
        const today = new Date();
        const last7Days = Array.from({length: 7}, (_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });
        
        const trend = last7Days.map(date => {
          const count = casesRes.data.filter(c => 
            c.filed_in === date
          ).length;
          return count;
        });
        
        setCasesTrend(trend);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegenerateSchedule = async () => {
    try {
      setRegenerating(true);
      await planningAPI.regenerate();
      alert('Schedule regenerated successfully! AI has optimized all case assignments.');
    } catch (error) {
      console.error("Error regenerating schedule:", error);
      alert('Failed to regenerate schedule. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Cases', 
      value: stats.totalCases, 
      icon: FileText, 
      color: 'primary',
      trend: '+12% from last month'
    },
    { 
      title: 'Active Judges', 
      value: stats.activeJudges, 
      icon: Scale, 
      color: 'success',
      trend: 'Full capacity'
    },
    { 
      title: 'Registered Lawyers', 
      value: stats.activeLawyers, 
      icon: Users, 
      color: 'info',
      trend: '+5 new this week'
    },
    { 
      title: 'Pending Cases', 
      value: stats.pendingCases, 
      icon: Clock, 
      color: 'warning',
      trend: '-3% reduction'
    }
  ];

  // Mock Scale icon since it's not imported directly in the array


  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Overview of court performance and statistics
          </motion.p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleRegenerateSchedule}
          disabled={regenerating}
        >
          <Sparkles size={18} />
          <span>{regenerating ? 'Regenerating...' : 'Regenerate Schedule'}</span>
        </button>
      </header>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.title}
              className="stat-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stat-header">
                <div className={`icon-wrapper ${stat.color}`}>
                  <Icon size={20} />
                </div>
                {stat.title === 'Total Cases' && <Activity size={16} className="text-secondary" />}
              </div>
              <div className="stat-value">
                {loading ? <div className="skeleton-loader short"></div> : stat.value}
              </div>
              <div className="stat-label">{stat.title}</div>
              <div className="stat-trend">
                <TrendingUp size={14} />
                <span>{stat.trend}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="dashboard-content">
        <motion.div 
          className="chart-section glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="section-header">
            <h3>Case Resolution Trend</h3>
            <select className="chart-filter">
              <option>Last 7 Days</option>
              <option>Last Month</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="chart-placeholder">
            {/* Simple CSS Bar Chart */}
            <div className="bar-chart">
              {casesTrend.map((count, i) => {
                const maxCount = Math.max(...casesTrend, 1);
                const height = (count / maxCount) * 100;
                return (
                  <div key={i} className="bar-column">
                    <motion.div 
                      className="bar-fill"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      title={`${count} cases filed`}
                    />
                    <span className="bar-label">Day {i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="recent-activity glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="section-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
              </div>
            ) : recentCases.length > 0 ? (
              recentCases.map((caseItem, i) => {
                const timeAgo = Math.floor((new Date() - new Date(caseItem.filed_in)) / (1000 * 60 * 60 * 24));
                return (
                  <div key={caseItem.id} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p className="activity-text">New case <strong>{caseItem.case_number}</strong> filed</p>
                      <span className="activity-time">{timeAgo === 0 ? 'Today' : `${timeAgo} days ago`}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
