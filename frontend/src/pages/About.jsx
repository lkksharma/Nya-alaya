import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import './About.css';

const About = () => {
  const benefits = [
    "Automated case scheduling and conflict resolution",
    "Real-time availability tracking for judges",
    "Secure and transparent case management",
    "Data-driven insights for judicial efficiency",
    "Reduced backlog and wait times",
    "User-friendly interface for all stakeholders"
  ];

  return (
    <div className="about-page">
      <div className="about-header-section">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About Nya-Alaya
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Revolutionizing the Indian Judicial System through Technology
        </motion.p>
      </div>

      <div className="about-content-grid">
        <motion.div 
          className="problem-box glass-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>The Problem</h2>
          <p>
            The Indian judicial system faces a massive backlog of over 40 million cases, with millions of new cases filed every year. 
            Judges are overburdened, lawyers struggle with conflicting schedules across multiple courts, and litigants often wait years, 
            sometimes decades, for justice. The traditional manual scheduling process is inefficient, opaque, and prone to delays, 
            leading to a system where "justice delayed is justice denied."
          </p>
        </motion.div>

        <motion.div 
          className="solution-box glass-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Our Solution</h2>
          <p>
            Nya-Alaya automates the entire scheduling process using state-of-the-art AI planning agents. We optimize court calendars 
            by analyzing case complexity, urgency, and resource availability. Our system resolves conflicts instantly by negotiating 
            slots with all stakeholders, ensures transparent tracking of case progress, and provides data-driven insights to 
            continuously improve judicial efficiency. We are building the digital infrastructure for a faster, fairer justice system.
          </p>
        </motion.div>

        <motion.div 
          className="benefits-list glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Key Benefits</h2>
          <ul>
            {benefits.map((benefit, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
              >
                <CheckCircle2 size={20} className="check-icon" />
                <span>{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div 
        className="team-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2>Meet the Team</h2>
        <div className="team-grid">
          <div className="team-card glass-panel">
            <div className="team-img-wrapper">
              <img src="/src/assets/lakksh_sharma.png" alt="Lakksh Sharma" />
            </div>
            <h3>Lakksh Sharma</h3>
            <span className="role">Co-Founder & CEO</span>
          </div>
          <div className="team-card glass-panel">
            <div className="team-img-wrapper">
              <img src="/src/assets/kabir_oberoi.png" alt="Kabir Oberoi" />
            </div>
            <h3>Kabir Oberoi</h3>
            <span style={{margin: '30px'}} className="role">Co-Founder & CTO</span>
          </div>
          <div className="team-card glass-panel">
            <div className="team-img-wrapper">
              <img src="/src/assets/siddhant_saxena.png" alt="Siddhant Saxena" />
            </div>
            <h3>Siddhant Saxena</h3>
            <span className="role">Co-Founder & COO</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
