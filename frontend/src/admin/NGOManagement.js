import React, { useState, useEffect } from "react";
import axios from "axios";

const NGOManagement = () => {
  const [ngos, setNgos] = useState([]); // State to store the fetched NGOs
  const [allNgos, setAllNgos] = useState([]); // State to store all NGOs (for resetting search)
  const [loading, setLoading] = useState(true); // Loading state
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering NGOs

  // Fetch NGOs when the component mounts
  useEffect(() => {
    fetchNgos();
  }, []);

  // Function to fetch NGOs from the backend
  const fetchNgos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const response = await axios.get("/api/admin/ngos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched NGOs:", response.data); // Debugging log
      setNgos(response.data); // Set the fetched NGOs
      setAllNgos(response.data); // Set the list of all NGOs for search purposes
    } catch (error) {
      console.error("Error fetching NGOs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle the search logic
  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setNgos(allNgos); // Reset NGOs list if search term is empty
    } else {
      const filteredNgos = allNgos.filter((ngo) =>
        ngo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) // Filter NGOs by name
      );
      setNgos(filteredNgos); // Update the displayed NGOs
    }
  };

  // Handle change in search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term state
  };

  return (
    <div>
      <h1>NGO Management</h1>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by NGO name"
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyPress={(e) => e.key === "Enter" && handleSearch()} // Trigger search on Enter key
      />

      {/* Add NGO Button */}
      <button onClick={() => console.log("Open Add NGO Form")}>Add NGO</button>

      {loading ? (
        <p>Loading NGOs...</p>
      ) : (
        <div>
          {/* NGOs Table/List */}
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ngos.length > 0 ? (
                ngos.map((ngo) => (
                  <tr key={ngo._id}>
                    <td>{ngo.fullName}</td>
                    <td>{ngo.email}</td>
                    <td>{ngo.phoneNumber}</td>
                    <td>
                      {/* Add edit/delete functionality as needed */}
                      <button>Edit</button>
                      <button>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No NGOs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NGOManagement;
