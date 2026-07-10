import { useEffect, useState } from "react";
import { Activity, Zap, TrendingUp, Database } from "lucide-react";
import MetricCard from "../components/MetricCard";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRuns: 0,
    avgGreenScore: 0,
    totalEnergy: 0,
    bestModel: "-"
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/results`);
      const results = response.data;

      if (results.length > 0) {
        const totalRuns = results.length;
        const avgGreenScore = results.reduce((sum, r) => sum + r.green_score, 0) / totalRuns;
        const totalEnergy = results.reduce((sum, r) => sum + r.energy_kWh, 0);
        const bestModel = results.sort((a, b) => b.green_score - a.green_score)[0].model;

        setStats({
          totalRuns,
          avgGreenScore: avgGreenScore.toFixed(1),
          totalEnergy: totalEnergy.toFixed(3),
          bestModel
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Green AI <span className="gradient-text">Benchmark</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Quantify and visualize energy-accuracy tradeoffs in machine learning models.
            Compute the unified Green Score to evaluate eco-efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard
            icon={Database}
            title="Total Runs"
            value={stats.totalRuns}
            subtitle="Benchmark executions"
            color="blue"
          />
          <MetricCard
            icon={TrendingUp}
            title="Avg Green Score"
            value={stats.avgGreenScore}
            subtitle="Eco-efficiency rating"
            color="emerald"
          />
          <MetricCard
            icon={Zap}
            title="Total Energy"
            value={`${stats.totalEnergy} kWh`}
            subtitle="Cumulative consumption"
            color="amber"
          />
          <MetricCard
            icon={Activity}
            title="Best Model"
            value={stats.bestModel}
            subtitle="Highest green score"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 card-hover">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">What is Green Score?</h3>
            <div className="space-y-3 text-slate-600">
              <p>
                The <span className="font-semibold text-emerald-600">Green Score</span> is a unified metric that evaluates
                the eco-efficiency of machine learning models.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm">
                GreenScore = Accuracy / (Energy + 0.1 × Time)
              </div>
              <p className="text-sm">
                Higher scores indicate better balance between model performance and environmental impact.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 shadow-sm border border-emerald-200 card-hover">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Key Features</h3>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Real-time energy and carbon footprint tracking</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Interactive accuracy vs. energy visualizations</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Model recommendations based on eco-efficiency</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Support for multiple datasets and model types</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;