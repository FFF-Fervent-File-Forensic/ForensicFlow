import React, { createContext, useContext, useState } from "react";

const EvidenceContext = createContext();

export function EvidenceProvider({ children }) {
  const [evidenceList, setEvidenceList] = useState([
    // { name: 'CASE001_USB01_E01.img', type: 'USB', date: '2025/05/10', completed: false },
    // { name: 'CASE001_USB01_E02.img', type: 'USB', date: '2025/05/11', completed: false },
  ]);

  return (
    <EvidenceContext.Provider value={{ evidenceList, setEvidenceList }}>
      {children}
    </EvidenceContext.Provider>
  );
}

export function useEvidence() {
  return useContext(EvidenceContext);
}
