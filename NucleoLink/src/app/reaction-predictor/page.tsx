"use client";
import React, { useState } from "react";
import { moleculeBank } from "@/components/MoleculeBank/moleculeBankData";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Helper for molecule autocomplete
const getMoleculeOptions = () =>
  moleculeBank.map((mol) => ({
    label: mol.moleculeName,
    value: mol.smilesStructure,
    ...mol,
  }));

const classicReactions = [
  { label: "Grignard", value: "grignard" },
  { label: "Diels-Alder", value: "diels-alder" },
  { label: "Aldol", value: "aldol" },
  { label: "Friedel-Crafts", value: "friedel-crafts" },
];

const mockPredictReaction = async (reactants, useClassic, classicType) => {
  
  await new Promise((r) => setTimeout(r, 1000));
  if (!reactants || reactants.length < 2) throw new Error("Select at least 2 reactants");
  if (useClassic && classicType) {
    return {
      products: [
        {
          name: classicType.charAt(0).toUpperCase() + classicType.slice(1) + " Product",
          smiles: "C1=CC=CC=C1",
          confidence: 0.7,
          conditions: "Classic conditions for " + classicType,
        },
      ],
      pathway: [reactants],
      classic: true,
    };
  }
  // Mock ML prediction
  return {
    products: [
      {
        name: "Predicted Product",
        smiles: "CCO",
        confidence: 0.85,
        conditions: "Solvent: EtOH, Temp: 25°C, Catalyst: None",
      },
    ],
    pathway: [reactants],
    classic: false,
  };
};

const ReactionPredictor = () => {
  const [reactants, setReactants] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [useClassic, setUseClassic] = useState(false);
  const [classicType, setClassicType] = useState(classicReactions[0].value);

  const moleculeOptions = getMoleculeOptions();

  const handleAddReactant = (mol) => {
    if (!mol || reactants.find((r) => r.value === mol.value)) return;
    setReactants([...reactants, mol]);
    setInputValue("");
  };

  const handleRemoveReactant = (idx) => {
    setReactants(reactants.filter((_, i) => i !== idx));
  };

  const handlePredict = async () => {
    setError("");
    setLoading(true);
    setPrediction(null);
    try {
      const result = await mockPredictReaction(
        reactants,
        useClassic,
        useClassic ? classicType : null
      );
      setPrediction(result);
      setHistory([{ reactants, result, date: new Date() }, ...history]);
    } catch (e) {
      setError(e.message || "Prediction failed. Retry or check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePathway = () => {
    // TODO: Integrate with Research tab/app state/backend
    alert("Pathway saved to Research (mock)");
  };

  const handleExport = () => {
    // Export as CSV or PDF (mock)
    alert("Exported results (mock)");
  };

  // Recursive prediction for pathway exploration
  const handleRecursivePredict = (product) => {
    setReactants([product]);
    setPrediction(null);
    setError("");
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Panel: Reactant Selection */}
        <div className="w-full md:w-1/2 bg-white dark:bg-[#181818] rounded-lg p-6 border border-stroke shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Select Reactants</h2>
          <div className="mb-4">
            <input
              className="w-full rounded border px-3 py-2 mb-2"
              placeholder="Search molecule name..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              list="molecule-options"
            />
            <datalist id="molecule-options">
              {moleculeOptions
                .filter((opt) =>
                  opt.label.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((opt) => (
                  <option key={opt.value} value={opt.label} />
                ))}
            </datalist>
            <button
              className="mt-2 rounded bg-primary px-4 py-2 text-white font-semibold"
              onClick={() => {
                const found = moleculeOptions.find(
                  (opt) =>
                    opt.label.toLowerCase() === inputValue.toLowerCase() ||
                    opt.value === inputValue
                );
                if (found) handleAddReactant(found);
                else setError("Molecule not found in bank.");
              }}
              disabled={!inputValue}
            >
              Add Reactant
            </button>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-black dark:text-white">Selected Reactants:</h4>
            <ul className="flex flex-wrap gap-2">
              {reactants.map((r, idx) => (
                <li key={r.value} className="bg-gray-200 dark:bg-gray-700 rounded px-3 py-1 flex items-center">
                  {r.label}
                  <button
                    className="ml-2 text-red-600"
                    onClick={() => handleRemoveReactant(idx)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useClassic}
                onChange={() => setUseClassic((v) => !v)}
              />
              Simulate classic organic reaction
            </label>
            {useClassic && (
              <select
                className="rounded border px-2 py-1"
                value={classicType}
                onChange={(e) => setClassicType(e.target.value)}
              >
                {classicReactions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            )}
          </div>
          <button
            className="rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
            onClick={handlePredict}
            disabled={loading || reactants.length < 2}
          >
            {loading ? "Predicting..." : "Predict Reaction"}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </div>

        {/* Right Panel: Prediction Results */}
        <div className="w-full md:w-1/2 bg-white dark:bg-[#181818] rounded-lg p-6 border border-stroke shadow-md">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Predicted Outcomes</h2>
          {prediction ? (
            <div>
              <h4 className="font-semibold mb-2 text-black dark:text-white">Products:</h4>
              <ul className="mb-4">
                {prediction.products.map((prod, idx) => (
                  <li key={idx} className="mb-2 p-2 rounded bg-gray-100 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{prod.name}</span>
                      <span className="text-xs text-gray-500">({prod.smiles})</span>
                      <span className="ml-auto text-green-700 font-semibold">{Math.round(prod.confidence * 100)}% likely</span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{prod.conditions}</div>
                    <button
                      className="mt-2 text-blue-600 underline text-xs"
                      onClick={() => handleRecursivePredict(prod)}
                    >
                      Predict further reactions
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <button
                  className="rounded bg-primary px-4 py-2 text-white font-semibold"
                  onClick={handleSavePathway}
                >
                  Save Pathway
                </button>
                <button
                  className="rounded bg-primary px-4 py-2 text-white font-semibold"
                  onClick={handleExport}
                >
                  Export Results
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No prediction yet. Select reactants and click Predict Reaction.</div>
          )}
        </div>
      </div>

      {/* Reaction History Section */}
      <div className="mt-8 bg-white dark:bg-[#181818] rounded-lg p-6 border border-stroke shadow-md">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Reaction History</h2>
        {history.length === 0 ? (
          <div className="text-gray-500">No past predictions yet.</div>
        ) : (
          <ul className="space-y-2">
            {history.map((h, idx) => (
              <li key={idx} className="p-3 rounded bg-gray-100 dark:bg-gray-800">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-semibold">Reactants:</span>
                  {h.reactants.map((r) => r.label).join(", ")}
                  <span className="ml-4 text-xs text-gray-500">{h.date.toLocaleString()}</span>
                </div>
                <div className="mt-1">
                  <span className="font-semibold">Products:</span> {h.result.products.map((p) => p.name).join(", ")}
                </div>
                <div className="mt-1 text-xs text-gray-500">{h.result.classic ? "Classic Reaction" : "ML Prediction"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ReactionPredictor; 