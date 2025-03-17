import { useState } from "react";
import { FaTachometerAlt, FaBriefcase, FaHandsHelping, FaUsers, FaChartBar, FaEnvelope, FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import CampaignManagement from "./CampaignManagement";
import ReportManagement from "./ReportManagement";
import "../styles/CompanyDashboardPage.css";

const CompanyDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Added state for sidebar

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "campaigns", label: "Campaigns", icon: <FaBriefcase /> },
    { id: "ngos", label: "NGOs", icon: <FaHandsHelping /> },
    { id: "team", label: "Team Members", icon: <FaUsers /> },
    { id: "reports", label: "Reports", icon: <FaChartBar /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <h2 className="text-xl font-bold">Company Dashboard Overview</h2>;
      case "campaigns":
        return <CampaignManagement />;
      case "reports":
        return <ReportManagement />;
      case "ngos":
        return <h2 className="text-xl font-bold">NGO Management</h2>;
      case "messages":
        return <h2 className="text-xl font-bold">Messages</h2>;
      default:
        return <h2 className="text-xl font-bold">Company Dashboard Overview</h2>;
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
              className={`flex items-center p-3 rounded cursor-pointer hover:bg-gray-700 ${selectedTab === item.id ? "bg-gray-700" : ""}`}
              onClick={() => setSelectedTab(item.id)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`p-10 w-full bg-gray-100 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>{renderContent()}</main>
    </div>
  );
};

export default CompanyDashboard;
