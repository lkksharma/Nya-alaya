import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import './HeroVisual.css';

const HeroVisual = () => {
  // Mouse position state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth, heavy feel
  // stiffness: lower = looser/slower
  // damping: higher = less oscillation/more friction
  const springConfig = { stiffness: 150, damping: 15, mass: 1 };
  
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Map mouse position to rotation
  // Increased range [-15, 15] for visible reactivity
  // The spring physics will prevent it from feeling "aggressive"
  const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);

  // Animated bar heights
  const [bars, setBars] = useState([40, 70, 50, 85, 60, 75]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars([
        Math.random() * 60 + 30,
        Math.random() * 60 + 30,
        Math.random() * 60 + 30,
        Math.random() * 60 + 30,
        Math.random() * 60 + 30,
        Math.random() * 60 + 30,
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate normalized position (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div 
      className="hero-visual-container glass-panel"
      style={{ 
        rotateX, 
        rotateY,
        perspective: 1200,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="visual-content" style={{ transform: "translateZ(60px)" }}>
        <div className="mock-row-container">
          <motion.div 
            className="mock-row"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="mock-row"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div 
            className="mock-row short"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        <div className="mock-chart-container">
          {bars.map((height, i) => (
            <motion.div
              key={i}
              className="bar"
              animate={{ height: `${height}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ))}
        </div>

        <motion.div 
          className="floating-badge"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ zIndex: 20 }}
        >
          <span>AI Optimized</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HeroVisual;
