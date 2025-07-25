import React from 'react';

const MinimalTest: React.FC = () => {
  return (
    <div style={{ backgroundColor: 'red', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: 'white', fontSize: '24px' }}>Minimal Test - Inline Styles</h1>
      
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        <h2 className="text-2xl font-bold">Tailwind Test</h2>
        <p className="text-lg">Əgər bu mavi rəngdə görünürsə, Tailwind işləyir</p>
      </div>
      
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-400 to-pink-600 text-white rounded-xl">
        <p className="text-xl">Gradient test</p>
      </div>
      
      <button className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
        Button Test
      </button>
    </div>
  );
};

export default MinimalTest;