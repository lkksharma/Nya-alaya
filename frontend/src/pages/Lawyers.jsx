import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search,
  X,
  Briefcase,
  FileText,
  Eye,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { lawyersAPI, casesAPI } from '../services/api';
import './Lawyers.css';

const Lawyers = () => {
  const [lawyers, setLawyers] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCasesModal, setShowCasesModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    busy_slots: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lawyersRes, casesRes] = await Promise.all([
        lawyersAPI.getAll(),
        casesAPI.getAll(),
      ]);
      setLawyers(lawyersRes.data);
      setCases(casesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLawyer) {
        await lawyersAPI.update(selectedLawyer.id, formData);
      } else {
        await lawyersAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving lawyer:', error);
      alert('Error saving lawyer. Please check the form data.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lawyer?')) {
      try {
        await lawyersAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting lawyer:', error);
      }
    }
  };

  const handleEdit = (lawyer) => {
    setSelectedLawyer(lawyer);
    setFormData({
      name: lawyer.name,
      busy_slots: lawyer.busy_slots || [],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedLawyer(null);
    setFormData({
      name: '',
      busy_slots: [],
    });
  };

  const getLawyerCases = (lawyerId) => {
    return cases.filter(c => 
      c.lawyers && c.lawyers.includes(lawyerId)
    );
  };

  const viewLawyerCases = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowCasesModal(true);
  };

  const filteredLawyers = lawyers.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lawyers-page">
      {/* Page Header */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="page-title">
            <Users size={32} />
            Lawyers Management
          </h1>
          <p className="page-subtitle">Manage lawyers and track their cases</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Add New Lawyer
        </button>
      </motion.div>

      {/* Search */}
      <motion.div 
        className="search-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by lawyer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Lawyers Grid */}
      {loading ? (
        <div className="loading-container">
          <motion.div
            className="loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Users size={48} />
          </motion.div>
          <p>Loading lawyers...</p>
        </div>
      ) : (
        <div className="lawyers-grid">
          {filteredLawyers.map((lawyer, index) => {
            const lawyerCases = getLawyerCases(lawyer.id);
            return (
              <motion.div
                key={lawyer.id}
                className="lawyer-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="lawyer-card-header">
                  <div className="lawyer-avatar">
                    <Briefcase size={28} />
                  </div>
                  <div className="lawyer-actions">
                    <button 
                      className="icon-btn"
                      onClick={() => handleEdit(lawyer)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="icon-btn delete"
                      onClick={() => handleDelete(lawyer.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="lawyer-info">
                  <h3 className="lawyer-name">{lawyer.name}</h3>
                </div>

                <div className="lawyer-stats">
                  <div className="stat">
                    <FileText size={18} />
                    <div>
                      <span className="stat-value">{lawyerCases.length}</span>
                      <span className="stat-label">Active Cases</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-view-cases"
                  onClick={() => viewLawyerCases(lawyer)}
                >
                  <Eye size={18} />
                  View Cases
                </button>
              </motion.div>
            );
          })}

          {filteredLawyers.length === 0 && (
            <div className="empty-state-full">
              <Users size={64} />
              <h3>No lawyers found</h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search'
                  : 'Click "Add New Lawyer" to register a lawyer'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Lawyer Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedLawyer ? 'Edit Lawyer' : 'Add New Lawyer'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="lawyer-form">
                <div className="form-group">
                  <label htmlFor="name">Lawyer Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Adv. Priya Sharma"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedLawyer ? 'Update Lawyer' : 'Add Lawyer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Cases Modal */}
      <AnimatePresence>
        {showCasesModal && selectedLawyer && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCasesModal(false)}
          >
            <motion.div 
              className="modal-content cases-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedLawyer.name}'s Cases</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowCasesModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="cases-content">
                {getLawyerCases(selectedLawyer.id).length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} />
                    <p>No active cases</p>
                  </div>
                ) : (
                  <div className="cases-list">
                    {getLawyerCases(selectedLawyer.id).map((caseItem, idx) => (
                      <motion.div
                        key={caseItem.id}
                        className="case-card-mini"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="case-header">
                          <FileText size={20} />
                          <div>
                            <h4>{caseItem.case_number}</h4>
                            <span className={`case-type-badge type-${caseItem.case_type}`}>
                              {caseItem.case_type}
                            </span>
                          </div>
                        </div>
                        <div className="case-meta">
                          <div className="meta-item">
                            <Calendar size={14} />
                            <span>Filed: {new Date(caseItem.filed_in).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div className="meta-item">
                            <span className="urgency-badge">
                              Urgency: {(caseItem.urgency * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lawyers;

