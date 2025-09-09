# Kumbh Mela Navigation App - Triveni Ghat, Ujjain

A comprehensive mobile-first navigation and services application for the Kumbh Mela at Triveni Ghat, Ujjain. This app provides real-time navigation, crowd density monitoring, emergency services, and comprehensive facility information for pilgrims and visitors.

## 🌟 Features

### 📱 Mobile-First Dashboard
- **Intuitive Dashboard**: Clean, touch-friendly interface optimized for mobile devices
- **Screen-Based Navigation**: Smooth transitions between different app sections
- **Progressive Web App (PWA)**: Installable on mobile devices with offline capabilities

### 🗺️ Advanced Map Navigation
- **Interactive Map**: OpenStreetMap integration with custom sector markers
- **6 Distinct Sectors**: Strategically divided areas around Triveni Ghat
- **Real-time Location**: High-accuracy GPS tracking with visual feedback
- **Route Planning**: Turn-by-turn directions with estimated time and distance

### 🔥 Crowd Density Heat Map
- **Visual Heat Map**: Real-time crowd density overlay using color-coded indicators
- **Crowd Warnings**: Automatic alerts for high-density areas
- **Alternative Suggestions**: Smart recommendations for less crowded routes
- **Safety Features**: Visual warnings and alternative sector suggestions

### 📍 Comprehensive Nearby Places
- **Categorized Listings**: Washrooms, Medical, Police, Food, Temples, Parking, Rest areas
- **Detailed Information**: Ratings, opening hours, facilities, and contact details
- **Distance Calculation**: Real-time distance and walking time from user location
- **Famous Attractions**: Mahakaleshwar Temple, Kal Bhairav Temple, Sarafa Bazaar

### 🚨 Emergency Services
- **Quick Emergency Reporting**: Medical, Fire, Police, Security, and Accident reports
- **Real-time Submission**: Direct integration with backend emergency systems
- **Location-based Reports**: Automatic location tagging for faster response
- **Priority Levels**: Critical, High, Medium priority classification

### 🔍 Missing Person/Item Management
- **Missing Person Reports**: Comprehensive form with photo upload capability
- **Found Items Reporting**: Easy reporting system for found belongings
- **Contact Integration**: Direct contact information for coordination
- **Status Tracking**: Real-time status updates on reports

### 🏥 Facility Information
- **Medical Posts**: 24/7 emergency medical services and first aid stations
- **Police Stations**: Security outposts and crowd control centers
- **Food Distribution**: Free meal centers and prasad distribution points
- **Sanitation Facilities**: Clean washrooms and hygiene facilities
- **Accommodation**: Temporary shelters and dharamshalas

## 🛠️ Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup with mobile optimization
- **CSS3**: Responsive design with touch-friendly interfaces
- **JavaScript ES6+**: Modern JavaScript with async/await patterns
- **Leaflet.js**: Interactive maps with routing capabilities
- **PWA Features**: Service worker, manifest, offline functionality

### Backend Integration
- **FastAPI**: Python-based REST API with Supabase integration
- **Real-time Database**: Supabase for data storage and real-time updates
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Error Handling**: Comprehensive error handling and fallback mechanisms

### Mobile Optimizations
- **Touch-Friendly UI**: Large buttons and gesture-based interactions
- **Responsive Design**: Optimized for all mobile screen sizes
- **Performance**: Lazy loading and resource optimization
- **Offline Support**: Service worker for offline functionality

## 📂 File Structure

```
kumbh-mela-app/
├── index.html              # Main HTML file with mobile-first design
├── app.js                  # Main application controller
├── sectors.js              # Map functionality and sector management
├── api-service.js          # Backend API integration layer
├── nearby-places-data.js   # Comprehensive places database
├── manifest.json           # PWA manifest for mobile installation
├── sw.js                   # Service worker for offline functionality
├── README.md               # This documentation file
└── backend-hack-s25/       # Backend API implementation
    ├── app1.py             # FastAPI backend with CRUD operations
    ├── schema.sql          # Database schema
    └── requirements.txt    # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for map tiles and backend services
- Location services enabled for GPS functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kumbh-mela-app
   ```

2. **Set up the backend** (Optional - app works with fallback data)
   ```bash
   cd backend-hack-s25
   pip install -r requirements.txt
   # Configure Supabase credentials in .env file
   uvicorn app1:app --reload
   ```

3. **Serve the frontend**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx serve .
   
   # Or open index.html directly in browser
   ```

4. **Access the application**
   - Open `http://localhost:8080` in your browser
   - For mobile testing, use your device's IP address
   - Install as PWA for best mobile experience

## 📱 Mobile Usage Guide

### Dashboard Navigation
1. **Main Dashboard**: Central hub with service cards
2. **Map View**: Interactive navigation and route planning
3. **Nearby Places**: Categorized facility listings
4. **Emergency Services**: Quick access to emergency reporting
5. **Missing Person**: Report missing persons or items
6. **Found Items**: Report found belongings

### Map Features
- **Tap sectors** for detailed information
- **Long press** for custom navigation points
- **Heat map toggle** for crowd density visualization
- **Route sharing** via native share API

### Emergency Features
- **One-tap emergency** reporting with automatic location
- **Photo upload** for missing person reports
- **Real-time status** updates on submitted reports

## 🔧 Configuration

### API Configuration
Update the base URL in `api-service.js`:
```javascript
this.baseURL = 'http://your-backend-url:8000';
```

### Map Configuration
Customize map settings in `sectors.js`:
```javascript
const TRIVENI_GHAT_COORDS = [23.1287723, 75.7933631];
```

## 🌐 Browser Support

- **Chrome/Chromium**: Full support including PWA features
- **Safari**: Full support with iOS PWA capabilities
- **Firefox**: Full support with limited PWA features
- **Edge**: Full support including PWA features

## 📊 Performance Features

- **Lazy Loading**: Images and data loaded on demand
- **Service Worker**: Offline functionality and caching
- **Resource Optimization**: Minified assets and efficient loading
- **Mobile Optimization**: Touch gestures and responsive design

## 🔒 Privacy & Security

- **Location Privacy**: Location data used only for navigation
- **Data Encryption**: HTTPS for all API communications
- **Offline Storage**: Secure local storage for offline functionality
- **No Tracking**: No third-party analytics or tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on mobile devices
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for mapping functionality
- Supabase for backend services
- FastAPI for API framework
- The Kumbh Mela organizing committee

## 📞 Support

For technical support or feature requests:
- Create an issue in the repository
- Contact the development team
- Check the documentation for troubleshooting

---

**Built with ❤️ for the Kumbh Mela 2028 at Triveni Ghat, Ujjain**
