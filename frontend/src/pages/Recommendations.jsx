import { useEffect, useState } from "react";
import { Award, Zap, TrendingUp, CheckCircle } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${API}/results/recommendations`);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 60) return "from-blue-500 to-cyan-600";
    if (score >= 40) return "from-amber-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  const getRankBadge = (index) => {
    const badges = [
      { bg: "bg-amber-100", text: "text-amber-700", icon: "🥇", label: "1st" },
      { bg: "bg-slate-100", text: "text-slate-700", icon: "🥈", label: "2nd" },
      { bg: "bg-orange-100", text: "text-orange-700", icon: "🥉", label: "3rd" },
      { bg: "bg-blue-100", text: "text-blue-700", icon: "④", label: "4th" },
      { bg: "bg-purple-100", text: "text-purple-700", icon: "⑤", label: "5th" }
    ];
    return badges[index] || badges[4];
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Eco-Efficient <span className="gradient-text">Recommendations</span>
          </h1>
          <p className="text-lg text-slate-600">
            Top models ranked by Green Score for optimal energy-accuracy balance
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg mb-2">No recommendations available yet</p>
            <p className="text-slate-500 text-sm">Run some benchmarks to see recommendations</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec, index) => {
              const badge = getRankBadge(index);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 card-hover"
                  data-testid={`recommendation-card-${index}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6 flex-1">
                      <div className={`${badge.bg} ${badge.text} w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0`}>
                        {badge.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-slate-800">
                            {rec.model}
                          </h3>
                          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {rec.dataset}
                          </span>
                        </div>

                        <p className="text-slate-600 mb-4">{rec.reason}</p>

                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm text-slate-700">
                              <span className="font-semibold">Accuracy:</span> {(rec.accuracy * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-amber-600" />
                            <span className="text-sm text-slate-700">
                              <span className="font-semibold">Energy:</span> {rec.energy_kWh.toFixed(4)} kWh
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-6">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-600 mb-1">Green Score</p>
                        <div className={`bg-gradient-to-r ${getScoreColor(rec.green_score)} bg-clip-text text-transparent`}>
                          <p className="text-4xl font-bold" data-testid={`recommendation-score-${index}`}>
                            {rec.green_score.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-200">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-500 p-3 rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Why Green Score Matters</h3>
              <p className="text-slate-700 mb-3">
                Models with high Green Scores deliver strong performance while minimizing environmental impact.
                Choosing eco-efficient models helps reduce carbon emissions and operational costs.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Lower energy consumption reduces electricity costs and carbon footprint</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Faster training times enable quicker iteration and deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span>Balanced performance ensures accuracy isn't sacrificed for efficiency</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;