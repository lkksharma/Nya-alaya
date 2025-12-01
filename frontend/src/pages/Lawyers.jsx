import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail, Phone, Briefcase, Plus, X, Calendar, Clock, FileText } from "lucide-react";
import { lawyersAPI, casesAPI } from "../services/api";
import SearchBar from "../components/SearchBar";
import "./Lawyers.css";

const Lawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [lawyerCases, setLawyerCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [lawyerCaseCounts, setLawyerCaseCounts] = useState({});

  // Register Lawyer State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [newLawyer, setNewLawyer] = useState({
    name: "",
    specialization: "general",
    phone_number: ""
  });

  const handleRegisterLawyer = async (e) => {
    e.preventDefault();
    setRegistering(true);
    try {
      await lawyersAPI.create(newLawyer);
      setShowRegisterModal(false);
      setNewLawyer({ name: "", specialization: "general", phone_number: "" });
      fetchLawyers(); // Refresh list
    } catch (error) {
      console.error("Error registering lawyer:", error);
      alert("Failed to register lawyer. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const [lawyersRes, casesRes] = await Promise.all([
        lawyersAPI.getAll(),
        casesAPI.getAll()
      ]);
      setLawyers(lawyersRes.data);
      
      // Calculate case counts for each lawyer
      const counts = {};
      lawyersRes.data.forEach(lawyer => {
        counts[lawyer.id] = casesRes.data.filter(c => 
          c.lawyers && c.lawyers.includes(lawyer.id)
        ).length;
      });
      setLawyerCaseCounts(counts);
    } catch (error) {
      console.error("Error fetching lawyers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => 
    lawyer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSchedule = async (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowSchedule(true);
    setLoadingCases(true);
    
    try {
      const casesRes = await casesAPI.getAll();
      
      // Filter cases assigned to this lawyer
      const assignedCases = casesRes.data
        .filter(c => c.lawyers && c.lawyers.map(String).includes(String(lawyer.id)))
        .sort((a, b) => new Date(b.filed_in) - new Date(a.filed_in));
      
      setLawyerCases(assignedCases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      setLawyerCases([]);
    } finally {
      setLoadingCases(false);
    }
  };

  return (
    <div className="lawyers-page">
      <header className="page-header">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Legal Counsel
          </motion.h1>
          <p className="text-secondary">Directory of registered lawyers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
          <Plus size={18} />
          <span>Register Lawyer</span>
        </button>
      </header>

      <div className="toolbar-container">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm("")}
          placeholder="Search lawyers..."
          filterOptions={[
            { value: "All Specializations", label: "All Specializations" },
            { value: "Civil", label: "Civil" },
            { value: "Criminal", label: "Criminal" },
            { value: "Corporate", label: "Corporate" }
          ]}
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading directory...</p>
        </div>
      ) : (
        <div className="lawyers-list glass-panel">
          <div className="list-header">
            <div className="col-name">Name</div>
            <div className="col-contact">Contact</div>
            <div className="col-cases">Active Cases</div>
            <div className="col-status">Status</div>
            <div className="col-actions"></div>
          </div>
          
          <div className="list-body">
            {filteredLawyers.map((lawyer, index) => (
              <motion.div
                key={lawyer.id}
                className="list-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <div className="col-name">
                  <div className="avatar-small">
                    {lawyer.name.charAt(0)}
                  </div>
                  <div className="name-info">
                    <span className="name">{lawyer.name}</span>
                    <span className="specialization-text">{lawyer.specialization || "General Practice"}</span>
                  </div>
                </div>
                <div className="col-contact">
                  <div className="contact-item">
                    <Mail size={12} />
                    <span>{lawyer.email || "contact@lawyer.com"}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={12} />
                    <span>{lawyer.phone_number || "+91 98765 43210"}</span>
                  </div>
                </div>
                <div className="col-cases">
                  <span className="case-count">
                    <Briefcase size={14} />
                    {lawyerCaseCounts[lawyer.id] || 0} Cases
                  </span>
                </div>
                <div className="col-status">
                  <span className="status-pill active">Active</span>
                </div>
                <div className="col-actions">
                  <button 
                    className="btn-text"
                    onClick={() => handleViewSchedule(lawyer)}
                  >
                    View Schedule
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Register Lawyer Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
            <motion.div
              className="modal-container glass-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Register New Lawyer</h2>
                <button onClick={() => setShowRegisterModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleRegisterLawyer} className="add-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={newLawyer.name}
                      onChange={(e) => setNewLawyer({...newLawyer, name: e.target.value})}
                      required
                      placeholder="e.g. Advocate Rajesh Kumar"
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <select
                      value={newLawyer.specialization}
                      onChange={(e) => setNewLawyer({...newLawyer, specialization: e.target.value})}
                    >
                      <option value="general">General Practice</option>
                      <option value="civil">Civil Law</option>
                      <option value="criminal">Criminal Defense</option>
                      <option value="corporate">Corporate Law</option>
                      <option value="family">Family Law</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={newLawyer.phone_number}
                      onChange={(e) => setNewLawyer({...newLawyer, phone_number: e.target.value})}
                      placeholder="+91..."
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={registering}>
                      {registering ? "Registering..." : "Register Lawyer"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showSchedule && selectedLawyer && (
          <div className="modal-backdrop" onClick={() => setShowSchedule(false)}>
            <motion.div
              className="modal-container glass-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale:0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>{selectedLawyer.name}'s Schedule</h2>
                <button onClick={() => setShowSchedule(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="schedule-info">
                  <div className="info-item">
                    <Briefcase size={16} />
                    <span>Specialization: {selectedLawyer.specialization || "General Practice"}</span>
                  </div>
                  <div className="info-item">
                    <Mail size={16} />
                    <span>{selectedLawyer.email || "contact@lawyer.com"}</span>
                  </div>
                </div>
                
                {loadingCases ? (
                  <div className="schedule-loading">
                    <div className="spinner"></div>
                    <p>Loading cases...</p>
                  </div>
                ) : lawyerCases.length > 0 ? (
                  <div className="schedule-list">
                    <h4 style={{marginBottom: '1rem', color: 'var(--text-primary)'}}>Assigned Cases ({lawyerCases.length})</h4>
                    {lawyerCases.map((caseItem) => (
                      <div key={caseItem.id} className="schedule-item">
                        <div className="schedule-time">
                          <FileText size={14} />
                          <span className="case-number">{caseItem.case_number}</span>
                        </div>
                        <div className="schedule-case">
                          <span className={`case-type-badge ${caseItem.case_type}`}>{caseItem.case_type}</span>
                          <span className="urgency-badge" style={{marginLeft: '0.5rem'}}>Urgency: {(caseItem.urgency * 100).toFixed(0)}%</span>
                        </div>
                        <div className="schedule-room" style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                          Filed: {new Date(caseItem.filed_in).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="schedule-placeholder">
                    <Calendar size={48} />
                    <p>No cases assigned</p>
                    <small>This lawyer currently has no active cases</small>
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

export default Lawyers;
