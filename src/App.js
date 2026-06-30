import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 📡 APNI LIVE BACKEND ENDPOINT URL YAHAN STRIP KAREIN (e.g., https://cyber-backend.onrender.com)
const BACKEND_URL = "https://cybersentinel-backend-s4sh.onrender.com";
function App() {
  // 🔐 Authentication & Control States
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("Microsoft_Password_Reset");
  const [campaignMessage, setCampaignMessage] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(false);

  // 📊 Live Telemetry Database States
  const [stats, setStats] = useState({
    overview: { totalEmailsSent: 0, totalClicks: 0, vulnerabilityRate: "0%" },
    departmentWiseRisk: []
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔑 Admin Auth Validation Call
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setAuthError(null);
      const response = await axios.post(`${BACKEND_URL}/api/admin/login`, { username, password });
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        setToken(response.data.token);
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || "Invalid Credentials or Connection Failed.");
    }
  };

  // 🚪 Flush Token & Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setLogs([]);
  };

  // 📡 Live Synchronizer: Data Streams Sync Pipeline
  const fetchAllDashboardData = async () => {
    if (!token) return;
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/dashboard/stats`),
        axios.get(`${BACKEND_URL}/api/dashboard/logs`)
      ]);
      setStats(statsResponse.data);
      setLogs(logsResponse.data);
      setError(null);
    } catch (err) {
      console.error("Pipeline Sync Error:", err);
      setError("Backend cloud server synchronization dropped. Ports network verify karein.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Real Mail Execution Trigger Gateway
  const launchTestCampaign = async () => {
    try {
      setCampaignLoading(true);
      setCampaignMessage(null);
      const response = await axios.get(`${BACKEND_URL}/api/test-email?templateType=${selectedTemplate}`);
      if (response.data.status === "Success") {
        setCampaignMessage(`🚀 Audit Campaign successfully dispatched via ${selectedTemplate.replace(/_/g, ' ')} payload!`);
        // Force database refresh after short network buffer
        setTimeout(() => fetchAllDashboardData(), 1500);
      }
    } catch (err) {
      setCampaignMessage("❌ Production email routing dropped. Verify SMTP mail relay configurations.");
    } finally {
      setCampaignLoading(false);
      setTimeout(() => setCampaignMessage(null), 5000);
    }
  };

  // 🛰️ Real-time Polling Hook (Runs every 8 seconds when active session persists)
  useEffect(() => {
    if (token) {
      fetchAllDashboardData();
      const interval = setInterval(fetchAllDashboardData, 8000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // 🛡️ View 1: Secure Gatekeeper Portal View
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#2c3e50', fontFamily: 'Arial, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '100%', maxWidth: '380px' }}>
          <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px', marginTop: 0 }}>🛡️ CyberSentinel Portal</h2>
          
          {authError && (
            <div style={{ backgroundColor: '#fdedec', color: '#c0392b', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fadbd8', fontWeight: 'bold', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#7f8c8d', fontWeight: 'bold', fontSize: '14px' }}>Admin Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', boxSizing: 'border-box', outline: 'none' }} placeholder="Enter admin user..." />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#7f8c8d', fontWeight: 'bold', fontSize: '14px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', boxSizing: 'border-box', outline: 'none' }} placeholder="Enter secure key..." />
          </div>

          <button type="submit" style={{ width: '100%', backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            Secure Login →
          </button>
        </form>
      </div>
    );
  }

  // ⏳ Cloud Server Handshake Initialization Loader
  if (loading && !stats.overview.totalEmailsSent) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#2c3e50', fontWeight: 'bold' }}>📡 Initializing cloud telemetry matrix channels...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', color: '#c0392b', padding: '100px', fontFamily: 'Arial, sans-serif', backgroundColor: '#fdedec', minHeight: '100vh' }}>
        <h2>⚠️ Synchronization Error Detected</h2>
        <p style={{ fontWeight: 'bold' }}>{error}</p>
        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '12px 25px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Reset Connection Token</button>
      </div>
    );
  }

  // 📊 Computational Data Processing Modules
  const totalSent = stats.overview?.totalEmailsSent || 0;
  const totalClicks = stats.overview?.totalClicks || 0;
  const safeMails = Math.max(0, totalSent - totalClicks);

  const pieData = [
    { name: 'Clicked (Vulnerable)', value: totalClicks, fill: '#e74c3c' },
    { name: 'Safe (No Action)', value: safeMails, fill: '#2ecc71' }
  ];

  const barData = stats.departmentWiseRisk?.map(dept => ({
    name: dept._id || 'General',
    Clicks: dept.clickCount || 0
  })) || [];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '30px' }}>
      
      {/* Dynamic Header Ecosystem */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #ddd', paddingBottom: '15px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>🛡️ CyberSentinel Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} style={{ padding: '10px 15px', borderRadius: '5px', border: '2px solid #bdc3c7', backgroundColor: 'white', fontWeight: 'bold', color: '#2c3e50', cursor: 'pointer' }}>
            <option value="Microsoft_Password_Reset">Microsoft Password Reset ⚠️</option>
            <option value="HR_Salary_Hike">HR Appraisal Revised 📢</option>
          </select>

          <button onClick={launchTestCampaign} disabled={campaignLoading} style={{ backgroundColor: campaignLoading ? '#95a5a6' : '#e67e22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: campaignLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            {campaignLoading ? 'Sending Mail...' : '🚀 Launch Audit'}
          </button>
          
          <button onClick={handleLogout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {campaignMessage && (
        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px 20px', borderRadius: '5px', marginBottom: '20px', fontWeight: '500', border: '1px solid #c3e6cb' }}>
          {campaignMessage}
        </div>
      )}

      {/* Dynamic Metrics Cards Mapping */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '220px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #3498db' }}>
          <h3 style={{ color: '#7f8c8d', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>Total Emails Sent</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#2c3e50' }}>{totalSent}</p>
        </div>
        <div style={{ flex: '1', minWidth: '220px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #e74c3c' }}>
          <h3 style={{ color: '#7f8c8d', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>Total Clicks Triggered</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#c0392b' }}>{totalClicks}</p>
        </div>
        <div style={{ flex: '1', minWidth: '220px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #f1c40f' }}>
          <h3 style={{ color: '#7f8c8d', margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase' }}>Vulnerability Rate</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#d35400' }}>{stats.overview?.vulnerabilityRate || "0%"}</p>
        </div>
      </div>

      {/* Analytics Data Rendering Blocks */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>📈 Phishing Vulnerability Ratio</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: '1', minWidth: '350px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '15px', fontSize: '18px' }}>📊 Department Clicks Breakdown</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#7f8c8d" />
              <YAxis stroke="#7f8c8d" allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Clicks" fill="#3498db" barSize={35} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Terminal Real-Time Audit Activity Logs Feed */}
      <div style={{ backgroundColor: '#2c3e50', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#ecf0f1' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#3498db', fontSize: '20px' }}>🛰️ Live Activity Feed</h3>
        <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#1a252f', padding: '15px', borderRadius: '6px', fontFamily: 'Courier New, monospace' }}>
          {logs.length === 0 ? (
            <div style={{ color: '#95a5a6', textAlign: 'center', padding: '20px' }}>No audit session tracking records found in DB pool.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ borderBottom: '1px solid #2c3e50', padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#2ecc71', marginRight: '10px' }}>[LOG]</span>
                  <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{log.employeeId?.name || "Target Vector"}</span>
                  {log.linkClicked ? (
                    <span style={{ color: '#e74c3c', marginLeft: '10px', fontWeight: 'bold' }}>[⚠️ BREACH: CLICKED]</span>
                  ) : (
                    <span style={{ color: '#3498db', marginLeft: '10px' }}>[SENT]</span>
                  )}
                </div>
                <div style={{ color: '#95a5a6' }}>{log.campaignId?.title || "Active Campaign Audit"}</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default App;