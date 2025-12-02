import React, { useEffect, useState } from "react";

export default function AttendanceHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(
          "https://ss-academy-backend.onrender.com/attendance/student-history"
        );
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        } else {
          setError("Failed to fetch attendance data");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching data from server");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading attendance history...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );

  const studentIds = Object.keys(students);

  if (studentIds.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700 text-lg">No attendance records found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Student Attendance History
      </h1>

      {studentIds.map((studentId) => {
        const student = students[studentId];
        return (
          <div
            key={studentId}
            className="bg-white shadow rounded-lg mb-6 p-4 border border-gray-200"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              {student.student_name}
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Batch</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Marked By</th>
                </tr>
              </thead>
              <tbody>
                {student.attendance.map((record, index) => (
                  <tr
                    key={index}
                    className={
                      record.status === "P"
                        ? "bg-green-50"
                        : record.status === "A"
                        ? "bg-red-50"
                        : ""
                    }
                  >
                    <td className="p-2 border">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">{record.batch_name}</td>
                    <td className="p-2 border font-semibold">
                      {record.status === "P" ? "Present" : "Absent"}
                    </td>
                    <td className="p-2 border">{record.marked_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
