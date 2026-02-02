const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cropPredictionRoutes = require('./routes/cropPredictionRoutes');
const contractRoutes = require('./routes/contractRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const alertRoutes = require('./routes/alertRoutes');
const schemeRoutes = require('./routes/schemeRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://192.168.1.10:3000",
    "https://192.168.1.10:3000",
    "https://fantastic-creponne-a522b0.netlify.app/"
  ],
  credentials: true
}));


app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/crop-prediction', cropPredictionRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/schemes', schemeRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;