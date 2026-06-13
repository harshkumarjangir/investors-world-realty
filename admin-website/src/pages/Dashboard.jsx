import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0a0f1a]">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back to the Website CMS Admin Panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Home Page Content</h3>
          <p className="text-gray-500 mb-4 text-sm">Manage the dynamic hero banners, about text, and services shown on your main landing page.</p>
          <a href="/home" className="text-gold-600 font-medium hover:text-gold-700">Edit Home Page &rarr;</a>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Projects List</h3>
          <p className="text-gray-500 mb-4 text-sm">Add new projects or edit existing ones. This will automatically generate dynamic project pages on the website.</p>
          <a href="/projects" className="text-gold-600 font-medium hover:text-gold-700">Manage Projects &rarr;</a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
