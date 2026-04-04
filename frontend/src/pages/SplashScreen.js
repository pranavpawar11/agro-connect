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
    <>
      <style>{`
        .sp-root {
          min-height: 100vh;
          background: #1c3a1c;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }

        /* grain overlay */
        .sp-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
        }

        /* ambient glows */
        .sp-glow-tl {
          position: absolute; top: -120px; left: -120px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(82,183,136,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .sp-glow-br {
          position: absolute; bottom: -120px; right: -120px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(246,183,60,0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* content */
        .sp-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
        }

        /* icon tile */
        .sp-icon-tile {
          width: 96px; height: 96px; border-radius: 28px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
          animation: spFloat 3s ease-in-out infinite;
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        }
        @keyframes spFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }

        /* logo text */
        .sp-name {
          font-family: 'Playfair Display', serif;
          font-size: 40px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.5px; line-height: 1;
          margin-bottom: 8px;
        }
        .sp-tagline {
          font-size: 15px; font-weight: 500;
          color: rgba(240,237,232,0.5);
          letter-spacing: 0.2px;
          margin-bottom: 48px;
        }

        /* loader dots */
        .sp-dots {
          display: flex; align-items: center; gap: 8px;
        }
        .sp-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(240,237,232,0.35);
          animation: spDot 1.4s ease-in-out infinite;
        }
        .sp-dot:nth-child(1) { animation-delay: 0s; }
        .sp-dot:nth-child(2) { animation-delay: 0.2s; }
        .sp-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes spDot {
          0%, 80%, 100% { transform: scale(1);   opacity: 0.35; }
          40%           { transform: scale(1.5); opacity: 1; background: #52b788; }
        }
      `}</style>

      <div className="sp-root">
        <div className="sp-grain" />
        <div className="sp-glow-tl" />
        <div className="sp-glow-br" />

        <div className="sp-content">
          <div className="sp-icon-tile">
            <Sprout size={48} color="#52b788" />
          </div>

          <div className="sp-name">AgroConnect</div>
          <div className="sp-tagline">Smart Farming Platform</div>

          <div className="sp-dots">
            <div className="sp-dot" />
            <div className="sp-dot" />
            <div className="sp-dot" />
          </div>
        </div>
      </div>
    </>
  );
};

export default SplashScreen;