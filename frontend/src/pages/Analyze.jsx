import { useState, useEffect } from "react";
import { Play, Trash2, Download, Upload, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import GreenScoreCard from "../components/GreenScoreCard";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analyze = () => {
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [results, setResults] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState("target");

  useEffect(() => {
    fetchDatasets();
    fetchModels();
    fetchResults();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get(`${API}/datasets/list`);
      setDatasets(response.data);
    } catch (error) {
      toast.error("Failed to fetch datasets");
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API}/models/list`);
      setModels(response.data.models);
    } catch (error) {
      console.error("Error fetching models:", error);
      // Fallback to default models
      setModels(["RandomForest", "LogisticRegression", "GradientBoosting", "MLP", "SVM", "KNN", "DecisionTree"]);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API}/results`);
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const uploadDataset = async () => {
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("target_column", targetColumn);

      const response = await axios.post(`${API}/datasets/upload?target_column=${targetColumn}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success(`Dataset uploaded: ${response.data.name}`);
      setUploadFile(null);
      setTargetColumn("target");
      await fetchDatasets();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to upload dataset");
    } finally {
      setUploading(false);
    }
  };

  const runBenchmark = async () => {
    const modelToUse = showCustomModel ? customModel : selectedModel;
    
    if (!modelToUse || !selectedDataset) {
      toast.error("Please select both model and dataset");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/models/run`, {
        model: modelToUse,
        dataset: selectedDataset
      });
      
      setLatestResult(response.data);
      toast.success(`Benchmark completed! Green Score: ${response.data.green_score}`);
      await fetchResults();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Benchmark failed");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = async () => {
    try {
      await axios.delete(`${API}/results`);
      setResults([]);
      setLatestResult(null);
      toast.success("Results cleared");
    } catch (error) {
      toast.error("Failed to clear results");
    }
  };

  const exportResults = () => {
    const csv = [
      ["Model", "Dataset", "Accuracy", "Energy (kWh)", "Carbon (kg)", "Train Time (s)", "Inference Time (s)", "Green Score"],
      ...results.map(r => [
        r.model,
        r.dataset,
        r.accuracy,
        r.energy_kWh,
        r.carbon_kg,
        r.train_time_s,
        r.inference_time_s,
        r.green_score
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "green-ai-benchmark.csv";
    a.click();
    toast.success("Results exported");
  };

  // Prepare chart data
  const scatterData = results.map(r => ({
    x: r.energy_kWh,
    y: r.accuracy * 100,
    model: r.model,
    dataset: r.dataset,
    greenScore: r.green_score
  }));

  const barData = results
    .sort((a, b) => b.green_score - a.green_score)
    .slice(0, 10)
    .map(r => ({
      name: `${r.model}`,
      score: r.green_score,
      dataset: r.dataset
    }));

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8 animate-fade-in">
          Analyze Models
        </h1>

        {/* Dataset Upload Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 shadow-sm border border-blue-200 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Custom Dataset
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-2">
                CSV File
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full"
                data-testid="file-upload"
              />
              {uploadFile && (
                <p className="text-sm text-slate-600 mt-2">Selected: {uploadFile.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="target-column" className="block text-sm font-medium text-slate-700 mb-2">
                Target Column Name
              </Label>
              <Input
                id="target-column"
                type="text"
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                placeholder="target"
                className="w-full"
                data-testid="target-column-input"
              />
            </div>
          </div>
          <Button
            onClick={uploadDataset}
            disabled={uploading || !uploadFile}
            className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            data-testid="upload-dataset-btn"
          >
            {uploading ? (
              <div className="spinner mx-auto" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Dataset
              </>
            )}
          </Button>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Run Benchmark</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
              {!showCustomModel ? (
                <div className="flex gap-2">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger data-testid="model-select" className="flex-1">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model} value={model} data-testid={`model-option-${model}`}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCustomModel(true)}
                    title="Add custom model"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="Enter model name"
                    className="flex-1"
                    data-testid="custom-model-input"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setShowCustomModel(false);
                      setCustomModel("");
                    }}
                    title="Back to list"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dataset</label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger data-testid="dataset-select">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map(dataset => (
                    <SelectItem key={dataset.name} value={dataset.name} data-testid={`dataset-option-${dataset.name}`}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-end gap-2">
              <Button
                onClick={runBenchmark}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                data-testid="run-benchmark-btn"
              >
                {loading ? (
                  <div className="spinner mx-auto" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Benchmark
                  </>
                )}
              </Button>
              {results.length > 0 && (
                <>
                  <Button
                    onClick={clearResults}
                    variant="outline"
                    data-testid="clear-results-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={exportResults}
                    variant="outline"
                    data-testid="export-results-btn"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Latest Result */}
        {latestResult && (
          <div className="mb-8 animate-fade-in">
            <GreenScoreCard
              score={latestResult.green_score}
              model={latestResult.model}
              dataset={latestResult.dataset}
            />
          </div>
        )}

        {/* Visualizations */}
        {results.length > 0 && (
          <div className="space-y-8">
            {/* Scatter Plot */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Accuracy vs Energy Consumption</h2>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Energy"
                    unit=" kWh"
                    label={{ value: "Energy (kWh)", position: "insideBottom", offset: -10 }}
                    stroke="#64748b"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Accuracy"
                    unit="%"
                    label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }}
                    stroke="#64748b"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="font-semibold text-slate-800">{data.model}</p>
                            <p className="text-sm text-slate-600">{data.dataset}</p>
                            <p className="text-sm">Accuracy: {data.y.toFixed(2)}%</p>
                            <p className="text-sm">Energy: {data.x.toFixed(4)} kWh</p>
                            <p className="text-sm font-semibold text-emerald-600">
                              Green Score: {data.greenScore.toFixed(1)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Scatter name="Models" data={scatterData} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Top 10 Models by Green Score</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    stroke="#64748b"
                  />
                  <YAxis
                    label={{ value: "Green Score", angle: -90, position: "insideLeft" }}
                    stroke="#64748b"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="font-semibold text-slate-800">{data.name}</p>
                            <p className="text-sm text-slate-600">{data.dataset}</p>
                            <p className="text-sm font-semibold text-emerald-600">
                              Score: {data.score.toFixed(1)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">All Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="results-table">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Model</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Dataset</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Accuracy</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Energy (kWh)</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Carbon (kg)</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Train Time (s)</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Green Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">{result.model}</td>
                        <td className="py-3 px-4">{result.dataset}</td>
                        <td className="py-3 px-4 text-right">{(result.accuracy * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right">{result.energy_kWh.toFixed(4)}</td>
                        <td className="py-3 px-4 text-right">{result.carbon_kg.toFixed(6)}</td>
                        <td className="py-3 px-4 text-right">{result.train_time_s.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                          {result.green_score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
            <p className="text-slate-600 text-lg">No results yet. Run your first benchmark!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyze;