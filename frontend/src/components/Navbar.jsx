import { Link, useLocation } from "react-router-dom";
import { Leaf } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-xl group-hover:shadow-lg transition-all duration-300">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Green AI Benchmark
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            <Link
              to="/"
              data-testid="nav-dashboard"
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/analyze"
              data-testid="nav-analyze"
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive("/analyze")
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Analyze
            </Link>
            <Link
              to="/recommendations"
              data-testid="nav-recommendations"
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive("/recommendations")
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Recommendations
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;