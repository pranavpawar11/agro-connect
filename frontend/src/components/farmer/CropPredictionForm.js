import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout } from 'lucide-react';

const FIELDS = [
  { name: 'N',           labelKey: 'prediction.nitrogen',     unit: 'kg/ha', placeholder: '0–140',   span: false },
  { name: 'P',           labelKey: 'prediction.phosphorus',   unit: 'kg/ha', placeholder: '5–145',   span: false },
  { name: 'K',           labelKey: 'prediction.potassium',    unit: 'kg/ha', placeholder: '5–205',   span: false },
  { name: 'temperature', labelKey: 'prediction.temperature',  unit: '°C',    placeholder: '8–44',    span: false },
  { name: 'humidity',    labelKey: 'prediction.humidity',     unit: '%',     placeholder: '14–100',  span: false },
  { name: 'ph',          labelKey: 'prediction.ph',           unit: null,    placeholder: '3.5–10',  span: false },
  { name: 'rainfall',    labelKey: 'prediction.rainfall',     unit: 'mm',    placeholder: '20–300',  span: true  },
];

const CropPredictionForm = ({ onSubmit, loading }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <style>{`
        .cpf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .cpf-field       { display: flex; flex-direction: column; }
        .cpf-field.full  { grid-column: 1 / -1; }
        .cpf-label {
          font-size: 11px; font-weight: 700; color: #6a6055;
          text-transform: uppercase; letter-spacing: 0.4px;
          margin-bottom: 5px;
          display: flex; align-items: center; gap: 5px;
        }
        .cpf-unit {
          font-size: 10px; font-weight: 500; color: #b0a898;
          background: #f0ede8; border-radius: 4px; padding: 1px 5px;
          letter-spacing: 0;
        }
        .cpf-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid #ddd5c8;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1c2e1c;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          -moz-appearance: textfield;
        }
        .cpf-input::-webkit-outer-spin-button,
        .cpf-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .cpf-input::placeholder { color: #c8bfb2; font-weight: 400; }
        .cpf-input:focus { border-color: #2d6a4f; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }

        .cpf-submit {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px; border-radius: 14px; border: none;
          background: #1c3a1c; color: #f0ede8;
          font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
          box-shadow: 0 4px 14px rgba(28,58,28,0.25);
        }
        .cpf-submit:hover:not(:disabled) { background: #2a5a2a; }
        .cpf-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        @media (max-width: 400px) {
          .cpf-grid { grid-template-columns: 1fr; }
          .cpf-field.full { grid-column: 1; }
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="cpf-grid">
          {FIELDS.map(({ name, labelKey, unit, placeholder, span }) => (
            <div key={name} className={`cpf-field${span ? ' full' : ''}`}>
              <label className="cpf-label">
                {t(labelKey)}
                {unit && <span className="cpf-unit">{unit}</span>}
              </label>
              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="cpf-input"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="cpf-submit" disabled={loading}>
          <Sprout size={18} />
          {loading ? t('common.loading') : t('prediction.predictCrop')}
        </button>
      </form>
    </>
  );
};

export default CropPredictionForm;