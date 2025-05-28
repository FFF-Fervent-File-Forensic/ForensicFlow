import React, { useState, useEffect } from "react";
import axios from "axios";
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
    sendForm("임시저장");
  };

  const sendForm = (status) => {
    const payload = { ...form, status };
    axios.post("/api/analysis-submit", payload)
      .then(() => {
        alert(status === "완료" ? "완료되었습니다." : "임시 저장되었습니다.");
        setShowModal(false);
      })
      .catch((error) => {
        console.error("제출 실패:", error);
        alert("제출 중 오류가 발생했습니다.");
      });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndSubmit = () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }
    sendForm("완료");
  };

  return (
    <div className={styles.inputFormContainer}>
      <div className={`${styles.blurOverlay} ${showModal ? styles.active : ""}`}></div>

      <div className={styles.inputGrid}>
        <div className={styles.labelGroup}>
          <label>분석 대상:</label>
          <span>CASE001_USB01_E01.img</span>
        </div>
        <div className={styles.labelGroup}>
          <label>증거 종류:</label>
          <span>image file</span>
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
        <div className={`${styles.modalBox} ${styles.centered}`}>
          <h3 className={styles.modalTitle}>해시 검증</h3>
          <div className={styles.modalUpload}>
            <label className={styles.uploadArea}>
              <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              파일을 업로드하세요.
            </label>
          </div>
          <div className={styles.formButtons} style={{ justifyContent: 'center', marginTop: '20px' }}>
            <button className={styles.saveButton} onClick={handleUploadAndSubmit}>제출</button>
          </div>
        </div>
      )}
    </div>
  );
}