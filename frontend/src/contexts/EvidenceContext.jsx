import React, { createContext, useContext, useState } from "react";

const EvidenceContext = createContext();

export const EvidenceProvider = ({ children }) => {
  // // 기존 코드
  // const [caseInfo, setCaseInfo] = useState(null);
  // const [evidenceInfo, setEvidenceInfo] = useState([]);

  // ReportPage.jsx에서 사용할 임시 데이터입니다. ReportPage.jsx 수정 후 삭제해도 됩니다
  const initialCaseInfo = {
    사건번호: "DF-2025-0413-002",
    접수일자: "2025/06/05",
    분석일자: "2025/06/05",
    수집장소: "충남대학교, 대전광역시 유성구 대학로 99",
    사건개요: "2025년 5월 30일, 피해자 도민준은 피의자 홍길동으로부터 이메일을 통해 수신한 실행 파일을 열람한 직후, 자신의 컴퓨터에서 비정상적인 동작이 발생하고 계좌에서 총 5,000,000원이 인출되었다는 사실을 인지하였다. 피해자는 즉시 관할 경찰서에 신고하였으며, 이에 따라 피의자의 노트북을 포함한 관련 디지털 증거들이 확보되었다."
  };

  const initialEvidenceInfo = [
    {
      name: "CASE001_USB01_E01.img",
      hash: "eab35828c6f2e12ff",
      size: "32GB",
      manager: "김수사",
      user: "홍길동",
      type: "USB",
      manufacturer: "Samsung",
      model: "BAR Plus",
      collectionLocation: "대전교통공사",
      storageLocation: "디지털포렌식실",
      serialNumber: "SN123456",
      manufacturingDate: "2024-01-01",
      collectionDate: "2025-05-30",
      analysisLocation: "대전교통공사",
      analysisManager: "김수사",
      analysisTool: "디지털 포렌식 도구 1",
      analysisItems: "USB",
      analysisProcess: "분석 과정 1",
      analysisResult: "분석 결과 1"
    },
    {
      name: "CASE001_USB01_E02.img",
      hash: "eab33631232e12ff",
      size: "128GB",
      manager: "박수사",
      user: "홍길순",
      type: "HDD",
      manufacturer: "Samsung",
      model: "BAR Plus",
      collectionLocation: "대전교통공사",
      storageLocation: "디지털포렌식실",
      serialNumber: "SN234567",
      manufacturingDate: "2024-01-03",
      collectionDate: "2025-05-30",
      analysisLocation: "대전교통공사",
      analysisManager: "박수사",
      analysisTool: "디지털 포렌식 도구 2",
      analysisItems: "HDD",
      analysisProcess: "분석 과정 2",
      analysisResult: "분석 결과 2"
    },
  ];

  const [caseInfo, setCaseInfo] = useState(initialCaseInfo);
  const [evidenceInfo, setEvidenceInfo] = useState(initialEvidenceInfo);

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
