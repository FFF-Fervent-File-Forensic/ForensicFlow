import React, { useState, useEffect } from "react";
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

  const isComplete = Object.values(form).every((v) => v.trim() !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 완료 버튼 눌렀을 때 해시 검증 모달 열기
  const handleCompleteClick = () => {
    if (!isComplete) {
      alert("모든 입력란을 채워주세요.");
      return;
    }
    setShowModal(true);
    setIsHashVerified(false);
    setFile(null);
  };

  // 해시 검증 성공 시
  const onHashValid = () => {
    setIsHashVerified(true);
    alert("해시 검증 성공! 분석 정보가 저장됩니다.");
    // 분석 정보 저장
    if (currentEvidence) {
      addAnalysisInfo(currentEvidence.name, form);
    }
    setShowModal(false);
    navigate("/analyze");
  };

  // 해시 검증 실패 시
  const onHashInvalid = () => {
    setIsHashVerified(false);
    alert("해시 검증 실패. 파일을 다시 확인해주세요.");
  };

  // 해시 검증 모달 내 파일 업로드 이벤트 전달
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
          <input name="location" type="text" value={form.location} onChange={handleChange} />
        </div>
        <div className={styles.labelGroup}>
          <label>분석 담당자:</label>
          <input name="analyst" type="text" value={form.analyst} onChange={handleChange} />
        </div>

        <div className={styles.labelGroup}>
          <label>분석 도구:</label>
          <input name="tool" type="text" value={form.tool} onChange={handleChange} />
        </div>
        <div className={styles.labelGroup}>
          <label>분석 항목:</label>
          <input name="item" type="text" value={form.item} onChange={handleChange} />
        </div>
      </div>

      <div className={styles.textareaGroup}>
        <label>분석 과정:</label>
        <textarea name="procedure" rows="6" value={form.procedure} onChange={handleChange}></textarea>
      </div>

      <div className={styles.textareaGroup}>
        <label>분석 결과:</label>
        <textarea name="result" rows="6" value={form.result} onChange={handleChange}></textarea>
      </div>

      <div className={styles.formButtons}>
        <button className={styles.saveButton} onClick={() => alert("임시 저장되었습니다.")}>임시 저장</button>
        <button
          className={isComplete ? styles.saveButton : styles.completeButton}
          disabled={!isComplete}
          onClick={handleCompleteClick}
        >
          완료
        </button>
      </div>

      {/* 해시 검증 모달 */}
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


    </div>
  );
}
