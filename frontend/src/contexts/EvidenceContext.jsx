import React, { createContext, useContext, useState, useEffect } from "react";

const EvidenceContext = createContext();

export const EvidenceProvider = ({ children }) => {
  // 로컬 스토리지에서 초기 데이터 로드
  const [caseInfo, setCaseInfo] = useState(() => {
    const savedCaseInfo = localStorage.getItem('caseInfo');
    return savedCaseInfo ? JSON.parse(savedCaseInfo) : null;
  });
  
  const [evidenceInfo, setEvidenceInfo] = useState(() => {
    const savedEvidenceInfo = localStorage.getItem('evidenceInfo');
    return savedEvidenceInfo ? JSON.parse(savedEvidenceInfo) : [];
  });

  const [transferInfo, setTransferInfo] = useState(() => {
    const savedTransferInfo = localStorage.getItem('transferInfo');
    return savedTransferInfo ? JSON.parse(savedTransferInfo) : {};
  });

  const [analysisInfo, setAnalysisInfo] = useState(() => {
    const savedAnalysisInfo = localStorage.getItem('analysisInfo');
    return savedAnalysisInfo ? JSON.parse(savedAnalysisInfo) : {};
  });

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('caseInfo', JSON.stringify(caseInfo));
  }, [caseInfo]);

  useEffect(() => {
    localStorage.setItem('evidenceInfo', JSON.stringify(evidenceInfo));
  }, [evidenceInfo]);

  useEffect(() => {
    localStorage.setItem('transferInfo', JSON.stringify(transferInfo));
  }, [transferInfo]);

  useEffect(() => {
    localStorage.setItem('analysisInfo', JSON.stringify(analysisInfo));
  }, [analysisInfo]);

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
