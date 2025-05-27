import React, { useRef } from "react";
import "../styles/ReportPage.css";
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
      margin: [0, 0, 0, 0],
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="report-wrapper">
      <div className="report-card" ref={reportRef}>
        <h1 className="report-title">디지털증거 분석 결과 보고서</h1>

        <div className="report-section">
          <div className="report-labels">
            <div>사건 번호</div>
            <div>접수 일자</div>
          </div>
          <div className="report-values">
            <div>DF-2025-0413-001</div>
            <div>2025-05-26</div>
          </div>
        </div>

        <div className="report-section with-line">
          <div className="report-labels">
            <div>분석 일자</div>
            <div>분석 장소</div>
          </div>
          <div className="report-values">
            <div>2025-06-11</div>
            <div>충남대학교</div>
          </div>
        </div>

        <div className="report-section with-line">
          <div className="report-labels">
            <div>분석 대상</div>
          </div>
          <div className="report-values">
            <div>CASE001_USB01_E01.img</div>
          </div>
        </div>

        <div className="report-section">
          <div className="report-labels bold">종합 분석 결과</div>
          <ul className="report-bullet">
            <li>위 증거에 대한 분석으로는 .......</li>
            <li>결과적으로 ......</li>
          </ul>
        </div>

        <div className="report-footer">
          <div className="report-date">20&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;.</div>
          <div className="report-sign">
            디지털 포렌식 수사관<br />
            (서명)
          </div>
        </div>

        <div className="report-arrows">
          <button>&#9664;</button>
          <button>&#9654;</button>
        </div>
      </div>

      <button className="download-button" onClick={handleDownloadPDF}>
        서명 및 다운로드
      </button>
    </div>
  );
};
