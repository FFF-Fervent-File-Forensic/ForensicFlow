import React, { createContext, useContext, useState } from "react";

const EvidenceContext = createContext();

export const EvidenceProvider = ({ children }) => {
  const [caseInfo, setCaseInfo] = useState(null);
  const [evidenceInfo, setEvidenceInfo] = useState([]);
  const [transferInfo, setTransferInfo] = useState({});
  const [analysisInfo, setAnalysisInfo] = useState({}); 

  const addCaseInfo = (info) => setCaseInfo(info);

  const addEvidence = (evidence) => {
    setEvidenceInfo((prev) => [...prev, evidence]);
  };

  const addTransferInfo = (name, info) => {
    setTransferInfo((prev) => ({
      ...prev,
      [name]: info,
    }));
  };

  const addAnalysisInfo = (name, info) => {
    setAnalysisInfo((prev) => ({
      ...prev,
      [name]: info,
    }));
  };

  return (
    <EvidenceContext.Provider
      value={{
        caseInfo,
        evidenceInfo,
        transferInfo,
        analysisInfo,
        addCaseInfo,
        addEvidence,
        addTransferInfo,
        addAnalysisInfo,
      }}
    >
      {children}
    </EvidenceContext.Provider>
  );
};

export const useEvidence = () => useContext(EvidenceContext);
