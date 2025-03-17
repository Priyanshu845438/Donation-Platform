import { useState, useEffect } from "react";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Fetch reports from backend (example API call)
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reports</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Report Name</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td className="px-4 py-2">{report.name}</td>
              <td className="px-4 py-2">{report.date}</td>
              <td className="px-4 py-2">
                <button className="bg-blue-500 text-white p-2 rounded">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportManagement;
