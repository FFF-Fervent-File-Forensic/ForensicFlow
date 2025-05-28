import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/AnalysisStepTable.module.css";

export default function AnalysisStepTable() {
//  const [data, setData] = useState([]);
const data = [{
    "name": "CASE001_USB01_E01.img",
    "owner": "임윤수",
    "collectedAt": "2025.05.15",
    "completed": true
  }]
 
//  useEffect(() => {
//    // 예시 URL입니다. 실제 API 엔드포인트에 맞게 변경하세요.
//    axios.get("/api/analysis-items")
//      .then((response) => {
//        setData(response.data);
//      })
//      .catch((error) => {
//        console.error("데이터 로딩 오류:", error);
//      });
//  }, []);
  const navigate = useNavigate();


  const handleClick = () => {
    navigate("/Analyzeinput");
  };

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
          {data.map((item, idx) => (<tr key={idx}>
              <td className={styles.alignLeft}>
                <div className={styles.fileRow}>
                  <span>{item.name}</span>
                  <button className={styles.inputButton} onClick={handleClick}>
                    입력
                  </button>
                </div>
              </td>
              <td className={styles.alignCenter}>{item.owner}</td>
              <td className={styles.alignCenter}>{item.collectedAt}</td>
              <td className={`${styles.alignCenter} ${styles.checkCell}`}>{item.completed ? "✔" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.footer}>
        <button className={styles.nextButton} disabled>
          다음단계
        </button>
      </div>
    </div>
  );
}