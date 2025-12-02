import React, { useEffect, useState, useCallback } from "react";

export default function StudentPage() {
  const API_BASE = "https://ss-academy-backend.onrender.com";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feeHistory, setFeeHistory] = useState([]);
  const [feeHistoryLoading, setFeeHistoryLoading] = useState(false);

  // Add student modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    class_std: "",
    roll_no: "",
    parent_phone: "",
    address: "",
    total_fee: "",
  });

  // Update fee states
  const [editFeeId, setEditFeeId] = useState(null);
  const [newFeeAmount, setNewFeeAmount] = useState("");

  // Fee payment modal states
  const [showFeePaymentModal, setShowFeePaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newPayment, setNewPayment] = useState({
    paid_amount: "",
    paid_on: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  });

  // Fetch all students
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/students/list`);
      const data = await res.json();
      if (data.success) setStudents(data.students || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch fee history for a student
  const fetchFeeHistory = useCallback(
    async (studentId) => {
      if (!studentId) return;

      setFeeHistoryLoading(true);
      try {
        const res = await fetch(`${API_BASE}/fees/history/${studentId}`);
        const data = await res.json();
        if (data.success) setFeeHistory(data.history || []);
      } catch (err) {
        console.error("Failed to fetch fee history:", err);
        setFeeHistory([]);
      } finally {
        setFeeHistoryLoading(false);
      }
    },
    [API_BASE]
  );

  // Open fee payment modal
  const openFeePaymentModal = (student) => {
    setSelectedStudent(student);
    setNewPayment({
      paid_amount: "",
      paid_on: new Date().toISOString().slice(0, 10),
    });
    setShowFeePaymentModal(true);
    fetchFeeHistory(student.id);
  };

  // Add Student
  const addStudent = async () => {
    const payload = {
      ...newStudent,
      total_fee: Number(newStudent.total_fee) || 0,
    };

    if (!payload.name.trim()) {
      alert("Student name is required!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/students/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Student added successfully!");
        setShowAddForm(false);
        setNewStudent({
          name: "",
          class_std: "",
          roll_no: "",
          parent_phone: "",
          address: "",
          total_fee: "",
        });
        fetchStudents();
      } else {
        alert(data.error || "Failed to add student");
      }
    } catch (err) {
      alert("Network error!");
    } finally {
      setLoading(false);
    }
  };

  // Update Fee
  const updateFee = async (id) => {
    if (!newFeeAmount.trim()) {
      alert("Please enter new total fee amount");
      return;
    }

    const amount = Number(newFeeAmount);
    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid fee amount");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/students/update-fee/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_fee: amount }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Fee updated successfully!");
        setEditFeeId(null);
        setNewFeeAmount("");
        fetchStudents();
      } else {
        alert(data.error || "Failed to update fee");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  // Add Fee Payment
  const addFeePayment = async () => {
    if (!selectedStudent) return;
    if (!newPayment.paid_amount.trim()) {
      alert("Please enter payment amount");
      return;
    }

    const amount = Number(newPayment.paid_amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    // Check if payment exceeds remaining fee
    const remainingFee = selectedStudent.remaining_fee;
    if (amount > remainingFee) {
      alert(`Payment cannot exceed remaining fee of ₹${remainingFee}`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/fees/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          paid_amount: amount,
          paid_on: newPayment.paid_on,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Payment added successfully!");
        setShowFeePaymentModal(false);
        setSelectedStudent(null);
        setNewPayment({
          paid_amount: "",
          paid_on: new Date().toISOString().slice(0, 10),
        });
        fetchStudents();
      } else {
        alert(data.error || "Failed to add payment");
      }
    } catch (err) {
      alert("Network error!");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calculate fee summary
  const calculateFeeSummary = () => {
    if (!selectedStudent) return { paid: 0, remaining: 0 };

    const totalPaid = feeHistory.reduce(
      (sum, payment) => sum + Number(payment.paid_amount),
      0
    );
    const remaining = Number(selectedStudent.total_fee) - totalPaid;

    return { paid: totalPaid, remaining };
  };

  const feeSummary = calculateFeeSummary();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Students Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Manage student records and fee payments
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Student
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 md:p-4 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="p-3 md:p-4 text-left text-sm font-medium text-gray-700">
                    Class
                  </th>
                  <th className="p-3 md:p-4 text-left text-sm font-medium text-gray-700">
                    Roll No
                  </th>
                  <th className="p-3 md:p-4 text-left text-sm font-medium text-gray-700">
                    Parent Phone
                  </th>
                  <th className="p-3 md:p-4 text-left text-sm font-medium text-gray-700">
                    Fee Status
                  </th>
                  <th className="p-3 md:p-4 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.281.021-.563.043-.844.064A23.91 23.91 0 0111.99 4c-2.196 0-4.238.106-6.157.308A48.408 48.408 0 003 5.005c-.22.02-.44.04-.66.062m0 0a48.44 48.44 0 013.27 7.837c.141.302.218.625.218.955 0 .328-.077.653-.218.955a48.439 48.439 0 01-3.27 7.837m13.5 0a48.44 48.44 0 00-3.27-7.837c-.142-.302-.218-.625-.218-.955 0-.328.076-.653.218-.955a48.44 48.44 0 013.27-7.837m0 0a48.409 48.409 0 016.157-.308 23.91 23.91 0 0010.844 3.064M12 4.354a4 4 0 100 5.292M15 21H9v-1a6 6 0 0112 0v1z"
                          />
                        </svg>
                        <p>No students found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Add your first student to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 md:p-4">
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.address}
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.class_std || "N/A"}
                        </span>
                      </td>
                      <td className="p-3 md:p-4 text-gray-700">
                        {student.roll_no || "N/A"}
                      </td>
                      <td className="p-3 md:p-4">
                        <a
                          href={`tel:${student.parent_phone}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {student.parent_phone || "N/A"}
                        </a>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Total:
                            </span>
                            <span className="font-medium">
                              ₹{student.total_fee || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600">
                              Paid:
                            </span>
                            <span className="font-medium text-green-600">
                              ₹{student.paid_fee || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-red-600">
                              Remaining:
                            </span>
                            <span className="font-medium text-red-600">
                              ₹{student.remaining_fee || 0}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex flex-col md:flex-row gap-2">
                          {editFeeId === student.id ? (
                            <div className="flex flex-col md:flex-row gap-2">
                              <input
                                type="number"
                                placeholder="New Total Fee"
                                value={newFeeAmount}
                                onChange={(e) =>
                                  setNewFeeAmount(e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-32"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateFee(student.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditFeeId(null)}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditFeeId(student.id);
                                  setNewFeeAmount(student.total_fee);
                                }}
                                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                Edit Fee
                              </button>
                              <button
                                onClick={() => openFeePaymentModal(student)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                Manage Payment
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Add New Student
            </h3>

            <div className="space-y-4">
              {[
                { key: "name", label: "Full Name", type: "text" },
                { key: "class_std", label: "Class", type: "text" },
                { key: "roll_no", label: "Roll Number", type: "text" },
                { key: "parent_phone", label: "Parent Phone", type: "tel" },
                { key: "address", label: "Address", type: "text" },
                { key: "total_fee", label: "Total Fee (₹)", type: "number" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    value={newStudent[field.key]}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        [field.key]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={addStudent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  "Add Student"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Payment Modal */}
      {showFeePaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Fee Management: {selectedStudent.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Class: {selectedStudent.class_std} | Roll No:{" "}
                    {selectedStudent.roll_no}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowFeePaymentModal(false);
                    setSelectedStudent(null);
                    setFeeHistory([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Left Column: Add Payment */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  Add New Payment
                </h4>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Fee</p>
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{selectedStudent.total_fee}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Total Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{feeSummary.paid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-red-600">Remaining</p>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{feeSummary.remaining}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Completion</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedStudent.total_fee > 0
                          ? `${Math.round(
                              (feeSummary.paid / selectedStudent.total_fee) *
                                100
                            )}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={newPayment.paid_amount}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          paid_amount: e.target.value,
                        })
                      }
                      placeholder="Enter payment amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={newPayment.paid_on}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          paid_on: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    disabled={loading || !newPayment.paid_amount}
                    onClick={addFeePayment}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Processing..." : "Record Payment"}
                  </button>
                </div>
              </div>

              {/* Right Column: Payment History */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  Payment History
                </h4>

                {feeHistoryLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : feeHistory.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500">No payment history found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Record the first payment above
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Date
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Amount
                          </th>
                          <th className="p-3 text-left text-sm font-medium text-gray-700">
                            Remaining
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {feeHistory.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="p-3 text-sm text-gray-700">
                              {formatDate(payment.paid_on)}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ₹{payment.paid_amount}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              ₹{payment.remaining_amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
