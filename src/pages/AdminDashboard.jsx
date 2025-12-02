import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    // Navigate to login page
    navigate("/login");
  };

  const dashboardCards = [
    {
      id: 1,
      title: "Students Management",
      description: "Add, view, edit, and manage all student records",
      icon: (
        <svg
          className="w-10 h-10"
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
      ),
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      route: "/students",
    },
    {
      id: 2,
      title: "Batches & Attendance",
      description: "Create batches, manage students, and mark attendance",
      icon: (
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      route: "/attendance",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                SS Academy - Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to the administration panel
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium shadow-sm">
                Administrator Access
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardCards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(card.route)}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-200 group"
            >
              {/* Card Header with Gradient */}
              <div className={`${card.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{card.title}</h3>
                    <p className="text-blue-100 mt-1 text-sm">
                      {card.description}
                    </p>
                  </div>
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">
                    <p className="text-sm">Click to access</p>
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>Open Panel</span>
                    <svg
                      className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center">
            <div className="mr-4 p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-800">Need help?</p>
              <div className="text-sm text-gray-600 mt-1">
                <span>Contact: Krish</span>
                <a
                  href="tel:7715859191"
                  className="block hover:text-blue-600"
                  aria-label="Call Krish at 7715859191"
                >
                  7715859191
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
