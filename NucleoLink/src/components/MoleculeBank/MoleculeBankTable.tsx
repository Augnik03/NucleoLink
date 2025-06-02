"use client";
import React, { useState, useEffect } from "react";
import MoleculeStructure from "../MoleculeStructure/index";
import { moleculeBank } from "./moleculeBankData";

const TableOne = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMolecules, setFilteredMolecules] = useState(moleculeBank);

  useEffect(() => {
    const filteredData = moleculeBank.filter((molecule) =>
      molecule.moleculeName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredMolecules(filteredData);
  }, [searchQuery]);

  return (
    <div className="rounded-lg border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-[#181818] dark:bg-[#181818] sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Molecules
      </h4>

      <input
        type="search"
        placeholder="Search molecule"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border-gray-300 text-gray-700 placeholder-gray-400 dark:border-gray-600 dark:placeholder-gray-500 text-md mb-4 w-full rounded-lg border bg-white px-4 py-3 shadow-sm outline-none focus:border-primary focus:ring-primary dark:bg-[#181818] dark:text-white"
      />
      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-lg bg-gray-2 dark:bg-[#121212] sm:grid-cols-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Molecule name
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Smile Structure Image
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Molecular Weights (g/mol)
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Category Usage
            </h5>
          </div>
        </div>

        {filteredMolecules.map((molecule, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-4 ${
              key === filteredMolecules.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">
                {molecule.moleculeName}
              </p>
            </div>

            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <MoleculeStructure
                  id={`${key}`}
                  structure={molecule.smilesStructure}
                />
              </div>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">
                {molecule.molecularWeight}
              </p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">
                {molecule.categoryUsage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;