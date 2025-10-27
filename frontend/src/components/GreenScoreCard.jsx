import { motion } from "framer-motion";
import { Award, TrendingUp } from "lucide-react";

const GreenScoreCard = ({ score, model, dataset }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 shadow-lg border border-emerald-200"
      data-testid="green-score-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-3 rounded-xl">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Green Score</h3>
            <p className="text-sm text-slate-600">{model} on {dataset}</p>
          </div>
        </div>
        <TrendingUp className="w-5 h-5 text-emerald-600" />
      </div>

      <div className="text-center mb-4">
        <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`} data-testid="green-score-value">
          {score.toFixed(1)}
        </div>
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${getScoreColor(score)} bg-opacity-10`}>
          <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </span>
        </div>
      </div>

      <div className="bg-white/60 rounded-xl p-4">
        <p className="text-xs text-slate-600 text-center">
          Green Score = Accuracy / (Energy + 0.1 × Time)
        </p>
      </div>
    </motion.div>
  );
};

export default GreenScoreCard;