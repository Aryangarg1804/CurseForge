import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MessageSquare, ChevronLeft, ChevronRight, Search, Terminal,
  User, LogOut, Settings, Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const DashboardSidebar = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  searchQuery,
  setSearchQuery,
  courses,
  selectedCourse,
  onSelectCourse,
  onNewCourse,
  onDeleteCourse,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

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

  const filteredCourses = courses.filter((c) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Logo/Branding with Collapse Button */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between group">
        {!sidebarCollapsed ? (
          <>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-semibold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                CourseForge <span className="text-white/60">AI</span>
              </span>
            </Link>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center w-full relative">
            <Link to="/" className="flex items-center justify-center">
              <Terminal className="w-5 h-5 text-white transition-all" />
            </Link>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              className="absolute right-0 p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* New Course Button */}
      <div className="p-3">
        <button 
          onClick={onNewCourse} 
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>New Course</span>}
        </button>
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search courses..." 
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all" 
            />
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredCourses.map((course) => {
          const isActive = selectedCourse?.id === course.id;
          // Calculate progress: support both old and new format
          const totalLessons = course.totalLessons || course.lessons?.length || 0;
          const completedLessons = course.completedLessons || 0;
          const progress = course.progress || 0;
          const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : progress;
          return (
            <div
              key={course.id}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <button
                onClick={() => onSelectCourse(course)}
                className="flex-1 min-w-0 flex items-center gap-3 px-1.5 py-1.5 text-left"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{course.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">{pct}% complete</div>
                  </div>
                )}
              </button>
              {!sidebarCollapsed && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteCourse(course.id);
                  }}
                  className="p-1.5 rounded-md text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  aria-label={`Delete ${course.title}`}
                  title="Delete course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* User Avatar & Menu */}
      <div className="border-t border-white/5">
        {!sidebarCollapsed && user && (
          <div className="relative p-3" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-all w-full"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials(user.name)}
              </div>
            </button>
            
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-2 right-2 mb-2 rounded-xl py-1 z-50 border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl"
                >
                  <div className="px-3 py-2.5 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
                  </div>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                    <User className="w-4 h-4" /> 
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" /> 
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-white/10 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> 
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {sidebarCollapsed && user && (
          <div className="p-3 flex justify-center">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm hover:bg-white/20 transition-all"
            >
              {getUserInitials(user.name)}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardSidebar;
