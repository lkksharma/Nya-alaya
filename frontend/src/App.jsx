import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Judges from './pages/Judges';
import Lawyers from './pages/Lawyers';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/judges" element={<Judges />} />
          <Route path="/lawyers" element={<Lawyers />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
