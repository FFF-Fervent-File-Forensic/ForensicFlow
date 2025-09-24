import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEvidence } from "../contexts/EvidenceContext";
import styles from "../styles/AnalysisInputForm.module.css";

import HashVerifierFooter from '../components/HashVerifierFooter';

export default function AnalysisInputForm() {
  const [form, setForm] = useState({
    location: "",
    analyst: "",
    tool: "",
    item: "",
    procedure: "",
    result: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [isHashVerified, setIsHashVerified] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReportUploaded, setIsReportUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const evidenceNameFromState = location.state?.evidenceName;
  const { evidenceInfo, addAnalysisInfo } = useEvidence();
  const [currentEvidence, setCurrentEvidence] = useState(null);

  useEffect(() => {
    if (evidenceNameFromState && evidenceInfo) {
      const foundEvidence = evidenceInfo.find(ev => ev.name === evidenceNameFromState);
      setCurrentEvidence(foundEvidence);
    }
  }, [evidenceNameFromState, evidenceInfo]);

  const isComplete = isReportUploaded
    ? form.analyst.trim() !== ""
    : Object.values(form).every((v) => v.trim() !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isReportUploaded && name !== "analyst") {
        return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCompleteClick = () => {
    if (!isComplete) {
      console.log("모든 입력란을 채워주세요.");
      return;
    }
    setShowModal(true);
    setIsHashVerified(false);
    setFile(null);
  };

  const onHashValid = () => {
    setIsHashVerified(true);
    console.log("해시 검증 성공! 분석 정보가 저장됩니다.");
    if (currentEvidence) {
      addAnalysisInfo(currentEvidence.name, form);
    }
    setShowModal(false);
    navigate("/analyze");
  };

  const onHashInvalid = () => {
    setIsHashVerified(false);
    console.log("해시 검증 실패. 파일을 다시 확인해주세요.");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0]) {
      handleReportUpload();
    }
  };
  
  const handleReportUploadClick = () => {
    if (!isReportUploaded) {
        setShowReportModal(true);
        setFile(null);
    }
  };

  const handleReportUpload = () => {
      if (file) {
          console.log(`보고서 파일 업로드: ${file.name}`);
          setIsReportUploaded(true);
          console.log("보고서 업로드가 완료되었습니다. 분석 담당자 외 입력이 비활성화됩니다.");
          setShowReportModal(false);
      } else {
          console.log("업로드할 파일을 선택해주세요.");
      }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleTextClick = () => {
    if (!isReportUploaded && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };


  if (!currentEvidence && evidenceNameFromState) {
    return <div>Loading evidence data or invalid evidence selected...</div>;
  }
  if (!evidenceNameFromState) {
    return <div>No evidence selected. Please go back to the analyze page.</div>;
  }

  return (
    <div className={styles.inputFormContainer}>
      <div className={styles.inputGrid}>
        <div className={styles.labelGroup}>
          <label>분석 대상:</label>
          <span>{currentEvidence?.name || "-"}</span>
        </div>
        <div className={styles.labelGroup}>
          <label>증거 종류:</label>
          <span>{currentEvidence?.type || "-"}</span>
        </div>

        <div className={styles.labelGroup}>
          <label>분석 장소:</label>
          <input name="location" type="text" value={form.location} onChange={handleChange} disabled={isReportUploaded} />
        </div>
        <div className={styles.labelGroup}>
          <label>분석 담당자:</label>
          <input name="analyst" type="text" value={form.analyst} onChange={handleChange} />
        </div>

        <div className={styles.labelGroup}>
          <label>분석 도구:</label>
          <input name="tool" type="text" value={form.tool} onChange={handleChange} disabled={isReportUploaded} />
        </div>
        <div className={styles.labelGroup}>
          <label>분석 항목:</label>
          <input name="item" type="text" value={form.item} onChange={handleChange} disabled={isReportUploaded} />
        </div>
      </div>

      <div className={styles.textareaGroup}>
        <label>분석 과정:</label>
        <textarea name="procedure" rows="6" value={form.procedure} onChange={handleChange} disabled={isReportUploaded}></textarea>
      </div>

      <div className={styles.textareaGroup}>
        <label>분석 결과:</label>
        <textarea name="result" rows="6" value={form.result} onChange={handleChange} disabled={isReportUploaded}></textarea>
      </div>

      <div className={styles.formButtons}>
        <div className={styles.leftButtons}>
          <button 
            className={isReportUploaded ? styles.reportButtonDisabled : styles.reportButton} 
            onClick={handleReportUploadClick} 
            disabled={isReportUploaded}
          >
            외부 결과물 업로드
          </button>
        </div>
        <div className={styles.rightButtons}>
          <button className={styles.saveButton} onClick={() => console.log("임시 저장되었습니다.")}>
            임시 저장
          </button>
          <button
            className={isComplete ? styles.saveButton : styles.completeButton}
            disabled={!isComplete}
            onClick={handleCompleteClick}
          >
            완료
          </button>
        </div>
      </div>

      {showModal && (
        <div className={styles.hashModalOverlay}>
          <div className={styles.hashModalBackdrop} />
          <div className={styles.hashModalContent}>
            <p className={styles.uploadTitle}>해시 검증</p>
            <HashVerifierFooter
              storedHash={currentEvidence?.hash || ""}
              onValid={onHashValid}
              onInvalid={onHashInvalid}
              disabled={false}
            />
            <div className={styles.formButtonsHashModal}>
              <button onClick={() => setShowModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className={styles.hashModalOverlay}>
            <div className={styles.hashModalBackdrop} />
            <div className={styles.hashModalContent}>
                <p className={styles.uploadTitle}>결과 보고서 업로드</p>
                <div 
                    className={styles.uploadContainer}
                    onClick={handleTextClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{ cursor: isReportUploaded ? 'not-allowed' : 'pointer' }}
                >
                    <input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        disabled={isReportUploaded}
                    />
                    <p style={{ color: '#0066ff' }}>
                        {file ? file.name : "파일을 업로드하거나 여기로 드래그 앤 드롭하세요."}
                    </p>
                </div>
                <div className={styles.formButtonsHashModal}>
                    <button onClick={handleReportUpload} disabled={!file}>업로드</button>
                    <button onClick={() => setShowReportModal(false)}>취소</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
