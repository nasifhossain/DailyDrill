import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar({ loginPage }) {
  const navigate = useNavigate();
  const loginStatus = localStorage.getItem("username");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md shadow-md bg-white/90 border-b border-gray-300">
      <div className="w-full flex justify-between items-center px-4 py-3 md:px-10">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-3xl font-bold text-indigo-700 font-serif cursor-pointer"
        >
          Problemzz
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex text-gray-700 font-medium gap-6 text-base">
          <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
          <Link to="/solved" className="hover:text-indigo-600 transition">Solved</Link>
          <Link to="/topics" className="hover:text-indigo-600 transition">Topics</Link>
          <Link to="/daily" className="hover:text-indigo-600 transition">Daily</Link>
          <Link to="/leaderboard" className="hover:text-indigo-600 transition">Leaderboard</Link>
        </nav>

        {/* Auth Controls */}
        <div className="hidden sm:flex items-center gap-4">
          {loginStatus ? (
            <div
              className="relative text-purple-800 cursor-pointer text-base"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="py-1.5 px-4 rounded-md bg-indigo-100 border font-semibold hover:bg-indigo-200 transition">
                {loginStatus} ▼
              </button>
              <div
                className={`absolute right-0 ${
                  dropdownOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                } -mt-1 bg-white shadow-lg border rounded-md py-2 z-20 transition-opacity duration-150 min-w-[150px]`}
              >
                <Link
                  to={`/myAccount/${loginStatus}`}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-indigo-100 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            !loginPage && (
              <Link
                to="/login"
                className="text-indigo-700 border border-indigo-400 px-4 py-1.5 rounded font-semibold hover:bg-indigo-600 hover:text-white transition text-sm"
              >
                Login
              </Link>
            )
          )}
        </div>

        {/* Mobile Buttons */}
        <div className="flex sm:hidden gap-3 items-center">
          <button
            onClick={() => navigate("/daily")}
            className="text-indigo-600 border border-indigo-300 px-3 py-1 rounded text-sm font-medium hover:bg-indigo-200 transition"
          >
            Daily
          </button>
          <button
            className="text-indigo-500 text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="fixed top-0 right-0 w-3/4 max-w-xs h-screen bg-white border-l shadow-xl z-50 px-6 py-6 flex flex-col gap-6 text-base font-medium">
          <div className="flex justify-end">
            <button
              className="text-2xl text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/solved" onClick={() => setMenuOpen(false)}>Solved</Link>
          <Link to="/topics" onClick={() => setMenuOpen(false)}>Topics</Link>
          <Link to="/daily" onClick={() => setMenuOpen(false)}>Daily</Link>
          <Link to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>

          {loginStatus ? (
            <>
              <Link
                to={`/myAccount/${loginStatus}`}
                onClick={() => setMenuOpen(false)}
                className="text-indigo-700 font-semibold"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-red-600 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-indigo-700 font-semibold"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
