import React from "react";
import { useNavigate } from "react-router-dom";
import { useEvidence } from "../contexts/EvidenceContext";
import styles from "../styles/Analyze.module.css";

export default function Analyze() {
  const { evidenceInfo, analysisInfo } = useEvidence();
  const navigate = useNavigate();

  const handleClick = (evidenceName) => {
    navigate("/Analyzeinput", { state: { evidenceName: evidenceName } });
  };

  const allCompleted = evidenceInfo.every(item => analysisInfo && analysisInfo[item.name]);

  return (
    <div className={styles.analysisContainer}>
      <table className={styles.analysisTable}>
        <thead>
          <tr>
            <th className={styles.alignLeft}>이름</th>
            {/* "담당자" 열은 이제 분석 담당자를 의미합니다. */}
            <th className={styles.alignCenter}>담당자</th>
            <th className={styles.alignCenter}>수집 일시</th>
            <th className={styles.alignCenter}>입력 완료</th>
          </tr>
        </thead>
        <tbody>
          {evidenceInfo.map((item) => ( // idx가 필요 없으면 제거 가능
            <tr key={item.name}>
              <td className={styles.alignLeft}>
                <div className={styles.fileRow}>
                  <span>{item.name}</span>
                  {!(analysisInfo && analysisInfo[item.name]) && (
                    <button className={styles.inputButton} onClick={() => handleClick(item.name)}>
                      입력
                    </button>
                  )}
                </div>
              </td>
              <td className={styles.alignCenter}>
                {analysisInfo && analysisInfo[item.name] && analysisInfo[item.name].analyst
                  ? analysisInfo[item.name].analyst
                  : "-"}
              </td>
              <td className={styles.alignCenter}>{item.date}</td>
              <td className={`${styles.alignCenter} ${styles.checkCell}`}>{analysisInfo && analysisInfo[item.name] ? "✔" : ""}</td>
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