//frontend\src\pages\AnalysisInputForm.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEvidence } from "../contexts/EvidenceContext";
import styles from "../styles/AnalysisInputForm.module.css";

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
  const navigate = useNavigate();
  const location = useLocation();

  // 수정: selectedIndex 대신 evidenceName을 받음
  const evidenceNameFromState = location.state?.evidenceName;

  // 수정: evidenceInfo와 addAnalysisInfo를 context에서 가져옴
  const { evidenceInfo, addAnalysisInfo } = useEvidence();

  // 수정: evidenceName을 사용하여 현재 증거 정보를 찾음
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (type) => {
    if (type === "complete") {
      if (!isComplete) return; // 모든 필드가 채워지지 않으면 모달을 띄우지 않음
      setShowModal(true);
      return;
    }
    // 임시 저장 기능은 그대로 유지
    alert("임시 저장되었습니다.");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndSubmit = () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }
    // 기존 해시 검증 로직 유지 (만능키.txt)
    if (file.name !== "만능키.txt") {
      alert("검증 실패.");
      // 실패 시 모달을 닫거나 사용자에게 다른 액션을 안내할 수 있습니다.
      // 여기서는 간단히 alert 후 리턴합니다.
      // setShowModal(false); // 필요에 따라 모달을 닫을 수 있습니다.
      // setFile(null);
      return;
    }

    // 해시 검증 성공 시
    alert("검증 성공.");

    // 수정: addAnalysisInfo를 호출하여 분석 정보를 context에 저장
    if (currentEvidence) {
      addAnalysisInfo(currentEvidence.name, form);
    }

    setShowModal(false); // 모달 닫기
    setFile(null); // 파일 상태 초기화
    navigate("/analyze"); // Analyze 페이지로 이동
  };

  const handleOverlayClick = () => {
    setShowModal(false);
    setFile(null);
  };

  if (!currentEvidence && evidenceNameFromState) {
    // currentEvidence를 찾는 중이거나, 유효하지 않은 evidenceName일 경우 로딩 또는 에러 처리
    return <div>Loading evidence data or invalid evidence selected...</div>;
  }
  if (!evidenceNameFromState) {
      return <div>No evidence selected. Please go back to the analyze page.</div>
  }


  return (
    <div className={styles.inputFormContainer}>
      {showModal && (
        <div
          className={styles.blurOverlay + ' ' + styles.active}
          onClick={handleOverlayClick}
        ></div>
      )}

      <div className={styles.inputGrid}>
        <div className={styles.labelGroup}>
          <label>분석 대상:</label>
          {/* 수정: currentEvidence에서 이름 표시 */}
          <span>{currentEvidence?.name || "-"}</span>
        </div>
        <div className={styles.labelGroup}>
          <label>증거 종류:</label>
          {/* 수정: currentEvidence에서 종류 표시 */}
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
        <button className={styles.saveButton} onClick={() => handleSubmit("save")}>임시 저장</button>
        <button
          className={isComplete ? styles.saveButton : styles.completeButton} // 스타일은 유지하되, saveButton과 completeButton 클래스명이 동일한 효과를 내도록 CSS 확인 필요
          disabled={!isComplete}
          onClick={() => handleSubmit("complete")}
        >
          완료
        </button>
      </div>

      {showModal && (
        <div className={`${styles.modalBox} ${styles.centered}`} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.modalTitle}>해시 검증</h3>
          <div className={styles.modalUpload}>
            <label className={styles.uploadArea}>
              <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              파일을 업로드하세요.
            </label>
            {file && <p className={styles.fileName}>업로드한 파일: {file.name}</p>}
          </div>
          <div className={styles.formButtons} style={{ justifyContent: 'center', marginTop: '20px' }}>
            <button className={styles.saveButton} onClick={handleUploadAndSubmit} disabled={!file}>제출</button>
          </div>
        </div>
      )}
    </div>
  );
}