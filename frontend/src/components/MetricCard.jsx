import { motion } from "framer-motion";

const MetricCard = ({ icon: Icon, title, value, subtitle, color = "emerald" }) => {
  const colorClasses = {
    emerald: "from-emerald-500 to-green-600",
    blue: "from-blue-500 to-cyan-600",
    purple: "from-violet-500 to-purple-600",
    amber: "from-amber-500 to-orange-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 card-hover"
      data-testid={`metric-card-${title.toLowerCase().replace(/ /g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mb-1" data-testid={`metric-value-${title.toLowerCase().replace(/ /g, '-')}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-3 rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;