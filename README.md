# A.D.A Solar Frontend

Frontend application built with Angular for the A.D.A Solar Management System.

## Features

- Responsive Angular application
- Dashboard with system status, GPS location, and device battery info
- Solar Panels management
- Users management
- Communication with backend API via axios
- Geolocation API for GPS tracking
- Battery Status API for device battery monitoring
- Tailwind CSS for responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:4200`

## Pages

- **Dashboard** - System status, GPS location, battery level, and statistics
- **Solar Panels** - View and manage solar panels
- **Users** - View and manage users

## Features Detail

### GPS Location
- Real-time geolocation tracking
- Displays latitude, longitude, and accuracy
- View location on Google Maps
- Copy coordinates to clipboard
- Works on mobile devices (requires HTTPS on production)

### Device Battery Status
- Monitor device battery percentage
- Check if device is charging
- Estimated charging/discharging time
- Real-time battery level updates
- Battery status indicator with color coding
  - 🟢 Green: 80%+ battery
  - 🔵 Blue: 50-80%
  - 🟡 Yellow: 20-50%
  - 🔴 Red: <20%

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hamburger menu on mobile
- Adaptive layout for all screen sizes

## Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run linter

## API Configuration

The application expects the backend API to be running at `http://localhost:3000/api`

To change the API URL, modify the `baseUrl` in `src/app/services/api.service.ts`

## Browser Compatibility

### GPS Location
- Modern browsers with HTTPS support
- Mobile browsers (Chrome, Firefox, Safari)
- Desktop browsers (Chrome, Edge, Firefox)

### Battery Status API
- Chrome/Edge on Android
- Some Firefox versions
- Not available on iOS/Safari

### Tailwind CSS
- All modern browsers
- IE 11 not supported

## Testing on Mobile

### Same WiFi Network (Recommended)
```bash
# Get your local IP
ipconfig

# Start server accessible from network
ng serve --host 0.0.0.0 --port 4200 --disable-host-check

# On mobile browser, visit: http://YOUR_IP:4200
```

### Android Studio Emulator
```bash
ng serve --host 10.0.2.2 --port 4200

# In emulator browser: http://10.0.2.2:4200
```

### Using ngrok for Internet Access
```bash
npm install -g ngrok
ng serve
ngrok http 4200

# Use the public URL provided by ngrok
```

## Permissions Required

### For GPS
- Location permission (requested on first use)
- HTTPS on production

### For Battery Status
- No special permissions needed
- API availability depends on browser

## Development

- Components are in `frontend/src/app/components/`
- Services are in `frontend/src/app/services/`
- Routes are defined in `frontend/src/app/app.routes.ts`
- Styles use Tailwind CSS utility classes

## Services

### LocationService
Handles GPS geolocation:
- `getCurrentLocation()` - Get current location once
- `startWatchingLocation()` - Monitor location continuously
- `stopWatchingLocation()` - Stop monitoring
- `getMapUrl()` - Get Google Maps URL
- `calculateDistance()` - Calculate distance between coordinates

### BatteryService
Monitors device battery:
- `getBatteryStatus()` - Get complete battery info
- `getBatteryPercentage()` - Get battery percentage (0-100)
- `isCharging()` - Check if charging
- `getChargingTime()` - Get estimated charging time
- `getDischargingTime()` - Get estimated discharging time

### ApiService
Backend API communication:
- `getUsers()` - Get all users
- `createUser()` - Create new user
- `getSolarPanels()` - Get all solar panels
- `createSolarPanel()` - Create new solar panel
- `healthCheck()` - Check backend status
