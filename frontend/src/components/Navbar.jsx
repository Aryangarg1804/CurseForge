import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Settings, Terminal, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Hide navbar on dashboard
  if (location.pathname === "/dashboard") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-400/20 group-hover:scale-105 transition-all duration-200">
              <Terminal className="w-5 h-5 text-white group-hover:text-cyan-400 transition-colors" />
            </div>
            <span className="text-base font-bold text-white tracking-tight hidden sm:block" style={{ fontFamily: "'Sora', sans-serif" }}>
              CourseForge <span className="text-white/60">AI</span>
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">

            {user && (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* <ThemeToggle /> */}

            {!user ? (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:shadow-lg hover:shadow-cyan-400/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Forging
              </Link>
            ) : (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold text-sm hover:shadow-lg hover:shadow-cyan-400/25 hover:scale-105 transition-all duration-200"
                >
                  {getUserInitials(user.name)}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 rounded-xl py-2 z-50 border border-white/10 bg-black/95 backdrop-blur-2xl shadow-2xl"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
                      </div>
                      {/* <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                        <User className="w-4 h-4" /> 
                        <span>Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" /> 
                        <span>Settings</span>
                      </button> */}
                      <div className="border-t border-white/10 my-1.5" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl"
            >
              <div className="py-4 space-y-1">
                {[
                  (user ? [{ to: "/dashboard", label: "Dashboard" }] : []),
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg mx-2 transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
                {!user ? (
                  <div className="px-2 pb-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-center font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-lg shadow-md hover:shadow-lg hover:shadow-cyan-400/25 transition-all"
                    >
                      Start Forging
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-3 border-t border-white/10 mt-2 mx-2 rounded-lg bg-white/5">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
                    </div>
                    {/* <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg mx-2 transition-all">
                      <User className="w-4 h-4" /> 
                      <span>Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg mx-2 transition-all">
                      <Settings className="w-4 h-4" /> 
                      <span>Settings</span>
                    </button> */}
                    <div className="px-2 pb-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm text-red-400 border border-red-400/30 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
