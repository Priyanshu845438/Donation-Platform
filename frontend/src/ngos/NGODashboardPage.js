import { useState } from "react";
import { FaTachometerAlt, FaBriefcase, FaBuilding, FaUsers, FaChartBar, FaEnvelope, FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import "../styles/CompanyDashboardPage.css";

const NGODashboard = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "campaigns", label: "Campaigns", icon: <FaBriefcase /> },
    { id: "companies", label: "Companies", icon: <FaBuilding /> },
    { id: "team", label: "Team Members", icon: <FaUsers /> },
    { id: "reports", label: "Reports", icon: <FaChartBar /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
    { id: "logout", label: "Logout", icon: <FaSignOutAlt /> },
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case "dashboard":
        return <h2 className="text-xl font-bold">NGO Dashboard Overview</h2>;
      case "campaigns":
        return <h2 className="text-xl font-bold">Campaign Management</h2>;
      case "companies":
        return <h2 className="text-xl font-bold">Company Management</h2>;
      case "team":
        return <h2 className="text-xl font-bold">Team Members</h2>;
      case "reports":
        return <h2 className="text-xl font-bold">Reports</h2>;
      case "messages":
        return <h2 className="text-xl font-bold">Messages</h2>;
      default:
        return <h2 className="text-xl font-bold">NGO Dashboard Overview</h2>;
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
              {isSidebarOpen && item.label} {/* Show label only when sidebar is open */}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`p-10 w-full bg-gray-100 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>{renderContent()}</main>
    </div>
  );
};

export default NGODashboard;
