import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SchedulingGraphic.css';

const SchedulingGraphic = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cases, setCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [slots, setSlots] = useState([]);

  const steps = ['Cases Filed', 'AI Analysis', 'Conflict Resolution', 'Scheduling Complete'];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate data based on active step
    if (activeStep === 0) {
      setCases([
        { id: 1, name: 'Case A', priority: 'high', status: 'pending' },
        { id: 2, name: 'Case B', priority: 'medium', status: 'pending' },
        { id: 3, name: 'Case C', priority: 'low', status: 'pending' },
      ]);
      setJudges([]);
      setSlots([]);
    } else if (activeStep === 1) {
      setCases([
        { id: 1, name: 'Case A', priority: 'high', status: 'analyzing' },
        { id: 2, name: 'Case B', priority: 'medium', status: 'analyzing' },
        { id: 3, name: 'Case C', priority: 'low', status: 'analyzing' },
      ]);
      setJudges([
        { id: 1, name: 'Judge 1', available: true },
        { id: 2, name: 'Judge 2', available: true },
      ]);
      setSlots([]);
    } else if (activeStep === 2) {
      setCases([
        { id: 1, name: 'Case A', priority: 'high', status: 'resolving' },
        { id: 2, name: 'Case B', priority: 'medium', status: 'resolving' },
        { id: 3, name: 'Case C', priority: 'low', status: 'resolving' },
      ]);
      setJudges([
        { id: 1, name: 'Judge 1', available: true },
        { id: 2, name: 'Judge 2', available: false },
      ]);
      setSlots([
        { id: 1, caseId: 1, judgeId: 1, time: '10:00 AM', status: 'checking' },
        { id: 2, caseId: 2, judgeId: 2, time: '11:00 AM', status: 'checking' },
      ]);
    } else {
      setCases([
        { id: 1, name: 'Case A', priority: 'high', status: 'scheduled' },
        { id: 2, name: 'Case B', priority: 'medium', status: 'scheduled' },
        { id: 3, name: 'Case C', priority: 'low', status: 'scheduled' },
      ]);
      setJudges([
        { id: 1, name: 'Judge 1', available: false },
        { id: 2, name: 'Judge 2', available: false },
      ]);
      setSlots([
        { id: 1, caseId: 1, judgeId: 1, time: '10:00 AM', status: 'confirmed' },
        { id: 2, caseId: 2, judgeId: 2, time: '11:00 AM', status: 'confirmed' },
        { id: 3, caseId: 3, judgeId: 1, time: '2:00 PM', status: 'confirmed' },
      ]);
    }
  }, [activeStep]);

  return (
    <div className="scheduling-graphic-container">
      <h2 className="graphic-title">Case Scheduling System</h2>
      <p className="graphic-subtitle">Watch how our AI optimizes court schedules in real-time</p>
      
      {/* Step Indicator */}
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className={`step-dot ${activeStep === index ? 'active' : ''} ${activeStep > index ? 'completed' : ''}`}>
            <span className="step-number">{index + 1}</span>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>

      {/* Main Graphic */}
      <div className="graphic-main">
        {/* Cases Column */}
        <div className="graphic-column">
          <h3>Cases</h3>
          <AnimatePresence mode="popLayout">
            {cases.map((caseItem) => (
              <motion.div
                key={caseItem.id}
                className={`case-card priority-${caseItem.priority} status-${caseItem.status}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <div className="card-content">
                  <span className="card-name">{caseItem.name}</span>
                  <span className={`priority-badge ${caseItem.priority}`}>{caseItem.priority}</span>
                </div>
                {caseItem.status === 'analyzing' && (
                  <motion.div
                    className="pulse-ring"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* AI Processing Center */}
        {activeStep >= 1 && (
          <motion.div
            className="ai-processor"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="processor-icon">
              <motion.div
                className="processor-core"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <span className="processor-label">AI Engine</span>
          </motion.div>
        )}

        {/* Judges Column */}
        {activeStep >= 1 && (
          <motion.div
            className="graphic-column"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3>Judges</h3>
            <AnimatePresence mode="popLayout">
              {judges.map((judge) => (
                <motion.div
                  key={judge.id}
                  className={`judge-card ${judge.available ? 'available' : 'busy'}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  layout
                >
                  <div className="card-content">
                    <span className="card-name">{judge.name}</span>
                    <span className={`status-badge ${judge.available ? 'available' : 'busy'}`}>
                      {judge.available ? 'Available' : 'Scheduled'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Scheduled Slots Column */}
        {activeStep >= 2 && (
          <motion.div
            className="graphic-column"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3>Schedule</h3>
            <AnimatePresence mode="popLayout">
              {slots.map((slot) => (
                <motion.div
                  key={slot.id}
                  className={`slot-card ${slot.status}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                >
                  <div className="slot-time">{slot.time}</div>
                  <div className="slot-details">
                    <span>Case {String.fromCharCode(64 + slot.caseId)}</span>
                    <span>→</span>
                    <span>Judge {slot.judgeId}</span>
                  </div>
                  {slot.status === 'confirmed' && (
                    <motion.div
                      className="checkmark"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <motion.div
          className="progress-bar"
          initial={{ width: '0%' }}
          animate={{ width: `${((activeStep + 1) / 4) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default SchedulingGraphic;
