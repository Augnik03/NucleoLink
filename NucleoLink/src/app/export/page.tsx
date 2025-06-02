"use client";
import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ExportData from "@/components/ExportData/ExportData";
import type { MoleculeGenerationHistoryType } from "@/types/index";
import { ResearchDataProvider } from "@/app/context/ResearchDataContext";

// TODO: Replace with real data fetching from API or state
const dummyData: MoleculeGenerationHistoryType[] = [
  {
    smiles: "CCO",
    numMolecules: 5,
    minSimilarity: 0.7,
    particles: 10,
    iterations: 20,
    generatedMolecules: [
      { structure: "CCO", score: 0.85 },
      { structure: "CCN", score: 0.82 },
    ],
    createdAt: new Date(),
  },
];

const ExportPage = () => {
  return (
    <ResearchDataProvider>
      <DefaultLayout>
        <ExportData />
      </DefaultLayout>
    </ResearchDataProvider>
  );
};

export default ExportPage; 