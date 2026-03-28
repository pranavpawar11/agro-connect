import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        navigate(`/${user.role}/home`);
      } else {
        navigate('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
      <div className="text-center text-white">
        <Sprout className="w-24 h-24 mx-auto mb-6 animate-bounce" />
        <h1 className="text-4xl font-bold mb-2">AgroConnect</h1>
        <p className="text-xl">Smart Farming Platform</p>
        <div className="mt-8">
          <div className="spinner border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;