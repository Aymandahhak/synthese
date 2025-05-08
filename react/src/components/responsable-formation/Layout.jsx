import React from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { BarChart, Calendar, CheckSquare, FileText, Home, ListChecks, LogOut, UserX } from "lucide-react"

// Import common Header component
import Header from "../common/Header"

// Import the original styles from the xresponsablefromation project
import "../../styles/responsable-formation-original.css";

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  // Adjust path logic for relative paths within /responsable-formation
  const basePath = "/responsable-formation"; // Define the base path
  let relativePath = location.pathname.startsWith(basePath + "/") 
                     ? location.pathname.substring(basePath.length + 1) 
                     : (location.pathname === basePath ? "dashboard" : "");
  const currentPath = relativePath || "dashboard";

  return (
    <>
      {/* Common Header */}
      <Header />
      
      <div className="responsable-formation-profile flex min-h-screen bg-[#fcfdfd] pt-24">
        {/* Sidebar */}
        <aside className="w-64 border-r px-6 py-8">
          <div className="mb-8 flex justify-center">
            <div className="h-10 w-10 rounded-full bg-[#e0e5ce] flex items-center justify-center">
              <span className="text-[#415444] font-bold">TS</span>
            </div>
          </div>
          <nav className="space-y-6">
          <button
            onClick={() => navigate(".")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
              currentPath === "dashboard" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Home className="h-5 w-5" />
            Dashboard
          </button>
          <button
            onClick={() => navigate("./planifier")}
            className={`flex w-full items-center gap-3 px-3 py-2 transition-colors ${
              currentPath === "planifier" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Calendar className="h-5 w-5" />
            Planifier Session
          </button>
          <button
            onClick={() => navigate("./sessions")}
            className={`flex w-full items-center gap-3 px-3 py-2 transition-colors ${
              currentPath === "sessions" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ListChecks className="h-5 w-5" />
            Liste Sessions
          </button>
          <button
            onClick={() => navigate("./validation")}
            className={`flex w-full items-center gap-3 px-3 py-2 transition-colors ${
              currentPath === "validation" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            Validation
          </button>
          <button
            onClick={() => navigate("./absences")}
            className={`flex w-full items-center gap-3 px-3 py-2 transition-colors ${
              currentPath === "absences" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <UserX className="h-5 w-5" />
            Absences
          </button>
          <button
            onClick={() => navigate("./documents")}
            className={`flex w-full items-center gap-3 px-3 py-2 transition-colors ${
              currentPath === "documents" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileText className="h-5 w-5" />
            Documents
          </button>
          <button
            onClick={() => navigate("./logistics")}
            className={`flex w-full items-center gap-3 px-3 py-2 transition-colors ${
              currentPath === "logistics" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Home className="h-5 w-5" />
            Hébergements
          </button>
          <button
            onClick={() => navigate("./rapports")}
            className={`flex w-full items-center gap-3 px-3 py-2 transition-colors ${
              currentPath === "rapports" ? "bg-[#e0e5ce] text-[#415444]" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart className="h-5 w-5" />
            Rapports
          </button>
          <button className="flex w-full items-center gap-3 px-3 py-2 text-red-500 transition-colors hover:text-red-600">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-8 py-8">
        <div className="space-y-1 mb-8">
          <h2 className="text-2xl font-semibold">
            Tableau de Bord
          </h2>
          <p className="text-gray-500">Gestion des formations</p>
        </div>

        <Outlet />
      </main>
    </div>
    </>
  )
}

export default Layout