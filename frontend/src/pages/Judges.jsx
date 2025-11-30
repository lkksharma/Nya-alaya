import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Mail, Phone, MapPin, Plus, X, Calendar, Clock } from "lucide-react";
import { judgesAPI, schedulesAPI, casesAPI } from "../services/api";
import SearchBar from "../components/SearchBar";
import "./Judges.css";

const Judges = () => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [judgeSchedules, setJudgeSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    try {
      const response = await judgesAPI.getAll();
      setJudges(response.data);
    } catch (error) {
      console.error("Error fetching judges:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJudges = judges.filter(judge => 
    judge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    judge.court_room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSchedule = async (judge) => {
    setSelectedJudge(judge);
    setShowSchedule(true);
    setLoadingSchedules(true);
    
    try {
      const [schedulesRes, casesRes] = await Promise.all([
        schedulesAPI.getAll(),
        casesAPI.getAll()
      ]);
      
      // Filter schedules for this judge and enrich with case data
      const judgeScheduleData = schedulesRes.data
        .filter(s => String(s.judge) === String(judge.id))
        .map(schedule => {
          const caseData = casesRes.data.find(c => c.id === schedule.case);
          return {
            ...schedule,
            caseNumber: caseData?.case_number || 'Unknown',
            caseType: caseData?.case_type || 'Unknown'
          };
        })
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      
      setJudgeSchedules(judgeScheduleData);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setJudgeSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  return (
    <div className="judges-page">
      <header className="page-header">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Judges Directory
          </motion.h1>
          <p className="text-secondary">Manage judicial profiles and assignments</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>Add Judge</span>
        </button>
      </header>

      <div className="toolbar-container">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm("")}
          placeholder="Search judges by name or court room..."
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profiles...</p>
        </div>
      ) : (
        <div className="judges-grid">
          {filteredJudges.map((judge, index) => (
            <motion.div
              key={judge.id}
              className="judge-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="judge-header">
                <div className="avatar-placeholder">
                  {judge.name.charAt(0)}
                </div>
                <div className="judge-info">
                  <h3>{judge.name}</h3>
                  <span className="specialization">{judge.specialization || "General"}</span>
                </div>
              </div>
              
              <div className="judge-details">
                <div className="detail-item">
                  <MapPin size={14} />
                  <span>{judge.court_room}</span>
                </div>
                <div className="detail-item">
                  <Mail size={14} />
                  <span>{judge.email || "email@court.gov.in"}</span>
                </div>
                <div className="detail-item">
                  <Phone size={14} />
                  <span>{judge.phone_number || "+91 98765 43210"}</span>
                </div>
              </div>

              <div className="judge-footer">
                <div className="status-badge active">
                  <div className="dot"></div>
                  Available
                </div>
                <button 
                  className="btn-text"
                  onClick={() => handleViewSchedule(judge)}
                >
                  View Schedule
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {showSchedule && selectedJudge && (
          <div className="modal-backdrop" onClick={() => setShowSchedule(false)}>
            <motion.div
              className="modal-container glass-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Schedule for {selectedJudge.name}</h2>
                <button onClick={() => setShowSchedule(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="schedule-info">
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>Courtroom: {selectedJudge.court_room}</span>
                  </div>
                  <div className="info-item">
                    <Scale size={16} />
                    <span>Specialization: {selectedJudge.specialization || "General"}</span>
                  </div>
                </div>
                
                {loadingSchedules ? (
                  <div className="schedule-loading">
                    <div className="spinner"></div>
                    <p>Loading schedule...</p>
                  </div>
                ) : judgeSchedules.length > 0 ? (
                  <div className="schedule-list">
                    {judgeSchedules.map((schedule) => (
                      <div key={schedule.id} className="schedule-item">
                        <div className="schedule-time">
                          <Clock size={14} />
                          <span>{new Date(schedule.start_time).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(schedule.end_time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="schedule-case">
                          <span className="case-number">{schedule.caseNumber}</span>
                          <span className={`case-type-badge ${schedule.caseType}`}>{schedule.caseType}</span>
                        </div>
                        <div className="schedule-room">{schedule.room}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="schedule-placeholder">
                    <Calendar size={48} />
                    <p>No upcoming hearings scheduled</p>
                    <small>This judge currently has no cases assigned</small>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Judges;
