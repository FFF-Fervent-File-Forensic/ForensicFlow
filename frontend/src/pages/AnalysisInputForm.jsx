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
  const selectedIndex = location.state?.selectedIndex;
  const { evidenceList, setEvidenceList } = useEvidence();

  const isComplete = Object.values(form).every((v) => v.trim() !== "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (type) => {
    if (type === "complete") {
      setShowModal(true);
      return;
    }
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
    if (file.name !== "만능키.txt") {
      alert("'검증 실패.");
      return;
    }

    const updatedList = evidenceList.map((item, idx) =>
      idx === selectedIndex ? { ...item, completed: true } : item
    );
    setEvidenceList(updatedList);

    alert("검증 성공.");
    navigate("/analyze");
  };

  const handleOverlayClick = () => {
    setShowModal(false);
    setFile(null);
  };

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
          <span>{evidenceList[selectedIndex]?.name || "-"}</span>
        </div>
        <div className={styles.labelGroup}>
          <label>증거 종류:</label>
          <span>{evidenceList[selectedIndex]?.type || "-"}</span>
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
          className={isComplete ? styles.saveButton : styles.completeButton}
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
            <button className={styles.saveButton} onClick={handleUploadAndSubmit}>제출</button>
          </div>
        </div>
      )}
    </div>
  );
}
