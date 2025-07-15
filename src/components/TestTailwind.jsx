import React from 'react';

const TestTailwind = () => {
  return (
    <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="md:flex">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            Tailwind CSS Test
          </div>
          <a 
            href="#" 
            className="block mt-1 text-lg leading-tight font-medium text-black hover:underline"
          >
            Tailwind is working correctly!
          </a>
          <p className="mt-2 text-gray-500">
            If you can see this styled card, Tailwind CSS is properly configured in your project.
          </p>
          <div className="mt-4">
            <span className="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              #success
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;
