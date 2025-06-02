import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { CompoundData } from "@/types/index";

interface ResearchDataContextType {
  compoundData: CompoundData | null;
  setCompoundData: (data: CompoundData | null) => void;
}

const ResearchDataContext = createContext<ResearchDataContextType | undefined>(undefined);

export const ResearchDataProvider = ({ children }: { children: ReactNode }) => {
  const [compoundData, setCompoundDataState] = useState<CompoundData | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("lastResearchCompoundData");
    if (cached) {
      setCompoundDataState(JSON.parse(cached));
    }
  }, []);

  // Save to localStorage on change
  const setCompoundData = (data: CompoundData | null) => {
    setCompoundDataState(data);
    if (data) {
      localStorage.setItem("lastResearchCompoundData", JSON.stringify(data));
    } else {
      localStorage.removeItem("lastResearchCompoundData");
    }
  };

  return (
    <ResearchDataContext.Provider value={{ compoundData, setCompoundData }}>
      {children}
    </ResearchDataContext.Provider>
  );
};

export const useResearchData = () => {
  const context = useContext(ResearchDataContext);
  if (!context) throw new Error("useResearchData must be used within a ResearchDataProvider");
  return context;
}; 