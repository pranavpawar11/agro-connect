import React from 'react';
import { Loader } from 'lucide-react';

const Loading = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default Loading;