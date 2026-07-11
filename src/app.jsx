import { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import { Line, Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper SVG Icons
const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const IconChecklist = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>;
const IconTime = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const IconAttendance = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

export default function App() {
  const [data, setData] = useState({
    Temperature: 0,
    Turbidity: 0,
    TDS: 0
  });

  const [history, setHistory] = useState([]);
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    const waterRef = ref(db, "Water");

    onValue(waterRef, (snapshot) => {
      const d = snapshot.val();
      if (!d) return;

      setData(d);

      setHistory(prev => {
        const newHistory = [
          ...prev,
          { 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
            temp: d.Temperature,
            turbidity: d.Turbidity,
            tds: d.TDS
          }
        ];
        return newHistory.slice(-10); // Keep last 10 points
      });
    });
  }, []);

  let riskLevel = 'safe';
  // Hardware logic syncing: Safe (22-30), Warning (18-22 or 30-35), High Risk (<18 or >35)
  if (data.Temperature >= 22 && data.Temperature <= 30) {
    riskLevel = 'safe';
  } else if ((data.Temperature >= 18 && data.Temperature < 22) || (data.Temperature > 30 && data.Temperature <= 35)) {
    riskLevel = 'warning';
  } else {
    riskLevel = 'critical';
  }

  const activeAlarms = riskLevel === 'critical' ? 2 : riskLevel === 'warning' ? 1 : 0;
  const healthScore = riskLevel === 'safe' ? 100 : riskLevel === 'warning' ? 65 : 0;

  const initialSpeciesList = [
    { no: 1, name: 'Yellowfin Tuna', minT: 18, maxT: 31, maxTurb: 15, maxTDS: 1200, habitat: 'Open Ocean' },
    { no: 2, name: 'Indian Mackerel', minT: 25, maxT: 32, maxTurb: 35, maxTDS: 900, habitat: 'Coastal' },
    { no: 3, name: 'Blue Marlin', minT: 22, maxT: 30, maxTurb: 10, maxTDS: 1500, habitat: 'Deep Sea' },
    { no: 4, name: 'Skipjack Tuna', minT: 20, maxT: 30, maxTurb: 20, maxTDS: 1100, habitat: 'Pelagic' },
    { no: 5, name: 'Sailfish', minT: 23, maxT: 29, maxTurb: 12, maxTDS: 1300, habitat: 'Open Ocean' },
    { no: 6, name: 'Barramundi', minT: 20, maxT: 35, maxTurb: 80, maxTDS: 2000, habitat: 'Estuarine' },
    { no: 7, name: 'Grouper (Reef)', minT: 24, maxT: 30, maxTurb: 25, maxTDS: 1000, habitat: 'Coral Reef' },
    { no: 8, name: 'Red Snapper', minT: 22, maxT: 28, maxTurb: 40, maxTDS: 1150, habitat: 'Reef/Shelf' },
    { no: 9, name: 'Milkfish', minT: 23, maxT: 33, maxTurb: 60, maxTDS: 1800, habitat: 'Coastal' },
    { no: 10, name: 'Parrotfish', minT: 25, maxT: 29, maxTurb: 8, maxTDS: 950, habitat: 'Coral Reef' },
    { no: 11, name: 'Mahi Mahi', minT: 21, maxT: 30, maxTurb: 15, maxTDS: 1250, habitat: 'Surface Ocean' },
    { no: 12, name: 'Hilsa (Ilish)', minT: 20, maxT: 30, maxTurb: 100, maxTDS: 700, habitat: 'River-Mouth' },
    { no: 13, name: 'Emperor Bream', minT: 24, maxT: 29, maxTurb: 20, maxTDS: 1050, habitat: 'Shallow Reef' },
    { no: 14, name: 'Pomfret (Silver)', minT: 22, maxT: 31, maxTurb: 45, maxTDS: 950, habitat: 'Muddy Bottoms' },
    { no: 15, name: 'Tiger Shrimp', minT: 25, maxT: 32, maxTurb: 90, maxTDS: 1600, habitat: 'Mangrove/Coastal' }
  ];

  const mappedSpeciesList = initialSpeciesList.map(sp => {
    let status = 'Safe';
    let survivalIdx = '100%';
    
    // Evaluation based strictly on Temperature to align with Arduino hardware logic
    if (data.Temperature >= sp.minT && data.Temperature <= sp.maxT) {
      status = 'Safe';
      survivalIdx = '100%';
    } else if (
      (data.Temperature >= sp.minT - 3 && data.Temperature < sp.minT) || 
      (data.Temperature > sp.maxT && data.Temperature <= sp.maxT + 4)
    ) {
      status = 'Warning';
      survivalIdx = '65%';
    } else {
      status = 'Critical';
      survivalIdx = '0%';
    }
  
    return { ...sp, status, survivalIdx };
  });

  const handleExportCSV = () => {
    const headers = ["No.,Species Name,Min Temp,Max Temp,Max Turbidity,Max TDS,Habitat Type,Current Status"];
    const rows = mappedSpeciesList.map(sp => 
      `${sp.no},${sp.name},${sp.minT}°C,${sp.maxT}°C,${sp.maxTurb} NTU,${sp.maxTDS} ppm,${sp.habitat},${sp.status}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "indian_ocean_species_status.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] p-4 lg:p-8 flex font-sans text-slate-800">
      
      {/* Outer App Window */}
      <div className="flex-1 bg-white rounded-[40px] shadow-2xl flex overflow-hidden border-[8px] border-[#0f172a]">
        
        {/* Sidebar */}
        <div className="w-[260px] border-r border-[#e2e8f0] flex flex-col p-8 bg-white hidden lg:flex rounded-l-[32px]">
          <div className="flex items-center gap-3 mb-10 text-[#0284c7]">
             <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] flex justify-center items-center">
                <svg className="w-5 h-5 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
             </div>
             <span className="font-bold text-xl tracking-tight text-[#0f172a]">AquaGuards</span>
          </div>

          <div className="flex flex-col gap-2">
             <SidebarItem 
               active={currentView === 'dashboard'} 
               onClick={() => setCurrentView('dashboard')}
               icon={<IconDashboard />} label="Dashboard" 
             />
             <SidebarItem 
               active={currentView === 'species'} 
               onClick={() => setCurrentView('species')}
               icon={<IconChecklist />} label="Species DB" 
             />
             <SidebarItem 
               active={currentView === 'report'}
               onClick={() => setCurrentView('report')}
               icon={<IconTime />} label="Reports" 
             />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* Top Navigation */}
          <div className="h-20 border-b border-[#e2e8f0] flex items-center justify-between px-10 flex-shrink-0">
             <div className="relative w-96">
                <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input className="w-full bg-[#f8fafc] border border-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-[#bfdbfe] transition" placeholder="Search anything" />
             </div>
             <div className="flex items-center gap-6">
                <span onClick={() => setCurrentView('map')} className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#0284c7] transition">Geotag Map</span>
                <span onClick={handleExportCSV} className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#0284c7] transition">Export CSV</span>
                <div className="relative">
                   <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                   {activeAlarms > 0 && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>}
                </div>
                <div className="w-9 h-9 rounded-full bg-[#bae6fd] overflow-hidden flex items-center justify-center text-[#0369a1] font-bold text-sm">
                   AQ
                </div>
             </div>
          </div>

          <div className="p-8 lg:p-10 flex-1 overflow-y-auto">
             
             {currentView === 'dashboard' && (
                <DashboardView 
                   data={data} 
                   history={history} 
                   activeAlarms={activeAlarms} 
                   healthScore={healthScore} 
                   speciesList={mappedSpeciesList} 
                />
             )}

             {currentView === 'report' && (
                <ReportView 
                   data={data} 
                   riskLevel={riskLevel}
                />
             )}

             {currentView === 'species' && (
                <SpeciesView speciesList={mappedSpeciesList} />
             )}

             {currentView === 'map' && (
                <MapView />
             )}

          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents

function DashboardView({ data, history, activeAlarms, healthScore, speciesList }) {
  const tempData = {
    labels: history.length ? history.map(h => h.time) : ['10:00', '10:05', '10:10', '10:15', '10:20'],
    datasets: [{
      label: 'Temp (°C)',
      data: history.length ? history.map(h => h.temp) : [22, 23, 22.5, 24, 23.5],
      borderColor: '#1d4ed8', backgroundColor: '#1d4ed8', tension: 0.4, borderWidth: 2, pointRadius: 2,
    }]
  };
  
  const turbData = {
    labels: history.length ? history.map(h => h.time) : ['10:00', '10:05', '10:10', '10:15', '10:20'],
    datasets: [{
      label: 'Turbidity (NTU)',
      data: history.length ? history.map(h => h.turbidity) : [10, 15, 12, 18, 14],
      borderColor: '#3b82f6', backgroundColor: '#3b82f6', tension: 0.4, borderWidth: 2, pointRadius: 2,
    }]
  };
  
  const tdsData = {
    labels: history.length ? history.map(h => h.time) : ['10:00', '10:05', '10:10', '10:15', '10:20'],
    datasets: [{
      label: 'TDS (ppm)',
      data: history.length ? history.map(h => h.tds) : [800, 900, 850, 1000, 900],
      borderColor: '#93c5fd', backgroundColor: '#93c5fd', tension: 0.4, borderWidth: 2, pointRadius: 2,
    }]
  };

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { family: "'Inter', sans-serif", size: 10 } } }
    }
  };

  let mainChartColor = '#0ea5e9'; 
  if (activeAlarms >= 2) {
     mainChartColor = '#ef4444'; 
  } else if (activeAlarms === 1) {
     mainChartColor = '#1d4ed8'; 
  }

  const doughnutData = {
    labels: ['Optimal Habitat', 'Compromised', 'Danger Zone'],
    datasets: [{
      data: [healthScore, 100 - healthScore - (activeAlarms > 2 ? 10 : 0), activeAlarms > 2 ? 10 : 0],
      backgroundColor: [mainChartColor, '#bfdbfe', '#e0f2fe'],
      borderWidth: 0,
      cutout: '78%'
    }]
  };

  return (
    <>
       <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-1">Hi, AquaGuards</h1>
            <p className="text-sm text-gray-500">This is your live environmental report so far</p>
          </div>
          <div className="flex items-center gap-3 bg-[#f8fafc] px-4 py-2 border border-[#e2e8f0] rounded-full">
             <span className="text-sm font-semibold text-gray-600">Hardware Status:</span>
             <div className={`w-3 h-3 rounded-full ${activeAlarms > 1 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : activeAlarms === 1 ? 'bg-blue-600 shadow-[0_0_8px_#2563eb]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}></div>
          </div>
       </div>

       <div className="flex flex-col xl:flex-row gap-6 mb-6">
          <div className="w-full xl:w-[35%] grid grid-cols-2 gap-4">
             <MetricCard 
               icon={<svg className="w-5 h-5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8.686 2 6 4.418 6 7.4c0 3.864 6 12 6 12s6-8.136 6-12C18 4.418 15.314 2 12 2z"/></svg>} 
               title="Real-time Temp" 
               value={`${data.Temperature}°C`} 
               sub="Water Temperature" 
               badge="Tracked" 
               status={data.Temperature > 30 ? 'critical' : 'stable'} 
             />
             <MetricCard 
               icon={<svg className="w-5 h-5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>} 
               title="Turbidity" 
               value={`${data.Turbidity}`} 
               sub="NTU Levels" 
               badge="Tracked" 
               status={data.Turbidity > 3000 ? 'critical' : 'stable'} 
             />
             <MetricCard 
               icon={<svg className="w-5 h-5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>} 
               title="TDS" 
               value={`${data.TDS}`} 
               sub="ppm/mg/L" 
               badge="Tracked" 
               status={data.TDS > 1500 ? 'critical' : 'stable'} 
             />
             <MetricCard 
               icon={<svg className="w-5 h-5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>} 
               title="Active Alarms" 
               value={activeAlarms} 
               sub="Buzzer/LED Count" 
               badge={activeAlarms > 0 ? "Triggered" : "Zero"} 
               status={activeAlarms > 0 ? 'critical' : 'stable'} 
             />
          </div>

          <div className="w-full xl:w-[65%] flex flex-col gap-3">
             <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-[20px] p-4 flex flex-col">
                 <h3 className="font-bold text-[#0f172a] text-sm mb-2 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#1d4ed8]"></div> Temperature Feed
                 </h3>
                 <div className="flex-1 w-full min-h-[70px]"><Line data={tempData} options={lineOptions} /></div>
             </div>
             <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-[20px] p-4 flex flex-col">
                 <h3 className="font-bold text-[#0f172a] text-sm mb-2 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div> Turbidity Feed
                 </h3>
                 <div className="flex-1 w-full min-h-[70px]"><Line data={turbData} options={lineOptions} /></div>
             </div>
             <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-[20px] p-4 flex flex-col">
                 <h3 className="font-bold text-[#0f172a] text-sm mb-2 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-[#93c5fd]"></div> TDS Feed
                 </h3>
                 <div className="flex-1 w-full min-h-[70px]"><Line data={tdsData} options={lineOptions} /></div>
             </div>
          </div>
       </div>

       <div className="flex flex-col xl:flex-row gap-6">
          <div className="w-full xl:w-[70%]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#0f172a] text-xl">Species Vulnerability List</h3>
                <div className="relative">
                   <input className="bg-[#f8fafc] border border-[#e2e8f0] rounded-full px-5 py-2 text-sm focus:outline-none pr-10" placeholder="Search species" />
                   <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
             </div>

             <div className="bg-white border border-[#e2e8f0] rounded-[20px] overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-[#f8fafc] text-slate-500 font-medium">
                      <tr>
                         <th className="py-4 px-6">Species Name</th>
                         <th className="py-4 px-6">Habitat</th>
                         <th className="py-4 px-6">Target Temp</th>
                         <th className="py-4 px-6">Current Status</th>
                         <th className="py-4 px-6">Survival Idx</th>
                      </tr>
                   </thead>
                   <tbody className="text-slate-800 font-semibold divide-y divide-[#f1f5f9]">
                      {speciesList.slice(0, 5).map((sp, idx) => (
                        <tr key={idx} className="hover:bg-blue-50 transition">
                           <td className="py-4 px-4">{sp.name}</td>
                           <td className="py-4 px-4 font-medium text-slate-500">{sp.habitat}</td>
                           <td className="py-4 px-4 font-medium text-slate-500">{sp.minT}-{sp.maxT}°C</td>
                           <td className="py-4 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${sp.status === 'Safe' ? 'bg-green-100 text-green-700' : sp.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                 {sp.status}
                              </span>
                           </td>
                           <td className="py-4 px-4 font-medium text-slate-500">{sp.survivalIdx}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="w-full xl:w-[30%] bg-[#f8fafc] border border-[#e2e8f0] rounded-[20px] p-6 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#0f172a] text-lg">Biodiversity Health %</h3>
                <button className="border border-gray-300 rounded-lg px-3 py-1 text-xs font-semibold text-gray-600 bg-white">All Species</button>
             </div>
             <div className="flex-1 relative flex justify-center items-center py-2">
                <div className="w-48 h-48 relative">
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '78%' }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-1">
                     <span className="text-4xl font-bold text-[#0f172a]">{healthScore}%</span>
                     <span className="text-xs font-medium text-slate-400 mt-1">Water Habitability</span>
                  </div>
                </div>
             </div>
             <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-600 px-2 justify-center">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: mainChartColor}}></div> Optimal Habitat</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#bfdbfe]"></div> Compromised</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#e0f2fe]"></div> Danger Zone</span>
             </div>
          </div>
       </div>

       <div className="mt-8 mb-4 text-center italic text-slate-500 font-medium">
          "Water and air, the two essential fluids on which all life depends, have become global garbage cans. Protect our aquatic ecosystems before it's too late."
       </div>
    </>
  );
}

function ReportView({ data, riskLevel }) {
  const handleDownloadPdf = async () => {
    const element = document.getElementById('report-content');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('AquaGuards_Report.pdf');
  };

  let reportTitle = "";
  let reportSurvival = "";
  let reportThreat = "";
  let reportDescription = "";

  if (riskLevel === 'critical') {
    reportTitle = "High Risk (Environmental Crisis)";
    reportSurvival = "Critical (0%)";
    reportThreat = "Thermal Stress and Hypoxia";
    reportDescription = "This scenario represents a critical failure of the aquatic environment. The extremely high temperature significantly reduces dissolved oxygen levels, effectively suffocating the fish, while the excessive turbidity indicates heavy siltation or industrial runoff that blocks all light penetration. Because the TDS is well above the biological limit of 1500 ppm, the osmotic pressure becomes lethal, causing internal dehydration in species like the Yellowfin Tuna. In this state, the 'model' predicts immediate mass mortality unless emergency cooling and filtration are initiated.";
  } else if (riskLevel === 'warning') {
    reportTitle = "Low Risk with Warning (Sub-Optimal Condition)";
    reportSurvival = "Moderate (65%)";
    reportThreat = "Chronic Metabolic Stress";
    reportDescription = "In this scenario, the ecosystem is under a 'Yellow Alert' status. While the parameters haven't reached lethal levels, they have drifted away from the actual ideal conditions. The temperature puts the fish in a high-metabolic state where they require more food and oxygen than the water can easily provide. While hardy species like the Indian Mackerel might survive, their growth rates will stall, and sensitive species will likely migrate to deeper, cooler waters. This represents a stressed environment that requires close monitoring to prevent a slide into a high-risk category.";
  } else {
    reportTitle = "Low Risk (Optimal Health)";
    reportSurvival = "Perfect (100%)";
    reportThreat = "None (Balanced Ecosystem)";
    reportDescription = "This data reflects the perfect harmony of a healthy Indian Ocean reef or coastal zone. The temperature is sitting exactly within the biological 'sweet spot,' allowing for maximum oxygen saturation and healthy fish metabolism. The low turbidity ensures that the water is crystal clear, allowing for natural predatory behavior and plant photosynthesis. Since the TDS is stabilized, the salinity is perfect for local species to maintain their internal salt balance without energy loss. This is the target state for your AquaGuards monitoring system.";
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-[#0f172a]">Aquatic Environment Report</h2>
        <button onClick={handleDownloadPdf} className="bg-[#0284c7] text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-[#0369a1] transition">Download PDF</button>
      </div>
      
      <div id="report-content" className="bg-white border border-[#e2e8f0] rounded-2xl p-10 shadow-sm">
         <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-extrabold text-[#0f172a]">{reportTitle}</h1>
            <span className="text-sm text-slate-500 font-bold">AquaGuards AI Log</span>
         </div>
         
         <div className="bg-[#f0f9ff] border-l-4 border-[#0284c7] p-5 my-6 rounded-r-lg">
           <h3 className="font-bold text-[#0369a1] mb-2 uppercase text-sm tracking-wider">Live Situational Data:</h3>
           <p className="text-xl text-slate-800">
             Temp: <span className="font-extrabold text-[#0284c7]">{data.Temperature}°C</span> &nbsp;|&nbsp; 
             Turbidity: <span className="font-extrabold text-[#0284c7]">{data.Turbidity} NTU</span> &nbsp;|&nbsp; 
             TDS: <span className="font-extrabold text-[#0284c7]">{data.TDS} ppm</span>
           </p>
         </div>

         <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
               <p className="text-slate-500 font-bold mb-1 uppercase text-sm">Fish Survival Prediction</p>
               <p className={`text-3xl font-extrabold ${riskLevel === 'critical' ? 'text-red-600' : riskLevel === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>{reportSurvival}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
               <p className="text-slate-500 font-bold mb-1 uppercase text-sm">Primary Threat</p>
               <p className="text-2xl font-bold text-slate-800">{reportThreat}</p>
            </div>
         </div>

         <div className="mt-8">
           <h3 className="text-xl font-bold text-[#0f172a] mb-3">Biological Assessment Summary</h3>
           <p className="text-slate-600 text-[17px] leading-relaxed">{reportDescription}</p>
         </div>
      </div>
    </div>
  );
}

function SpeciesView({ speciesList }) {
  return (
    <div className="py-6">
      <h2 className="text-3xl font-bold text-[#0f172a] mb-8">Marine Species Database - Indian Ocean</h2>
      <div className="bg-white border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm">
         <table className="w-full text-left text-sm">
           <thead className="bg-[#f8fafc] text-slate-500 font-medium">
             <tr>
               <th className="py-4 px-6 border-b">No.</th>
               <th className="py-4 px-6 border-b">Species Name</th>
               <th className="py-4 px-6 border-b">Target Temp Range</th>
               <th className="py-4 px-6 border-b">Max Turbidity</th>
               <th className="py-4 px-6 border-b">Max TDS</th>
               <th className="py-4 px-6 border-b">Habitat Type</th>
               <th className="py-4 px-6 border-b">Live Status</th>
             </tr>
           </thead>
           <tbody className="text-slate-800 font-semibold divide-y divide-[#f1f5f9]">
             {speciesList.map((sp) => (
                <tr key={sp.no} className="hover:bg-blue-50 transition">
                  <td className="py-4 px-6">{sp.no}</td>
                  <td className="py-4 px-6 font-extrabold text-[#0284c7]">{sp.name}</td>
                  <td className="py-4 px-6 text-slate-600">{sp.minT}°C - {sp.maxT}°C</td>
                  <td className="py-4 px-6 text-slate-600">{sp.maxTurb} NTU</td>
                  <td className="py-4 px-6 text-slate-600">{sp.maxTDS} ppm</td>
                  <td className="py-4 px-6 text-slate-500">{sp.habitat}</td>
                  <td className="py-4 px-6">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${sp.status === 'Safe' ? 'bg-green-100 text-green-700' : sp.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {sp.status}
                     </span>
                  </td>
                </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}

function MapView() {
  return (
    <div className="h-[80vh] flex flex-col">
      <h2 className="text-3xl font-bold text-[#0f172a] mb-6">Live Oceanic Geotag</h2>
      <div className="flex-1 rounded-[30px] overflow-hidden border border-[#e2e8f0] shadow-sm relative relative">
         <iframe 
           width="100%" 
           height="100%" 
           frameBorder="0" 
           allowFullScreen
           src="https://maps.google.com/maps?q=Indian%20Ocean&t=m&z=4&output=embed"
           title="Indian Ocean Map"
         ></iframe>
         <div className="absolute top-6 left-6 bg-white p-4 rounded-2xl shadow-lg border border-[#e2e8f0]">
            <h4 className="font-bold text-[#0f172a]">Sensor Unit 01</h4>
            <p className="text-sm text-slate-500">Indian Ocean Deployment</p>
         </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${active ? 'bg-[#0284c7] text-white shadow-md' : 'text-slate-500 hover:bg-[#f0f9ff] hover:text-[#0284c7]'}`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400'}`}>{icon}</div>
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
}

function MetricCard({ icon, title, value, sub, badge, status }) {
  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[20px] p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
         <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            {icon}
         </div>
         <div className={`px-2 py-1 flex items-center gap-1 rounded-md text-[10px] font-bold ${status === 'stable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status === 'stable' ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
            )}
            {badge}
         </div>
      </div>
      <div>
         <h2 className="text-3xl font-extrabold text-[#0f172a]">{value}</h2>
         <p className="text-sm font-semibold text-slate-500 mt-1">{title}</p>
         <p className="text-slate-400 text-xs mt-1">{sub}</p>
      </div>
    </div>
  );
}