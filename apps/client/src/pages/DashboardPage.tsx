import React from 'react';
import '../output.css';
import Navbar from '../components/Navbar';
import DashboardView from '../components/DashboardView';
import useDashboardStats from '../hooks/useDashboardStats';

const DashboardPage: React.FC = () => {
  const { statsData, loading, error } = useDashboardStats();
  
  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto mt-4">
      <Navbar />
      <DashboardView 
        statsData={statsData} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};

export default DashboardPage;