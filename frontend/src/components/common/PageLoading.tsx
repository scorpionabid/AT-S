import React from 'react';

const PageLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-4 text-gray-600">Yüklənir...</span>
    </div>
  );
};

export default PageLoading;
