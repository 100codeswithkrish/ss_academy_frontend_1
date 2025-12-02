import React, { useEffect, useState, useCallback } from "react";

export default function AttendancePage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Admin state
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [showCreateBatchForm, setShowCreateBatchForm] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Batch management state
  const [showBatchManagement, setShowBatchManagement] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState([]);
  const [managingBatch, setManagingBatch] = useState(null);
  const [addingStudents, setAddingStudents] = useState(false);

  const REAL_ADMIN_PASSWORD = "admin1234";
  const API_BASE = "https://ss-academy-backend.onrender.com";

  // Memoized fetch functions
  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/batches/list`);
      const data = await res.json();
      if (data.success) setBatches(data.batches || []);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  }, [API_BASE]);

  const fetchAllStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/students/list`);
      const data = await res.json();
      if (data.success) setAllStudents(data.students || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchBatches();
    fetchAllStudents();
  }, [fetchBatches, fetchAllStudents]);

  // Batch operations
  const openBatch = useCallback(
    async (batch) => {
      setSelectedBatch(batch);
      setReport("");
      setStudents([]);

      try {
        const res = await fetch(`${API_BASE}/batches/${batch.id}/students`);
        const data = await res.json();

        if (data.success && data.students) {
          setStudents(
            data.students.map((s) => ({
              id: s.id,
              name: s.name,
              checked: true,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch batch students:", error);
      }
    },
    [API_BASE]
  );

  // Student operations
  const toggleStudent = useCallback((id) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  }, []);

  const selectAll = useCallback((value) => {
    setStudents((prev) => prev.map((s) => ({ ...s, checked: value })));
  }, []);

  // Attendance submission
  const handleSubmitAttendance = async () => {
    if (!selectedBatch) {
      alert("Select a batch first");
      return;
    }

    setLoading(true);
    setReport("");

    const payloadStudents = students.map((s) => ({
      student_id: s.id,
      status: s.checked ? "P" : "A",
    }));

    try {
      const res = await fetch(`${API_BASE}/attendance/mark-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: selectedBatch.id,
          date,
          students: payloadStudents,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReport(data.report || "Attendance marked successfully.");
      } else {
        alert(data.error || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Attendance submission error:", error);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    alert("Copied to clipboard!");
  };

  // Admin operations
  const openCreateBatch = () => {
    setShowPasswordPopup(true);
    setAdminPasswordInput("");
    setPasswordError("");
  };

  const closePopups = () => {
    setShowPasswordPopup(false);
    setShowCreateBatchForm(false);
    setShowBatchManagement(false);
    setAdminPasswordInput("");
    setNewBatchName("");
    setPasswordError("");
    setSelectedStudentsToAdd([]);
    setManagingBatch(null);
    setAddingStudents(false);
  };

  const verifyPassword = () => {
    if (adminPasswordInput.trim() === REAL_ADMIN_PASSWORD) {
      setShowPasswordPopup(false);
      setShowCreateBatchForm(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect admin password!");
    }
  };

  const handlePasswordKeyPress = (e) => {
    if (e.key === "Enter") {
      verifyPassword();
    }
  };

  const handleBatchNameKeyPress = (e) => {
    if (e.key === "Enter") {
      createBatch();
    }
  };

  const createBatch = async () => {
    const trimmedName = newBatchName.trim();
    if (!trimmedName) {
      alert("Please enter a batch name");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/batches/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_name: trimmedName }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Batch created successfully!");
        closePopups();
        fetchBatches();
      } else {
        alert(data.error || "Error creating batch");
      }
    } catch (error) {
      console.error("Create batch error:", error);
      alert("Network error");
    }
  };

  // Batch management operations
  const openBatchManagement = (batch) => {
    setManagingBatch(batch);
    setShowBatchManagement(true);
    setSelectedStudentsToAdd([]);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentsToAdd((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllAvailableStudents = () => {
    setSelectedStudentsToAdd(availableStudents.map((student) => student.id));
  };

  const clearAllSelections = () => {
    setSelectedStudentsToAdd([]);
  };

  const addStudentsToBatch = async () => {
    if (selectedStudentsToAdd.length === 0 || !managingBatch) {
      alert("Please select at least one student to add");
      return;
    }

    setAddingStudents(true);

    try {
      // Add students one by one
      const results = [];
      for (const studentId of selectedStudentsToAdd) {
        const res = await fetch(`${API_BASE}/batches/add-student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch_id: managingBatch.id,
            student_id: studentId,
          }),
        });
        const data = await res.json();
        results.push(data);
      }

      const successfulAdds = results.filter((result) => result.success).length;

      if (successfulAdds === selectedStudentsToAdd.length) {
        alert(`Successfully added ${successfulAdds} student(s) to the batch!`);
      } else {
        alert(
          `Added ${successfulAdds} out of ${selectedStudentsToAdd.length} student(s). Some may already be in the batch.`
        );
      }

      setSelectedStudentsToAdd([]);
      // Refresh the current batch if it's the one being managed
      if (selectedBatch?.id === managingBatch.id) {
        openBatch(managingBatch);
      }
    } catch (error) {
      console.error("Add students error:", error);
      alert("Network error while adding students");
    } finally {
      setAddingStudents(false);
    }
  };

  const removeStudentFromBatch = async (studentId, studentName) => {
    if (!managingBatch || !confirm(`Remove ${studentName} from this batch?`)) {
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/batches/${managingBatch.id}/students/${studentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Student removed from batch successfully!");
        // Refresh the current batch if it's the one being managed
        if (selectedBatch?.id === managingBatch.id) {
          openBatch(managingBatch);
        }
      } else {
        alert(data.error || "Error removing student from batch");
      }
    } catch (error) {
      console.error("Remove student error:", error);
      alert("Network error");
    }
  };

  const deleteBatch = async (batch) => {
    if (
      !confirm(
        `Are you sure you want to delete "${batch.batch_name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/batches/${batch.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Batch deleted successfully!");
        setBatches((prev) => prev.filter((b) => b.id !== batch.id));
        if (selectedBatch?.id === batch.id) {
          setSelectedBatch(null);
          setStudents([]);
        }
        if (managingBatch?.id === batch.id) {
          closePopups();
        }
      } else {
        alert(data.error || "Error deleting batch");
      }
    } catch (error) {
      console.error("Delete batch error:", error);
      alert("Network error");
    }
  };

  // Derived state
  const allSelected = students.length > 0 && students.every((s) => s.checked);
  const hasStudents = students.length > 0;

  // Available students (not already in the current batch)
  const availableStudents = allStudents.filter(
    (student) => !students.some((s) => s.id === student.id)
  );

  const selectedCount = selectedStudentsToAdd.length;
  const totalAvailable = availableStudents.length;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Attendance Management
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={openCreateBatch}
              className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm md:text-base"
            >
              + Create Batch
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 md:px-3 py-1 md:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              />
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Batch List */}
          <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-800">Batches</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {batches.length}
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batches.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No batches available
                </p>
              ) : (
                batches.map((batch) => (
                  <div
                    key={batch.id}
                    className={`p-3 rounded-lg transition-colors ${
                      selectedBatch?.id === batch.id
                        ? "bg-blue-50 border-l-4 border-blue-600 text-blue-700"
                        : "bg-white border-l-4 border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => openBatch(batch)}
                      >
                        <div className="font-medium text-sm md:text-base">
                          {batch.batch_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {batch.id}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => openBatchManagement(batch)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Manage Batch"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteBatch(batch)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Batch"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Students Panel */}
          <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            {selectedBatch ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {selectedBatch.batch_name} - Students
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {students.length} student
                      {students.length !== 1 ? "s" : ""} in batch
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {hasStudents && (
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => selectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        Select All
                      </label>
                    )}
                    <button
                      onClick={() => openBatchManagement(selectedBatch)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage Batch
                    </button>
                  </div>
                </div>

                {/* Students List */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {!hasStudents ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">👥</div>
                      <p>No students in this batch</p>
                      <button
                        onClick={() => openBatchManagement(selectedBatch)}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Students
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-800 text-sm md:text-base">
                            {student.name}
                          </span>
                          <input
                            type="checkbox"
                            checked={student.checked}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleSubmitAttendance}
                    disabled={loading || !hasStudents}
                    className="flex-1 px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm text-sm md:text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Attendance"
                    )}
                  </button>
                </div>

                {/* Report Section */}
                {report && (
                  <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <h4 className="font-medium text-gray-800">
                        Attendance Report
                      </h4>
                      <button
                        onClick={copyReport}
                        className="px-3 md:px-4 py-1 md:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy Report
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-3 rounded border max-h-60 overflow-y-auto">
                      {report}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 md:py-12">
                <div className="text-gray-400 text-4xl md:text-6xl mb-4">
                  📚
                </div>
                <p className="text-gray-500 text-base md:text-lg">
                  Select a batch to view students
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Choose from the batch list to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Password Popup */}
        {showPasswordPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Admin Verification
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Please enter the admin password to create a new batch.
              </p>

              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  setPasswordError("");
                }}
                onKeyPress={handlePasswordKeyPress}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />

              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closePopups}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPassword}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Batch Form */}
        {showCreateBatchForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Create New Batch
              </h3>

              <input
                type="text"
                placeholder="Enter batch name"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                onKeyPress={handleBatchNameKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={closePopups}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createBatch}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Batch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Management Popup */}
        {showBatchManagement && managingBatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Manage Batch: {managingBatch.batch_name}
                </h3>
                <button
                  onClick={closePopups}
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

              <div className="grid md:grid-cols-2 gap-6">
                {/* Add Students Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">
                      Add Students to Batch
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllAvailableStudents}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={clearAllSelections}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {selectedCount} of {totalAvailable} students selected
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                    {availableStudents.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-2xl mb-2">✅</div>
                        <p>All students are already in this batch</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {availableStudents.map((student) => (
                          <label
                            key={student.id}
                            className="flex items-center p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudentsToAdd.includes(
                                student.id
                              )}
                              onChange={() =>
                                toggleStudentSelection(student.id)
                              }
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                            />
                            <span className="font-medium text-gray-800 flex-1">
                              {student.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={addStudentsToBatch}
                    disabled={selectedCount === 0 || addingStudents}
                    className="w-full mt-4 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingStudents ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding {selectedCount} Student
                        {selectedCount !== 1 ? "s" : ""}...
                      </span>
                    ) : (
                      `Add ${selectedCount} Student${
                        selectedCount !== 1 ? "s" : ""
                      } to Batch`
                    )}
                  </button>
                </div>

                {/* Current Students Section */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    Current Students in Batch ({students.length})
                  </h4>
                  <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                    {students.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-2xl mb-2">👥</div>
                        <p>No students in this batch yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-800">
                              {student.name}
                            </span>
                            <button
                              onClick={() =>
                                removeStudentFromBatch(student.id, student.name)
                              }
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Remove from batch"
                            >
                              <svg
                                className="w-4 h-4"
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
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closePopups}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
