# AquaGuards 

AquaGuards is an IoT-based water quality monitoring system designed to monitor aquatic environmental conditions in real time. It collects sensor data from an ESP32-based hardware unit, stores the readings in Firebase Realtime Database, and visualizes them through an interactive React dashboard.

---

## Features

- Real-time Water Temperature Monitoring
- Turbidity Monitoring
- Total Dissolved Solids (TDS) Monitoring
- Live Dashboard with Charts
- Automatic Risk Classification
- Marine Species Vulnerability Database
- PDF Report Generation
- CSV Data Export
- Indian Ocean Geotag Map
- Firebase Realtime Database Integration

---

## Technology Stack

### Frontend
- React.js
- Vite
- Chart.js
- React ChartJS 2
- HTML5
- CSS3

### Backend
- Firebase Realtime Database

### Hardware
- ESP32
- Temperature Sensor
- Turbidity Sensor
- TDS Sensor

### Libraries
- Firebase
- jsPDF
- html2canvas

---

## Folder Structure

AquaGuards/
```
src/
│
├── App.jsx
├── main.jsx
├── firebase.js
├── index.css
├── App.css
│
├── components/
│ ├── Dashboard.jsx
│ ├── Species.jsx
│ ├── Report.jsx
│ ├── Map.jsx
│ ├── Sidebar.jsx
│ ├── SidebarItem.jsx
│ └── MetricCard.jsx
│
└── utils/
└── exportCSV.js
```

---

## Dashboard Modules

- Dashboard
- Species Database
- Reports
- Geotag Map

---

## Monitored Parameters

- Water Temperature (°C)
- Turbidity (NTU)
- TDS (ppm)

---

## Risk Levels

| Status | Condition |
|---------|-----------|
| Safe | Normal environmental conditions |
| Warning | Moderate environmental stress |
| Critical | High environmental risk |

---

## Output

The system predicts:

- Fish Survival Percentage
- Water Habitability
- Biodiversity Health
- Species Vulnerability
- Environmental Risk

---

## Author

Developed as an IoT-based Water Quality Monitoring System using React, Firebase, ESP32, and Chart.js.
