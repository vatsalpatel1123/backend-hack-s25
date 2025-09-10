<div align="center">

# 🕉️ Simhastha Kumbh Mela 2028 - Smart Navigation & Safety Platform

<p align="center">
  <img src="https://img.shields.io/badge/Kumbh%20Mela-2028-orange?style=for-the-badge&logo=hinduism" alt="Kumbh Mela 2028">
  <img src="https://img.shields.io/badge/Location-Triveni%20Ghat%2C%20Ujjain-blue?style=for-the-badge&logo=location" alt="Location">
  <img src="https://img.shields.io/badge/Status-Active%20Development-green?style=for-the-badge" alt="Status">
</p>

<p align="center">
  <strong>A comprehensive mobile-first navigation and safety platform for the Simhastha Kumbh Mela at Triveni Ghat, Ujjain</strong>
</p>

<p align="center">
  Real-time navigation • Crowd density monitoring • Emergency services • Comprehensive facility information
</p>

</div>

---

## 🛡️ Technology Stack

<div align="center">

### Frontend Technologies
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)

### Backend Technologies
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Development Tools
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

</div>

## 📱 Screenshots & Visuals

<div align="center">

### 🖼️ Application Screenshots

> **Note**: Screenshots will be added here showing the main dashboard, map interface, emergency reporting, and crowd density features.

| Dashboard | Map Navigation | Emergency Services | Crowd Density |
|-----------|----------------|-------------------|---------------|
| ![Dashboard](./screenshots/dashboard.png) | ![Map](./screenshots/map.png) | ![Emergency](./screenshots/emergency.png) | ![Crowd](./screenshots/crowd.png) |

*Screenshots showcase the mobile-first design and intuitive user interface*

</div>

---

## 🌟 Key Features

<table>
<tr>
<td width="50%">

### 📱 **Mobile-First Dashboard**
- 🎯 **Intuitive Interface**: Clean, touch-friendly design optimized for mobile devices
- 🔄 **Smooth Navigation**: Seamless transitions between app sections
- 📲 **PWA Support**: Installable on mobile devices with offline capabilities
- ⚡ **Fast Loading**: Optimized performance for quick access

</td>
<td width="50%">

### 🗺️ **Advanced Map Navigation**
- 🌍 **Interactive Maps**: OpenStreetMap integration with custom sector markers
- 📍 **6 Strategic Sectors**: Divided areas around Triveni Ghat for better navigation
- 🎯 **Real-time GPS**: High-accuracy location tracking with visual feedback
- 🛣️ **Smart Routing**: Turn-by-turn directions with time and distance estimates

</td>
</tr>
<tr>
<td width="50%">

### 🔥 **Crowd Density Heat Map**
- 🌡️ **Visual Heat Map**: Real-time crowd density with color-coded indicators
- ⚠️ **Smart Alerts**: Automatic warnings for high-density areas
- 🔄 **Alternative Routes**: Intelligent suggestions for less crowded paths
- 🛡️ **Safety First**: Visual warnings and sector-based recommendations

</td>
<td width="50%">

### 📍 **Comprehensive Nearby Places**
- 🏷️ **Categorized Listings**: Washrooms, Medical, Police, Food, Temples, Parking
- ℹ️ **Detailed Information**: Ratings, hours, facilities, and contact details
- 📏 **Distance Calculation**: Real-time distance and walking time estimates
- 🏛️ **Famous Attractions**: Mahakaleshwar Temple, Kal Bhairav Temple, Sarafa Bazaar

</td>
</tr>
<tr>
<td width="50%">

### 🚨 **Emergency Services**
- 🆘 **Quick Reporting**: Medical, Fire, Police, Security, and Accident reports
- ⚡ **Real-time Integration**: Direct connection to emergency response systems
- 📍 **Auto-Location**: Automatic location tagging for faster response
- 🎯 **Priority System**: Critical, High, Medium priority classification

</td>
<td width="50%">

### 🔍 **Missing Person/Item Management**
- 👤 **Person Reports**: Comprehensive forms with photo upload capability
- 📦 **Found Items**: Easy reporting system for lost and found belongings
- 📞 **Contact Integration**: Direct communication for coordination
- 📊 **Status Tracking**: Real-time updates on report status

</td>
</tr>
</table>

### 🏥 **Comprehensive Facility Information**

<div align="center">

| 🏥 Medical Posts | 👮 Police Stations | 🍽️ Food Distribution | 🚿 Sanitation | 🏠 Accommodation |
|------------------|-------------------|---------------------|---------------|------------------|
| 24/7 emergency services | Security outposts | Free meal centers | Clean washrooms | Temporary shelters |
| First aid stations | Crowd control centers | Prasad distribution | Hygiene facilities | Dharamshalas |

</div>

---

## 🏗️ Architecture & Technical Implementation

<div align="center">

### 🔧 **System Architecture**

```mermaid
graph TB
    A[Mobile App Frontend] --> B[API Gateway]
    B --> C[FastAPI Backend]
    C --> D[Supabase Database]
    C --> E[Real-time Services]
    F[Admin Dashboard] --> B
    G[Emergency Services] --> B
    H[Crowd Monitoring] --> C
```

</div>

### 🎨 **Frontend Architecture**

<table>
<tr>
<td width="33%">

**📱 Core Technologies**
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) Semantic markup
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) Responsive design
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) ES6+ features

</td>
<td width="33%">

**🗺️ Mapping & UI**
- ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white) Interactive maps
- ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white) Progressive Web App
- 📱 Touch-optimized interface

</td>
<td width="33%">

**⚡ Performance**
- 🚀 Lazy loading
- 📦 Resource optimization
- 🔄 Service worker caching
- 📱 Mobile-first approach

</td>
</tr>
</table>

### 🔧 **Backend Architecture**

<table>
<tr>
<td width="50%">

**🐍 Core Framework**
- ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white) **FastAPI**: High-performance Python API framework
- ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) **Python 3.8+**: Modern Python with type hints
- 🔄 **Async/Await**: Non-blocking operations for better performance

</td>
<td width="50%">

**🗄️ Database & Storage**
- ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) **Supabase**: Real-time database and authentication
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) **PostgreSQL**: Robust relational database
- ⚡ **Real-time Updates**: Live data synchronization

</td>
</tr>
</table>

### 📱 **Mobile Optimizations**

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| 🎯 **Touch-Friendly UI** | Large buttons, gesture controls | Enhanced mobile usability |
| 📱 **Responsive Design** | CSS Grid, Flexbox, Media queries | Works on all screen sizes |
| ⚡ **Performance** | Lazy loading, image optimization | Fast loading times |
| 🔄 **Offline Support** | Service worker, local storage | Works without internet |
| 📍 **GPS Integration** | Geolocation API, real-time tracking | Accurate location services |

---

## 📂 Project Structure

<div align="center">

### 🗂️ **Directory Layout**

</div>

```
📁 simhastha-kumbh-mela-2028/
├── 📄 README.md                    # 📖 Comprehensive project documentation
├── 📄 .env.example                 # 🔧 Environment variables template
├── 📄 .gitignore                   # 🚫 Git ignore rules
├── 📄 index.html                   # 🏠 Main HTML file with mobile-first design
├── 📄 manifest.json                # 📱 PWA manifest for mobile installation
├── 📄 sw.js                        # ⚡ Service worker for offline functionality
│
├── 📁 Frontend Core/
│   ├── 📄 app.js                   # 🎮 Main application controller
│   ├── 📄 sectors.js               # 🗺️ Map functionality and sector management
│   ├── 📄 api-service.js           # 🔌 Backend API integration layer
│   └── 📄 nearby-places-data.js    # 📍 Comprehensive places database
│
├── 📁 backend/                     # 🔧 Backend API Implementation
│   ├── 📄 app.py                   # 🐍 Main FastAPI application
│   ├── 📄 app1.py                  # 🐍 Alternative FastAPI implementation
│   ├── 📄 app-final.py             # 🐍 Final FastAPI backend
│   ├── 📄 schema.sql               # 🗄️ Database schema definitions
│   ├── 📄 req.txt                  # 📦 Python dependencies
│   ├── 📄 run.txt                  # 🚀 Run instructions
│   └── 📄 Simhastha.postman_collection.json # 📮 API testing collection
│
├── 📁 heatmap/                     # 🔥 Crowd Density Monitoring
│   ├── 📄 heat-map.py              # 🌡️ Heat map generation logic
│   └── 📁 backend/                 # 🔧 Heat map backend services
│       ├── 📄 main.py              # 🐍 Heat map API server
│       ├── 📄 req.txt              # 📦 Heat map dependencies
│       └── 📁 ss/                  # 📸 Screenshots and media
│
└── 📁 missing-persons-data.js      # 👤 Missing persons data management
```

### 📋 **File Descriptions**

<table>
<tr>
<td width="50%">

**🎨 Frontend Files**
- `index.html` - Main application entry point
- `app.js` - Core application logic and state management
- `sectors.js` - Map integration and sector management
- `api-service.js` - API communication layer
- `nearby-places-data.js` - Static data for nearby facilities

</td>
<td width="50%">

**🔧 Backend Files**
- `app.py` - Main FastAPI application with full features
- `app1.py` - Modular FastAPI implementation
- `schema.sql` - Database table definitions
- `req.txt` - Python package requirements
- `Simhastha.postman_collection.json` - API testing suite

</td>
</tr>
<tr>
<td width="50%">

**📱 PWA Files**
- `manifest.json` - PWA configuration and metadata
- `sw.js` - Service worker for offline functionality
- `.env.example` - Environment variables template

</td>
<td width="50%">

**🔥 Specialized Modules**
- `heatmap/` - Crowd density monitoring system
- `missing-persons-data.js` - Missing persons management
- `ss/` - Screenshots and documentation media

</td>
</tr>
</table>

---

## 🚀 Quick Start Guide

<div align="center">

### ⚡ **Get Up and Running in 5 Minutes**

</div>

### 📋 **Prerequisites**

<table>
<tr>
<td width="33%">

**💻 System Requirements**
- 🌐 Modern web browser (Chrome, Firefox, Safari, Edge)
- 🐍 Python 3.8+ (for backend)
- 📱 Mobile device (for testing)

</td>
<td width="33%">

**🔧 Development Tools**
- 📝 Code editor (VS Code recommended)
- 🔄 Git for version control
- 📮 Postman (for API testing)

</td>
<td width="33%">

**🌐 Services**
- 🌍 Internet connection
- 📍 Location services enabled
- 🗄️ Supabase account (for backend)

</td>
</tr>
</table>

### 🛠️ **Installation Steps**

#### **Step 1: Clone the Repository**
```bash
# Clone the project
git clone https://github.com/your-username/simhastha-kumbh-mela-2028.git
cd simhastha-kumbh-mela-2028

# Verify the structure
ls -la
```

#### **Step 2: Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your credentials
# Use your preferred editor (nano, vim, or VS Code)
nano .env
```

<details>
<summary>🔧 <strong>Environment Variables Configuration</strong></summary>

```bash
# Required Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@db.your-project-id.supabase.co:5432/postgres

# API Configuration
API_BASE_URL=http://localhost:8000
```

</details>

#### **Step 3: Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r req.txt

# Run the backend server
uvicorn app1:app --reload --host 0.0.0.0 --port 8000
```

#### **Step 4: Frontend Setup**
```bash
# Open a new terminal and navigate to project root
cd simhastha-kumbh-mela-2028

# Option 1: Using Python
python -m http.server 8080

# Option 2: Using Node.js (if you have it installed)
npx serve . -p 8080

# Option 3: Using PHP (if you have it installed)
php -S localhost:8080
```

#### **Step 5: Access the Application**

<table>
<tr>
<td width="50%">

**🖥️ Desktop Access**
- Open browser: `http://localhost:8080`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

</td>
<td width="50%">

**📱 Mobile Testing**
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Access: `http://YOUR_IP:8080`
- Install as PWA for best experience

</td>
</tr>
</table>

---

## 📱 User Guide & Features

<div align="center">

### 🎯 **How to Use the Application**

</div>

<table>
<tr>
<td width="50%">

### 🏠 **Dashboard Navigation**
1. 🎛️ **Main Dashboard** - Central hub with service cards
2. 🗺️ **Map View** - Interactive navigation and route planning
3. 📍 **Nearby Places** - Categorized facility listings
4. 🚨 **Emergency Services** - Quick access to emergency reporting
5. 👤 **Missing Person** - Report missing persons or items
6. 📦 **Found Items** - Report found belongings

</td>
<td width="50%">

### 🗺️ **Map Features**
- 👆 **Tap sectors** for detailed information
- ⏰ **Long press** for custom navigation points
- 🔥 **Heat map toggle** for crowd density visualization
- 📤 **Route sharing** via native share API
- 📍 **Real-time GPS** tracking and location updates
- 🛣️ **Turn-by-turn** navigation with voice guidance

</td>
</tr>
<tr>
<td width="50%">

### 🚨 **Emergency Features**
- ⚡ **One-tap emergency** reporting with automatic location
- 📸 **Photo upload** for missing person reports
- 📊 **Real-time status** updates on submitted reports
- 🎯 **Priority classification** (Critical, High, Medium)
- 📞 **Direct contact** with emergency services

</td>
<td width="50%">

### 📱 **Mobile Optimizations**
- 📲 **PWA Installation** - Add to home screen
- 🔄 **Offline Mode** - Works without internet
- 👆 **Touch Gestures** - Swipe, pinch, tap interactions
- 🔋 **Battery Efficient** - Optimized for mobile devices
- 📶 **Low Data Mode** - Minimal data usage

</td>
</tr>
</table>

---

## 🔧 Configuration & Customization

### 🌐 **API Configuration**

<details>
<summary>📝 <strong>Frontend API Configuration</strong></summary>

Update the base URL in `api-service.js`:
```javascript
class ApiService {
    constructor() {
        // Update this URL to match your backend deployment
        this.baseURL = 'https://your-backend-url.com';
        // For local development
        // this.baseURL = 'http://localhost:8000';
    }
}
```

</details>

### 🗺️ **Map Configuration**

<details>
<summary>🗺️ <strong>Map Settings Customization</strong></summary>

Customize map settings in `sectors.js`:
```javascript
// Triveni Ghat coordinates (Ujjain)
const TRIVENI_GHAT_COORDS = [23.1287723, 75.7933631];

// Map configuration
const MAP_CONFIG = {
    center: TRIVENI_GHAT_COORDS,
    zoom: 16,
    maxZoom: 20,
    minZoom: 12
};

// Sector definitions
const SECTORS = [
    { id: 1, name: "Sector 1 - Main Ghat", coords: [23.1290, 75.7930] },
    { id: 2, name: "Sector 2 - North Bank", coords: [23.1295, 75.7935] },
    // Add more sectors as needed
];
```

</details>

### 🎨 **UI Customization**

<details>
<summary>🎨 <strong>Theme and Styling</strong></summary>

Customize colors and themes in CSS:
```css
:root {
    --primary-color: #FF6B35;      /* Saffron */
    --secondary-color: #138808;     /* Green */
    --accent-color: #000080;        /* Blue */
    --background-color: #FFFFFF;    /* White */
    --text-color: #333333;          /* Dark Gray */
}
```

</details>

---

## 🔒 Security & Privacy

<div align="center">

### 🛡️ **Security Best Practices**

</div>

<table>
<tr>
<td width="50%">

### 🔐 **Environment Security**
- ✅ **Environment Variables**: All sensitive data in `.env` files
- ❌ **No Hardcoded Secrets**: Credentials removed from source code
- 🔄 **Key Rotation**: Regular rotation of API keys and tokens
- 🚫 **Git Ignore**: Sensitive files excluded from version control

</td>
<td width="50%">

### 🌐 **API Security**
- 🔒 **HTTPS Only**: All API communications encrypted
- 🎯 **CORS Configuration**: Restricted cross-origin requests
- 🔑 **Authentication**: JWT-based user authentication
- ⚡ **Rate Limiting**: Protection against API abuse

</td>
</tr>
<tr>
<td width="50%">

### 📱 **Client-Side Security**
- 🔒 **Secure Storage**: Encrypted local storage for sensitive data
- 🚫 **No Sensitive Logs**: Production logs sanitized
- 🛡️ **Input Validation**: All user inputs validated and sanitized
- 📍 **Location Privacy**: GPS data used only for navigation

</td>
<td width="50%">

### 🗄️ **Database Security**
- 🔐 **Row Level Security**: Supabase RLS policies enabled
- 🔑 **Service Keys**: Separate keys for different access levels
- 📊 **Audit Logs**: All database operations logged
- 🔄 **Backup Strategy**: Regular automated backups

</td>
</tr>
</table>

### 🔧 **Security Configuration Checklist**

- [ ] ✅ Copy `.env.example` to `.env` and fill in your credentials
- [ ] ✅ Ensure `.env` is in `.gitignore`
- [ ] ✅ Use HTTPS in production
- [ ] ✅ Configure Supabase Row Level Security (RLS)
- [ ] ✅ Set up proper CORS origins
- [ ] ✅ Enable rate limiting on API endpoints
- [ ] ✅ Regular security audits and dependency updates

---

## 🚀 Deployment Guide

<div align="center">

### 🌐 **Production Deployment Options**

</div>

### 🔧 **Frontend Deployment**

<table>
<tr>
<td width="33%">

**🌐 Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

</td>
<td width="33%">

**🌐 Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

</td>
<td width="33%">

**🌐 GitHub Pages**
```bash
# Enable GitHub Pages
# in repository settings
# Deploy from main branch
```

</td>
</tr>
</table>

### 🔧 **Backend Deployment**

<table>
<tr>
<td width="50%">

**🐳 Docker Deployment**
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY backend/req.txt .
RUN pip install -r req.txt

COPY backend/ .
CMD ["uvicorn", "app1:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t kumbh-mela-api .
docker run -p 8000:8000 --env-file .env kumbh-mela-api
```

</td>
<td width="50%">

**☁️ Cloud Deployment**
```bash
# Heroku
heroku create kumbh-mela-api
git push heroku main

# Railway
railway login
railway deploy

# DigitalOcean App Platform
doctl apps create --spec app.yaml
```

</td>
</tr>
</table>

### 🌐 **Environment-Specific Configuration**

<details>
<summary>🔧 <strong>Production Environment Variables</strong></summary>

```bash
# Production .env
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Use production Supabase project
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_KEY=your_production_service_key

# Production database
DATABASE_URL=postgresql://postgres:secure_password@prod-db.supabase.co:5432/postgres

# Production API URL
API_BASE_URL=https://api.yourdomain.com

# Security settings
JWT_SECRET=very_secure_random_string_for_production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

</details>

---

## 📊 Performance & Monitoring

<table>
<tr>
<td width="50%">

### ⚡ **Performance Features**
- 🚀 **Lazy Loading**: Images and data loaded on demand
- 🔄 **Service Worker**: Offline functionality and caching
- 📦 **Resource Optimization**: Minified assets and efficient loading
- 📱 **Mobile Optimization**: Touch gestures and responsive design
- ⚡ **CDN Integration**: Fast global content delivery

</td>
<td width="50%">

### 🌐 **Browser Support**
- ✅ **Chrome/Chromium**: Full support including PWA features
- ✅ **Safari**: Full support with iOS PWA capabilities
- ✅ **Firefox**: Full support with limited PWA features
- ✅ **Edge**: Full support including PWA features
- 📱 **Mobile Browsers**: Optimized for all mobile platforms

</td>
</tr>
</table>

### 📈 **Monitoring & Analytics**

<details>
<summary>📊 <strong>Performance Monitoring Setup</strong></summary>

```javascript
// Add to your HTML head for performance monitoring
<script>
// Google Analytics (optional)
gtag('config', 'GA_MEASUREMENT_ID');

// Performance monitoring
window.addEventListener('load', () => {
    // Measure page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log('Page load time:', loadTime + 'ms');
});
</script>
```

</details>

---

## 🤝 Contributing

<div align="center">

### 🌟 **Join Our Mission to Serve Millions of Pilgrims**

</div>

We welcome contributions from developers, designers, and domain experts who want to help make the Simhastha Kumbh Mela 2028 a safe and memorable experience for millions of pilgrims.

### 🚀 **How to Contribute**

<table>
<tr>
<td width="50%">

**🔧 For Developers**
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💻 Make your changes
4. 📱 Test on mobile devices
5. ✅ Ensure all tests pass
6. 📝 Update documentation
7. 🚀 Submit a pull request

</td>
<td width="50%">

**🎨 For Designers**
1. 🎨 UI/UX improvements
2. 📱 Mobile interface enhancements
3. 🌐 Accessibility improvements
4. 📸 Icon and graphic design
5. 🎯 User experience optimization

</td>
</tr>
</table>

### 📋 **Contribution Guidelines**

- ✅ Follow existing code style and conventions
- ✅ Write clear, descriptive commit messages
- ✅ Add tests for new features
- ✅ Update documentation for changes
- ✅ Ensure mobile compatibility
- ✅ Test with real devices when possible

### 🐛 **Reporting Issues**

Found a bug or have a feature request? Please create an issue with:
- 📝 Clear description of the problem
- 🔄 Steps to reproduce
- 📱 Device and browser information
- 📸 Screenshots if applicable

---

## 📄 License

<div align="center">

**MIT License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

*Free to use, modify, and distribute for the benefit of pilgrims and devotees.*

</div>

---

## 🙏 Acknowledgments

<div align="center">

### 🌟 **Special Thanks**

</div>

<table>
<tr>
<td width="50%">

**🛠️ Technology Partners**
- 🗺️ [OpenStreetMap](https://openstreetmap.org) - Free map data
- 🍃 [Leaflet.js](https://leafletjs.com) - Interactive mapping
- 🚀 [Supabase](https://supabase.com) - Backend infrastructure
- ⚡ [FastAPI](https://fastapi.tiangolo.com) - Modern Python API framework

</td>
<td width="50%">

**🏛️ Institutional Support**
- 🕉️ Simhastha Kumbh Mela Organizing Committee
- 🏛️ Government of Madhya Pradesh
- 🏛️ Ujjain Municipal Corporation
- 👮 Local Police and Emergency Services

</td>
</tr>
</table>

**🙏 Dedicated to the millions of pilgrims who will visit Triveni Ghat, Ujjain during Simhastha Kumbh Mela 2028**

---

## 📞 Support & Contact

<div align="center">

### 🆘 **Need Help?**

</div>

<table>
<tr>
<td width="33%">

**🐛 Technical Issues**
- 📝 [Create an Issue](https://github.com/your-repo/issues)
- 📧 Email: tech-support@kumbhmela2028.org
- 💬 Discord: [Join our community](https://discord.gg/kumbhmela2028)

</td>
<td width="33%">

**📖 Documentation**
- 📚 [API Documentation](http://localhost:8000/docs)
- 🎥 [Video Tutorials](https://youtube.com/kumbhmela2028)
- 📖 [User Guide](./docs/user-guide.md)

</td>
<td width="33%">

**🚨 Emergency Support**
- ☎️ 24/7 Helpline: +91-XXX-XXX-XXXX
- 📧 Emergency: emergency@kumbhmela2028.org
- 🏥 Medical: medical@kumbhmela2028.org

</td>
</tr>
</table>

---

<div align="center">

## 🕉️ **Built with ❤️ for Simhastha Kumbh Mela 2028 By Vatsal Patel and Krushil Patel**

### **Triveni Ghat, Ujjain - Where Faith Meets Technology**

<p>
  <img src="https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge" alt="Made with Love">
  <img src="https://img.shields.io/badge/For-Pilgrims-orange?style=for-the-badge" alt="For Pilgrims">
  <img src="https://img.shields.io/badge/Kumbh%20Mela-2028-blue?style=for-the-badge" alt="Kumbh Mela 2028">
</p>

**"Sarve Bhavantu Sukhinah, Sarve Santu Niramayah"**
*May all beings be happy, may all beings be healthy*

---

*This project is dedicated to ensuring the safety, comfort, and spiritual fulfillment of millions of devotees visiting the sacred Triveni Ghat during Simhastha Kumbh Mela 2028.*

</div>
