import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { moleculeBank } from "@/components/MoleculeBank/moleculeBankData";
import { useResearchData } from "@/app/context/ResearchDataContext";
import { getMoleculeGenerationHistoryByUser } from "@/lib/actions/molecule-generation.action";
import type { MoleculeGenerationHistoryType, CompoundData } from "@/types/index";

const MOLECULE_BANK_FIELDS = [
  { key: "moleculeName", label: "Name" },
  { key: "smilesStructure", label: "SMILES" },
  { key: "molecularWeight", label: "Molecular Weight" },
  { key: "categoryUsage", label: "Category Usage" },
];
const RESEARCH_FIELDS = [
  { key: "MolecularFormula", label: "Molecular Formula" },
  { key: "MolecularWeight", label: "Molecular Weight" },
  { key: "InChIKey", label: "InChIKey" },
  { key: "CanonicalSMILES", label: "Canonical SMILES" },
  { key: "IsomericSMILES", label: "Isomeric SMILES" },
  { key: "IUPACName", label: "IUPAC Name" },
  { key: "XLogP", label: "XLogP" },
  { key: "ExactMass", label: "Exact Mass" },
  { key: "MonoisotopicMass", label: "Monoisotopic Mass" },
  { key: "TPSA", label: "TPSA" },
  { key: "Complexity", label: "Complexity" },
  { key: "Charge", label: "Charge" },
  { key: "HBondDonorCount", label: "H-Bond Donors" },
  { key: "HBondAcceptorCount", label: "H-Bond Acceptors" },
  { key: "RotatableBondCount", label: "Rotatable Bonds" },
  { key: "HeavyAtomCount", label: "Heavy Atom Count" },
];
const MODEL_FIELDS = [
  { key: "smiles", label: "SMILES" },
  { key: "numMolecules", label: "Num Molecules" },
  { key: "minSimilarity", label: "Min Similarity" },
  { key: "particles", label: "Particles" },
  { key: "iterations", label: "Iterations" },
  { key: "createdAt", label: "Created At" },
  { key: "generatedMolecules", label: "Generated Molecules" },
];

const SOURCE_OPTIONS = [
  { value: "moleculeBank", label: "Molecules Bank" },
  { value: "research", label: "Research" },
  { value: "model", label: "Model" },
];

type SourceType = "moleculeBank" | "research" | "model";

type ExportDataState =
  | { source: "moleculeBank"; data: any[]; fields: typeof MOLECULE_BANK_FIELDS }
  | { source: "research"; data: CompoundData | null; fields: typeof RESEARCH_FIELDS; cached?: boolean }
  | { source: "model"; data: MoleculeGenerationHistoryType[]; fields: typeof MODEL_FIELDS };

const ExportData: React.FC = () => {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const { compoundData } = useResearchData();

  // Auto-detect source based on route
  const detectSource = (): SourceType => {
    if (pathname.includes("molecule-bank")) return "moleculeBank";
    if (pathname.includes("research")) return "research";
    if (pathname.includes("model")) return "model";
    return "moleculeBank";
  };

  const [source, setSource] = useState<SourceType>(detectSource());
  const [dataState, setDataState] = useState<ExportDataState>({ source: "moleculeBank", data: [], fields: MOLECULE_BANK_FIELDS });
  const [selectedFields, setSelectedFields] = useState<string[]>(MOLECULE_BANK_FIELDS.map(f => f.key));
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Fetch data when source changes
  useEffect(() => {
    setError("");
    setNote("");
    if (source === "moleculeBank") {
      setDataState({ source, data: moleculeBank, fields: MOLECULE_BANK_FIELDS });
      setSelectedFields(MOLECULE_BANK_FIELDS.map(f => f.key));
    } else if (source === "research") {
      let data = compoundData;
      let cached = false;
      if (!data) {
        // Try to get from localStorage
        const cachedStr = typeof window !== "undefined" ? localStorage.getItem("lastResearchCompoundData") : null;
        if (cachedStr) {
          data = JSON.parse(cachedStr);
          cached = true;
        }
      }
      setDataState({ source, data, fields: RESEARCH_FIELDS, cached });
      setSelectedFields(RESEARCH_FIELDS.map(f => f.key));
      if (!data) {
        setError("No active research data. Search for a compound in the Research tab first.");
      } else if (cached) {
        setNote(`Exporting last searched data: ${data.CanonicalSMILES || data.IUPACName || data.MolecularFormula || "Unknown"}`);
      }
    } else if (source === "model") {
      if (sessionStatus === "loading") {
        setLoading(true);
        setError("");
        setNote("Preparing model data...");
        return;
      }
      if (!session || !session.user || !session.user.id) {
        setDataState({ source, data: [], fields: MODEL_FIELDS });
        setError("You must be logged in to export model data.");
        setNote("");
        return;
      }
      setLoading(true);
      setError("");
      setNote("Preparing model data...");
      // Debug: log token
      // @ts-ignore
      const token = session?.accessToken || session?.token || null;
      console.log("Model export: user id:", session.user.id, "token:", token);
      getMoleculeGenerationHistoryByUser(session.user.id)
        .then((history: any) => {
          setDataState({ source, data: history || [], fields: MODEL_FIELDS });
          setSelectedFields(MODEL_FIELDS.map(f => f.key));
          if (!history || history.length === 0) setError("No model data found for your account.");
          setNote("");
        })
        .catch((err) => {
          setError("Authentication expired. Refreshing...");
          setNote("");
          // Optionally: try to refresh token here
          console.log("Model export error:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [source, compoundData, session, sessionStatus]);

  // CSV generation
  const generateCSV = () => {
    if (dataState.source === "moleculeBank") {
      const header = dataState.fields.filter(f => selectedFields.includes(f.key)).map(f => f.label);
      const rows = dataState.data.map(row =>
        header.map((_, i) => row[dataState.fields[i].key]).join(",")
      );
      return [header.join(","), ...rows].join("\n");
    } else if (dataState.source === "research") {
      if (!dataState.data) return "";
      const header = dataState.fields.filter(f => selectedFields.includes(f.key)).map(f => f.label);
      const row = header.map((_, i) => (dataState.data as any)[dataState.fields[i].key]);
      return [header.join(","), row.join(",")].join("\n");
    } else if (dataState.source === "model") {
      const header = dataState.fields.filter(f => selectedFields.includes(f.key)).map(f => f.label);
      const rows = dataState.data.map(row =>
        header.map((label, i) => {
          const key = dataState.fields[i].key;
          if (key === "generatedMolecules") {
            return row.generatedMolecules?.map((mol: any) => `${mol.structure} (${mol.score})`).join(";") || "";
          }
          if (key === "createdAt") {
            return row.createdAt ? new Date(row.createdAt).toLocaleString() : "";
          }
          return row[key];
        }).join(",")
      );
      return [header.join(","), ...rows].join("\n");
    }
    return "";
  };

  // PDF preview (simple text, can be improved with jsPDF)
  const generatePDFPreview = () => {
    if (dataState.source === "moleculeBank") {
      return dataState.data.map((row: any) =>
        dataState.fields.filter(f => selectedFields.includes(f.key)).map(f => `${f.label}: ${row[f.key]}`).join("\n") + "\n---\n"
      ).join("\n");
    } else if (dataState.source === "research") {
      if (!dataState.data) return "";
      return dataState.fields.filter(f => selectedFields.includes(f.key)).map(f => `${f.label}: ${(dataState.data as any)[f.key]}`).join("\n");
    } else if (dataState.source === "model") {
      return dataState.data.map((row: any) =>
        dataState.fields.filter(f => selectedFields.includes(f.key)).map(f => {
          if (f.key === "generatedMolecules") {
            return `${f.label}: ` + (row.generatedMolecules?.map((mol: any) => `${mol.structure} (${mol.score})`).join("; ") || "");
          }
          if (f.key === "createdAt") {
            return `${f.label}: ` + (row.createdAt ? new Date(row.createdAt).toLocaleString() : "");
          }
          return `${f.label}: ${row[f.key]}`;
        }).join("\n") + "\n---\n"
      ).join("\n");
    }
    return "";
  };

  const handlePreview = () => {
    setLoading(true);
    setTimeout(() => {
      if (format === 'csv') {
        setPreview(generateCSV());
      } else {
        setPreview(generatePDFPreview());
      }
      setLoading(false);
    }, 300);
  };

  const handleExport = () => {
    if (format === 'csv') {
      const csv = generateCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${source}_data.csv`);
    } else {
      // For real PDF, use jsPDF. Here, just export as .txt for demo
      const pdfText = generatePDFPreview();
      const blob = new Blob([pdfText], { type: 'application/pdf' });
      saveAs(blob, `${source}_report.pdf`);
    }
  };

  // Handle field selection for CSV
  const handleFieldToggle = (key: string) => {
    setSelectedFields(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-md dark:border-[#121212] dark:bg-[#181818]">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">Export Data</h2>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2">
          Source:
          <select
            className="rounded border px-2 py-1"
            value={source}
            onChange={e => setSource(e.target.value as SourceType)}
          >
            {SOURCE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="format"
            value="pdf"
            checked={format === 'pdf'}
            onChange={() => setFormat('pdf')}
          />
          PDF (Report)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="format"
            value="csv"
            checked={format === 'csv'}
            onChange={() => setFormat('csv')}
          />
          CSV (Raw Data)
        </label>
        <button
          className="rounded bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark"
          onClick={handlePreview}
          disabled={loading}
        >
          {loading ? 'Generating Preview...' : 'Preview Report'}
        </button>
      </div>
      {note && <div className="mb-2 text-blue-600 text-sm">{note}</div>}
      {format === 'csv' && (
        <div className="mb-4 flex flex-wrap gap-4">
          {dataState.fields.map(f => (
            <label key={f.key} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedFields.includes(f.key)}
                onChange={() => handleFieldToggle(f.key)}
              />
              {f.label}
            </label>
          ))}
        </div>
      )}
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">Preview</h3>
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-4 text-xs text-black dark:bg-gray-900 dark:text-white">
            {preview || 'No preview yet.'}
          </pre>
        )}
      </div>
      <button
        className="rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
        onClick={handleExport}
        disabled={loading || !preview || !!error}
      >
        Download {format === 'pdf' ? 'PDF' : 'CSV'}
      </button>
    </div>
  );
};

export default ExportData; 