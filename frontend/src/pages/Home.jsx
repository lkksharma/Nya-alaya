import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import HeroVisual from '../components/HeroVisual';
import SchedulingGraphic from '../components/SchedulingGraphic';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section - Full Height */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="hero-badge">Judicial Efficiency Solution</span>
            <h1 className="hero-title">
              Modernizing Justice with <br />
              <span className="gradient-text">Intelligent Scheduling</span>
            </h1>
            <p className="hero-subtitle">
              Nya-Alaya streamlines court operations, reduces backlog, and optimizes resource allocation through advanced constraint programming and AI. 
              Our intelligent system coordinates between judges, lawyers, and litigants to ensure fair and timely justice delivery, 
              transforming the way courts operate in the digital age.
            </p>
            <div className="hero-actions">
              <Link to="/tools" className="btn btn-primary btn-lg">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="hero-visual">
          <HeroVisual />
        </div>
      </section>

      {/* Features Section - Full Width Grid */}
      <section className="features-section">
        <div className="features-grid">
          <motion.div 
            className="feature-card glass-panel"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="icon-box primary">
              <Zap size={24} />
            </div>
            <h3>Automated Scheduling</h3>
            <p>AI agents resolve conflicts and optimize court calendars in real-time.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-panel"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="icon-box success">
              <Shield size={24} />
            </div>
            <h3>Secure & Transparent</h3>
            <p>Enterprise-grade security ensures case data remains confidential and tamper-proof.</p>
          </motion.div>

          <motion.div 
            className="feature-card glass-panel"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="icon-box warning">
              <BarChart3 size={24} />
            </div>
            <h3>Data-Driven Insights</h3>
            <p>Comprehensive analytics to track performance and identify bottlenecks.</p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
        
        <motion.p 
          className="section-description"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}
        >
          Nya-Alaya revolutionizes judicial scheduling by leveraging advanced constraint programming and artificial intelligence. 
          Unlike traditional manual methods, our system treats court scheduling as a complex optimization problem, simultaneously balancing thousands of variables-from judge availability and case urgency to lawyer schedules and courtroom resources. 
          By mathematically modeling these constraints, we generate conflict-free schedules that maximize court utilization and minimize delays. 
          This intelligent coordination ensures that every minute of court time is used effectively, significantly reducing backlog and delivering fair, timely justice to all litigants.
        </motion.p>
        
        <div className="steps-container">
          {[
            { 
              title: "Case Filing", 
              desc: "Secure digital submission of case details, documents, and metadata. Our system automatically extracts key information to assess complexity and requirements.", 
              icon: "1" 
            },
            { 
              title: "AI Analysis", 
              desc: "Advanced algorithms analyze case urgency, judge expertise, and historical data to determine the optimal resource allocation and estimated hearing duration.", 
              icon: "2" 
            },
            { 
              title: "Smart Scheduling", 
              desc: "Intelligent agents negotiate time slots with judges, lawyers, and courtrooms in real-time, resolving conflicts instantly to find the perfect schedule.", 
              icon: "3" 
            },
            { 
              title: "Resolution", 
              desc: "Streamlined hearings with automated tracking and notifications ensure cases move forward efficiently, reducing adjournments and delivering timely justice.", 
              icon: "4" 
            }
          ].map((step, index) => (
            <div key={index} className="step-item-wrapper">
              <motion.div 
                className="step-item glass-panel"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="step-number">{step.icon}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </motion.div>
              {index < 3 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Scheduling Graphic */}
      <SchedulingGraphic />
    </div>
  );
};

export default Home;
