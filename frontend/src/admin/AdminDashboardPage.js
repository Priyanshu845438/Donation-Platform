import { useState } from "react";
import { FaTachometerAlt, FaUsers, FaBuilding, FaBriefcase, FaEnvelope, FaChartBar, FaCog, FaSignOutAlt, FaBars, FaHandsHelping } from "react-icons/fa";
import NGOManagement from "./NGOManagement"; // Import the NGOManagement component
import "../styles/admindashboard.css";

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to toggle sidebar visibility

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "campaigns", label: "Campaigns", icon: <FaBriefcase /> },
    { id: "ngos", label: "NGOs", icon: <FaHandsHelping /> },
    { id: "team", label: "Team Members", icon: <FaUsers /> },
    { id: "companies", label: "Companies", icon: <FaBuilding /> },
    { id: "reports", label: "Reports", icon: <FaChartBar /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <h2 className="text-xl font-bold">Dashboard Overview</h2>;
      case "campaigns":
        return <h2 className="text-xl font-bold">Campaigns Management</h2>;
      case "ngos":
        return <NGOManagement />; // Render the NGOManagement component when "NGOs" is selected
      case "team":
        return <h2 className="text-xl font-bold">Team Management</h2>;
      case "companies":
        return <h2 className="text-xl font-bold">Company Management</h2>;
      case "reports":
        return <h2 className="text-xl font-bold">Reports and Analytics</h2>;
      case "messages":
        return <h2 className="text-xl font-bold">Messages Inbox</h2>;
      case "settings":
        return <h2 className="text-xl font-bold">Settings Panel</h2>;
      default:
        return <h2 className="text-xl font-bold">Dashboard Overview</h2>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {/* Hamburger Icon */}
          <button className="hamburger-icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
        </div>
        <nav>
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${selectedTab === item.id ? "active" : ""}`}
              onClick={() => setSelectedTab(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {isSidebarOpen && item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${!isSidebarOpen ? "expanded" : ""}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
