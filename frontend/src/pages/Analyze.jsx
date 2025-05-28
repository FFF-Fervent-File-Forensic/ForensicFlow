import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEvidence } from "../contexts/EvidenceContext";
import styles from "../styles/Analyze.module.css";

export default function Analyze() {
  const { evidenceList } = useEvidence();
  const navigate = useNavigate();

  const handleClick = (index) => {
    navigate("/Analyzeinput", { state: { selectedIndex: index } });
  };

  const allCompleted = evidenceList.every(item => item.completed);

  return (
    <div className={styles.analysisContainer}>
      <table className={styles.analysisTable}>
        <thead>
          <tr>
            <th className={styles.alignLeft}>이름</th>
            <th className={styles.alignCenter}>담당자</th>
            <th className={styles.alignCenter}>수집 일시</th>
            <th className={styles.alignCenter}>입력 완료</th>
          </tr>
        </thead>
        <tbody>
          {evidenceList.map((item, idx) => (
            <tr key={idx}>
              <td className={styles.alignLeft}>
                <div className={styles.fileRow}>
                  <span>{item.name}</span>
                  <button className={styles.inputButton} onClick={() => handleClick(idx)}>
                    입력
                  </button>
                </div>
              </td>
              <td className={styles.alignCenter}>{item.owner}</td>
              <td className={styles.alignCenter}>{item.date}</td>
              <td className={`${styles.alignCenter} ${styles.checkCell}`}>{item.completed ? "✔" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.footer}>
        <button
          className={`${styles.nextButton} ${allCompleted ? styles.enabled : styles.disabled}`}
          disabled={!allCompleted}
          onClick={() => navigate("/ReportPage")}
        >
          다음단계
        </button>
      </div>
    </div>
  );
}