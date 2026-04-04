import React from 'react';
import { Loader } from 'lucide-react';

const Loading = ({ fullScreen = false, text = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <>
        <style>{`
          .ld-fullscreen {
            position: fixed; inset: 0; background: #f7f3ee;
            display: flex; align-items: center; justify-content: center;
            z-index: 50; font-family: 'DM Sans', sans-serif;
          }
          .ld-center { text-align: center; }
          .ld-icon-wrap {
            width: 64px; height: 64px; border-radius: 18px;
            background: #fff; border: 1px solid #e8e2da;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 14px;
          }
          .ld-spin { animation: ldSpin 0.8s linear infinite; }
          @keyframes ldSpin { to { transform: rotate(360deg); } }
          .ld-text {
            font-size: 14px; font-weight: 600; color: #9a9080;
          }
        `}</style>
        <div className="ld-fullscreen">
          <div className="ld-center">
            <div className="ld-icon-wrap">
              <Loader size={28} color="#2d6a4f" className="ld-spin" />
            </div>
            <p className="ld-text">{text}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .ld-inline {
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 10px;
          padding: 32px 0; font-family: 'DM Sans', sans-serif;
        }
        .ld-inline-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: #fff; border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: center;
        }
        .ld-spin { animation: ldSpin 0.8s linear infinite; }
        @keyframes ldSpin { to { transform: rotate(360deg); } }
        .ld-inline-text { font-size: 13px; font-weight: 600; color: #9a9080; }
      `}</style>
      <div className="ld-inline">
        <div className="ld-inline-icon">
          <Loader size={22} color="#2d6a4f" className="ld-spin" />
        </div>
        <p className="ld-inline-text">{text}</p>
      </div>
    </>
  );
};

export default Loading;