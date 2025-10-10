import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  User,
  Building,
  RefreshCw
} from 'lucide-react';
import { schedulesAPI, casesAPI, judgesAPI, planningAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [cases, setCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    totalJudges: 0,
    scheduledToday: 0,
    pendingCases: 0,
  });

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds to show real-time scheduling
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, casesRes, judgesRes] = await Promise.all([
        schedulesAPI.getAll(),
        casesAPI.getAll(),
        judgesAPI.getAll(),
      ]);

      setSchedules(schedulesRes.data);
      setCases(casesRes.data);
      setJudges(judgesRes.data);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const scheduledToday = schedulesRes.data.filter(s => 
        s.start_time?.startsWith(today)
      ).length;

      setStats({
        totalCases: casesRes.data.length,
        totalJudges: judgesRes.data.length,
        scheduledToday: scheduledToday,
        pendingCases: casesRes.data.filter(c => !c.assigned_judge).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statCards = [
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: Calendar,
      color: 'primary',
      change: '+12%'
    },
    {
      title: 'Active Judges',
      value: stats.totalJudges,
      icon: User,
      color: 'secondary',
      change: '+3%'
    },
    {
      title: 'Scheduled Today',
      value: stats.scheduledToday,
      icon: CheckCircle,
      color: 'success',
      change: '+8%'
    },
    {
      title: 'Pending Cases',
      value: stats.pendingCases,
      icon: AlertCircle,
      color: 'warning',
      change: '-5%'
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          className="loader"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Calendar size={48} />
        </motion.div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Page Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of court scheduling system - Auto-refreshes every 30s</p>
        </div>
        <div className="header-actions">
          <motion.button
            className="btn btn-secondary"
            onClick={fetchData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} />
            Refresh
          </motion.button>
          <motion.button
            className="btn btn-primary"
            style={{ marginLeft: 12 }}
            onClick={async () => {
              try {
                await planningAPI.regenerate();
                await fetchData();
              } catch (e) {
                console.error('Failed to regenerate schedule', e);
                alert('Failed to generate schedule');
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Generate Schedule
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className={`stat-card stat-${stat.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
            >
              <div className="stat-icon">
                <Icon size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-title">{stat.title}</p>
                <h2 className="stat-value">{stat.value}</h2>
                <span className="stat-change positive">{stat.change} from last week</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Schedules Section */}
      <div className="content-grid">
        {/* Recent Schedules */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h2 className="card-title">
              <Calendar size={20} />
              Recent Schedules
            </h2>
          </div>
          <div className="card-body">
            {schedules.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <p>No schedules found</p>
                <small>Schedules will appear here once created</small>
              </div>
            ) : (
              <div className="schedule-list">
                {schedules.slice(0, 5).map((schedule, index) => (
                  <motion.div
                    key={schedule.id}
                    className="schedule-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="schedule-info">
                      <div className="schedule-case">
                        <strong>Case:</strong> {schedule.case_number || `Case #${schedule.case}`}
                      </div>
                      <div className="schedule-details">
                        <span className="detail-item">
                          <User size={14} />
                          Judge ID: {schedule.judge}
                        </span>
                        <span className="detail-item">
                          <Clock size={14} />
                          {formatDate(schedule.start_time)}
                        </span>
                        <span className="detail-item">
                          <Building size={14} />
                          {schedule.room || 'Courtroom 1'}
                        </span>
                      </div>
                    </div>
                    <div className="schedule-status">
                      <span className="status-badge scheduled">Scheduled</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Cases */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <h2 className="card-title">
              <AlertCircle size={20} />
              Pending Cases
            </h2>
          </div>
          <div className="card-body">
            {cases.filter(c => !c.assigned_judge).length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} />
                <p>All cases assigned!</p>
                <small>No pending cases at the moment</small>
              </div>
            ) : (
              <div className="case-list">
                {cases.filter(c => !c.assigned_judge).slice(0, 5).map((caseItem, index) => (
                  <motion.div
                    key={caseItem.id}
                    className="case-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="case-header">
                      <span className="case-number">{caseItem.case_number}</span>
                      <span className={`case-type type-${caseItem.case_type}`}>
                        {caseItem.case_type}
                      </span>
                    </div>
                    <div className="case-meta">
                      <span>Filed: {new Date(caseItem.filed_in).toLocaleDateString('en-IN')}</span>
                      <span>Urgency: {(caseItem.urgency * 100).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

