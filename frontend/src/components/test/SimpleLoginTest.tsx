import React from 'react';

const SimpleLoginTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ATİS</h1>
          <p className="text-blue-600 text-lg font-medium">Test Login</p>
        </div>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Username"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
          />
          <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
            Login Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginTest;