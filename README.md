# AgroConnect - Smart Farming & Contract Farming Platform

A comprehensive Progressive Web Application (PWA) built with MERN stack and integrated Machine Learning for modern agriculture management. This platform connects farmers, companies, and administrators to facilitate contract farming, crop prediction, and access to government schemes.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🌾 For Farmers
- **Crop Prediction with ML**: Get AI-powered crop recommendations based on soil and weather parameters
- **Contract Farming**: Browse and apply to contract farming opportunities from verified companies
- **Weather Alerts**: Receive real-time weather warnings in multiple languages (English, Hindi, Marathi)
- **Mandi Prices**: View current market prices for various crops
- **Government Schemes**: Access information about agricultural schemes with multi-language support
- **Voice Guide**: Text-to-speech functionality for important information
- **Application Tracking**: Monitor status of contract applications
- **Mobile-First Design**: Optimized for mobile devices with bottom navigation

### 🏢 For Companies
- **Company Verification**: Admin-verified registration process
- **Contract Creation**: Create contract farming opportunities with legal document upload
- **Applicant Management**: Review and manage farmer applications
- **Dashboard Analytics**: View statistics and contract performance
- **Dispute Management**: Handle complaints and disputes
- **PDF Contract Upload**: Attach legal contracts to farming agreements

### 👨‍💼 For Administrators
- **Company Verification**: Review and approve/reject company registrations
- **User Management**: Block/unblock users and monitor activities
- **Contract Oversight**: Verify legal contracts and manage contract status
- **Dispute Resolution**: Handle farmer-company disputes
- **Alert Management**: Create weather alerts and notifications
- **Mandi Price Updates**: Add and manage market prices
- **Scheme Management**: CRUD operations for government schemes with multi-language support

### 🔧 Technical Features
- **Progressive Web App (PWA)**: Installable on mobile devices, offline support
- **Multi-Language Support**: English, Hindi, Marathi
- **Role-Based Access Control**: Secure authentication with JWT
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Notifications**: Toast notifications for user actions
- **File Upload**: PDF contract upload with validation
- **Machine Learning Integration**: Random Forest Classifier for crop prediction
- **RESTful API**: Clean and documented API architecture

---

## 🛠 Tech Stack

### Frontend
- **React.js** (v18.2.0) - UI library
- **Tailwind CSS** (v3.3.6) - Styling
- **React Router DOM** (v6.20.0) - Routing
- **Axios** (v1.6.2) - API calls
- **React i18next** (v13.5.0) - Internationalization
- **React Toastify** (v9.1.3) - Notifications
- **Lucide React** (v0.300.0) - Icons
- **JWT Decode** (v4.0.0) - Token handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** (v4.18.2) - Web framework
- **MongoDB** with **Mongoose** (v8.0.3) - Database
- **JWT** (jsonwebtoken v9.0.2) - Authentication
- **Bcrypt.js** (v2.4.3) - Password hashing
- **Multer** (v1.4.5) - File upload
- **CORS** (v2.8.5) - Cross-origin requests

### ML Service
- **Python** (v3.8+)
- **Flask** (v3.0.0) - API framework
- **scikit-learn** (v1.3.2) - Machine learning
- **Pandas** (v2.1.4) - Data processing
- **NumPy** (v1.26.2) - Numerical computing

---

## 📁 Project Structure

```
project-root/
│
├── backend/                          # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── CropPrediction.js
│   │   │   ├── Contract.js
│   │   │   ├── ContractApplication.js
│   │   │   ├── ContractDispute.js
│   │   │   ├── Alert.js
│   │   │   └── Scheme.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleAuth.js
│   │   │   └── upload.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── cropPredictionController.js
│   │   │   ├── contractController.js
│   │   │   ├── disputeController.js
│   │   │   ├── alertController.js
│   │   │   └── schemeController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── cropPredictionRoutes.js
│   │   │   ├── contractRoutes.js
│   │   │   ├── disputeRoutes.js
│   │   │   ├── alertRoutes.js
│   │   │   └── schemeRoutes.js
│   │   ├── utils/
│   │   │   ├── errorHandler.js
│   │   │   └── validators.js
│   │   └── app.js
│   ├── uploads/
│   │   └── contracts/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── ml-service/                       # Python ML Service
│   ├── data/
│   │   └── Crop_recommendation.csv
│   ├── models/
│   │   └── crop_model.pkl
│   ├── train_model.py
│   ├── app.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   ├── manifest.json
│   │   ├── service-worker.js
│   │   ├── icons/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── farmer/
│   │   │   ├── company/
│   │   │   └── admin/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── farmer/
│   │   │   ├── company/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── locales/
│   │   ├── routes/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── i18n.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-root
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

**Backend `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agroconnect
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

### 3. ML Service Setup

```bash
# Navigate to ML service directory
cd ../ml-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
touch .env
```

**ML Service `.env` file:**
```env
FLASK_PORT=5001
FLASK_ENV=development
MODEL_PATH=models/crop_model.pkl
DATA_PATH=data/Crop_recommendation.csv
```

**Place your `Crop_recommendation.csv` file in `ml-service/data/` directory**

**Train the ML Model:**
```bash
python train_model.py
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
touch .env
```

**Frontend `.env` file:**
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ML_BASE_URL=http://localhost:5001
REACT_APP_UPLOADS_URL=http://localhost:5000/uploads
```

---

## 🏃 Running the Application

### Start MongoDB

```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5000`

### Start ML Service

```bash
cd ml-service
# Activate virtual environment first
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
python app.py
```

ML Service will run on: `http://localhost:5001`

### Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 🌐 Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/agroconnect` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `ML_SERVICE_URL` | ML service base URL | `http://localhost:5001` |
| `NODE_ENV` | Environment mode | `development` |

### ML Service Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_PORT` | Flask server port | `5001` |
| `FLASK_ENV` | Flask environment | `development` |
| `MODEL_PATH` | Path to trained model | `models/crop_model.pkl` |
| `DATA_PATH` | Path to training data | `data/Crop_recommendation.csv` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_ML_BASE_URL` | ML service base URL | `http://localhost:5001` |
| `REACT_APP_UPLOADS_URL` | Uploads directory URL | `http://localhost:5000/uploads` |

---

## 👥 User Roles

### 1. Farmer
- Register and login
- Get crop predictions based on soil parameters
- Browse and apply to contracts
- View weather alerts and mandi prices
- Access government schemes
- Track application status

**Demo Credentials:**
```
Email: farmer@example.com
Password: password123
```

### 2. Company
- Register (requires admin verification)
- Create contract farming opportunities
- Upload legal contract documents (PDF)
- Review and manage farmer applications
- Accept or reject applications
- Handle disputes

**Demo Credentials:**
```
Email: company@example.com
Password: password123
```

### 3. Admin
- Verify/reject company registrations
- Manage users (block/unblock)
- Verify legal contract documents
- Resolve disputes
- Create weather alerts
- Update mandi prices
- Manage government schemes

**Demo Credentials:**
```
Email: admin@example.com
Password: admin123
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/admin/login` | Admin login | Public |
| GET | `/auth/profile` | Get user profile | Authenticated |
| PUT | `/auth/profile` | Update profile | Authenticated |

### Crop Prediction Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/crop-prediction/predict` | Predict crop | Farmer |
| GET | `/crop-prediction/history` | Get prediction history | Farmer |
| GET | `/crop-prediction/:id` | Get specific prediction | Farmer |

### Contract Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/contracts` | Create contract | Company |
| GET | `/contracts` | Get all contracts | All |
| GET | `/contracts/:id` | Get contract details | All |
| POST | `/contracts/:id/apply` | Apply to contract | Farmer |
| GET | `/contracts/:id/applications` | Get applicants | Company |
| PUT | `/contracts/applications/:id/status` | Update application | Company |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/users/companies/pending` | Get pending companies | Admin |
| PUT | `/users/companies/:id/verify` | Verify company | Admin |
| PUT | `/users/users/:id/block` | Block user | Admin |
| PUT | `/contracts/:id/verify-legal` | Verify legal contract | Admin |

For complete API documentation, refer to the backend API documentation file.

---

## 📱 PWA Features

### Installation
- **Desktop**: Click the install icon in the browser address bar
- **Mobile**: Use "Add to Home Screen" from browser menu

### Offline Support
- Service worker caches essential app shell
- Offline detection with banner notification
- Cached data available offline

### Features
- Install as standalone app
- Full-screen mode
- App icons and splash screen
- Background sync capabilities

---

## 🎨 Screenshots

### Farmer Interface
- Mobile-optimized bottom navigation
- Crop prediction form
- Contract browsing
- Multi-language alerts

### Company Dashboard
- Contract management
- Applicant review
- Statistics dashboard

### Admin Panel
- Company verification
- User management
- Dispute resolution

---

## 🧪 Testing

### Manual Testing Checklist

**Farmer Flow:**
1. ✅ Register as farmer
2. ✅ Login
3. ✅ Predict crop with soil parameters
4. ✅ View prediction history
5. ✅ Browse contracts
6. ✅ Apply to contract
7. ✅ Check application status
8. ✅ View weather alerts
9. ✅ Check mandi prices
10. ✅ Browse schemes in different languages

**Company Flow:**
1. ✅ Register as company
2. ✅ Wait for admin verification
3. ✅ Login after verification
4. ✅ Create contract with PDF upload
5. ✅ View applicants
6. ✅ Accept/reject applications

**Admin Flow:**
1. ✅ Login as admin
2. ✅ Verify pending companies
3. ✅ Verify legal contracts
4. ✅ Create weather alerts
5. ✅ Add mandi prices
6. ✅ Manage schemes

---

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Make sure MongoDB is running
sudo systemctl status mongod  # Linux
brew services list  # macOS
```

**2. ML Model Not Found**
```bash
# Train the model first
cd ml-service
python train_model.py
```

**3. Port Already in Use**
```bash
# Kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

**4. CORS Error**
- Check if backend CORS is configured properly
- Ensure frontend API URL matches backend URL

**5. JWT Token Expired**
- Login again to get new token
- Token expires after 7 days

---

## 📝 Development Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

### ML Service
```bash
python train_model.py    # Train ML model
python app.py            # Start Flask server
```

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based authorization
- ✅ Protected API routes
- ✅ File upload validation (PDF only)
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection

---

## 🚢 Deployment

### Backend Deployment (Heroku/Railway)
```bash
# Set environment variables
# Deploy using Git
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)
```bash
# Build the app
npm run build

# Deploy dist folder
```

### Database (MongoDB Atlas)
- Create free cluster
- Update MongoDB URI in backend .env

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- Icons from [Lucide React](https://lucide.dev/)
- ML Dataset: Crop Recommendation Dataset
- UI Inspiration: Modern farming platforms
- Community support from MERN Stack developers

---

## 📞 Support

For support, email: support@agroconnect.com

---

## 🔮 Future Enhancements

- [ ] Real-time chat between farmers and companies
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Blockchain for contract transparency
- [ ] AI chatbot for farmer queries
- [ ] Weather API integration
- [ ] Drone imagery integration
- [ ] IoT sensor data integration

---

**Made with ❤️ for Farmers**