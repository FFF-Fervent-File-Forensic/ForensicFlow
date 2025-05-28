import React, { useRef } from "react";
import styles from "../styles/ReportPage.module.css";
import html2pdf from "html2pdf.js";

export default function DigitalReportFilled() {
  const reportRef = useRef();
 
  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0,
      filename: '디지털증거_분석_보고서.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className={styles.reportWrapper}>
      <div className={styles.reportCard} ref={reportRef}>
        <h1 className={styles.reportTitle}>디지털증거 분석 결과 보고서</h1>

        <div className={styles.reportSection}>
          <div className={styles.reportLabels}>
            <div>사건 번호</div>
            <div>접수 일자</div>
          </div>
          <div className={styles.reportValues}>
            <div>DF-2025-0413-001</div>
            <div>2025-05-26</div>
          </div>
        </div>

        <div className={`${styles.reportSection} ${styles.withLine}`}>
          <div className={styles.reportLabels}>
            <div>분석 일자</div>
            <div>분석 장소</div>
          </div>
          <div className={styles.reportValues}>
            <div>2025-06-11</div>
            <div>충남대학교</div>
          </div>
        </div>

        <div className={`${styles.reportSection} ${styles.withLine}`}>
          <div className={styles.reportLabels}>
            <div>분석 대상</div>
          </div>
          <div className={styles.reportValues}>
            <div>CASE001_USB01_E01.img</div>
          </div>
        </div>

        <div className={styles.reportSection}>
          <div className={`${styles.reportLabels} ${styles.bold}`}>종합 분석 결과</div>
          <ul className={styles.reportBullet}>
            <li>위 증거에 대한 분석으로는 .......</li>
            <li>결과적으로 ......</li>
          </ul>
        </div>

        <div className={styles.reportFooter}>
          <div className={styles.reportDate}>20&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;.</div>
          <div className={styles.reportSign}>
            디지털 포렌식 수사관<br />
            (서명)
          </div>
        </div>

        <div className={styles.reportArrows}>
          <button>&#9664;</button>
          <button>&#9654;</button>
        </div>
      </div>

      <button className={styles.downloadButton} onClick={handleDownloadPDF}>
        서명 및 다운로드
      </button>
    </div>
  );
};