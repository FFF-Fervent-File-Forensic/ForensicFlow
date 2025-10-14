import React, { useRef, useEffect, useState } from "react";
import styles from "../styles/ReportPage.module.css";
import html2pdf from "html2pdf.js";
import { useParams } from "react-router-dom";

const A4_WIDTH = 600;
const A4_HEIGHT = Math.round(A4_WIDTH * 1.41);

// 전역 변수 (기존 렌더러와 호환)
let globalCaseInfo = null;
let globalEvidenceInfo = [];
let globalTransferInfo = {};
let globalAnalysisInfo = {};

// (생략하지 않고 기존에 쓰던 렌더 함수들 그대로 붙여넣기)
class Evidence {
  constructor(
    name,
    hash,
    size,
    manager,
    user,
    type,
    manufacturer,
    model,
    collectionLocation,
    storageLocation,
    serialNumber,
    manufacturingDate,
    collectionDate,
    analysisLocation,
    analysisManager,
    analysisTool,
    analysisItems,
    analysisProcess,
    analysisResult
  ) {
    this.name = name;
    this.hash = hash;
    this.size = size;
    this.manager = manager;
    this.user = user;
    this.type = type;
    this.manufacturer = manufacturer;
    this.model = model;
    this.collectionLocation = collectionLocation;
    this.storageLocation = storageLocation;
    this.serialNumber = serialNumber;
    this.manufacturingDate = manufacturingDate;
    this.collectionDate = collectionDate;
    this.analysisLocation = analysisLocation;
    this.analysisManager = analysisManager;
    this.analysisTool = analysisTool;
    this.analysisItems = analysisItems;
    this.analysisProcess = analysisProcess;
    this.analysisResult = analysisResult;
  }
}

const renderFirstPage = (styles) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120, fontWeight: 'bold' }}>사건번호</div>
      <div>{globalCaseInfo?.case_number}</div>
    </div>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120, fontWeight: 'bold' }}>접수일자</div>
      <div>{globalCaseInfo?.commission_date}</div>
    </div>
    <div style={{ borderTop: '1px solid #222', margin: '16px 0' }}></div>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120, fontWeight: 'bold' }}>분석대상</div>
      <div>{globalCaseInfo?.analysisTargetString}</div>
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 200, fontWeight: 'bold', fontSize: 20 }}>1. 사건 개요</div>
    </div>
    <div>{globalCaseInfo?.case_overview}</div>
  </div>
);

const renderEvidenceTablePage = () => (
  <React.Fragment>
    <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>
      2. 분석 대상 정보
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#eee' }}>
          <th rowSpan="2" style={{ border: '1px solid #222', padding: '8px', textAlign: 'center', fontSize: '13px' }}>증거<br />번호</th>
          <th colSpan="3" style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>고유(Serial) 번호</th>
          <th style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>모델명</th>
          <th style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>용량</th>
        </tr>
        <tr style={{ backgroundColor: '#eee' }}>
          <th style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>사용자</th>
          <th style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>종류</th>
          <th style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>제조사</th>
          <th style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>제조 일자</th>
          <th style={{ border: '1px solid #222', padding: '8px', textAlign: 'center' }}>비고</th>
        </tr>
      </thead>
      <tbody>
        {globalEvidenceInfo.map((evidence, index) => (
          <React.Fragment key={index}>
            <tr>
              <td rowSpan="2" style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{index + 1}</td>
              <td colSpan="3" style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.고유번호 || evidence.unique_number || evidence.고유번호}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.모델명 || evidence.model_name || evidence.modelName}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.size}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.사용자 || evidence.evidence_user}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.type}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.제조사 || evidence.manufactory || evidence.manufacturer}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.제조일시 || evidence.manufactory_date}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>-</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
    <div style={{ marginTop: '32px' }}>
      <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>
        3. 분석 시스템과 도구
      </div>
      <div style={{ marginLeft: 20 }}>
        <div style={{ marginBottom: 8 }}>
          I. 분석 시스템 운용체제 : Window.
        </div>
        <div style={{ marginBottom: 8 }}>
          II. 복구&분석에 사용한 프로그램 :
          {
            Array.from(new Set(globalEvidenceInfo.map(evidence => globalAnalysisInfo[evidence.evidence_name]?.tool)))
              .join(', ')
          }
        </div>
      </div>
    </div>
  </React.Fragment>
);

const renderEvidenceDetailPage = (evidence) => (
  <React.Fragment>
    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
      분석 대상 - {evidence.evidence_name}
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
    <div style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '8px' }}>해시값 : {evidence.hash || evidence.hash_value}</div>
      <div style={{ marginBottom: '8px' }}>해시함수 : SHA-256</div>
      <div style={{ marginBottom: '8px' }}>사용 도구 : {globalAnalysisInfo[evidence.evidence_name]?.analysis_tool}</div>
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
      수행한 분석 방법 -
    </div>
    <div style={{ marginBottom: '16px' }}>
      {globalAnalysisInfo[evidence.evidence_name]?.analysis_process}
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
      분석 결과 -
    </div>
    <div>
      {globalAnalysisInfo[evidence.evidence_name]?.analysis_result}
    </div>
  </React.Fragment>
);

const renderFinalSummaryPage = () => (
  <React.Fragment>
    <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>
      5. 종합 분석 결과
    </div>
    <div style={{ marginBottom: 16 }}>
      종합 분석 결과로는.....
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
  </React.Fragment>
);

export default function DigitalReportFilled() {
  const reportRef = useRef();
  const downloadButtonRef = useRef(null);
  const [pagesContent, setPagesContent] = useState([]);
  const { caseId } = useParams(); // URL param 사용
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: 간단한 fetch wrapper
  const apiGet = async (path) => {
    const base = "http://localhost:8000";
    const res = await fetch(base + path);
    if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
    return await res.json();
  };

  useEffect(() => {
    if (!caseId) return;

    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        // 1) 보고서(사건/증거/이송/분석) 통합 조회
        const report = await apiGet(`/report/${caseId}`);
        globalCaseInfo = report.case || {};

        // 2) 증거 및 하위 데이터 매핑 (기존 전역 구조 유지)
        const evidences = Array.isArray(report.evidences) ? report.evidences : [];
        globalEvidenceInfo = evidences;
        globalTransferInfo = {};
        globalAnalysisInfo = {};

        // evidence 이름을 키로 사용하여 transfer/analysis를 매핑
        for (const ev of evidences) {
          const key = ev.evidence_name || ev.name || String(ev.id || 'unknown');

          // transfers: 최신(도착일자 기준) 하나 선택, 없으면 {}
          const transfers = Array.isArray(ev.transfer_info) ? ev.transfer_info : [];
          const sortedTransfers = [...transfers].sort((a, b) => {
            const da = a?.arrival_date ? new Date(a.arrival_date) : 0;
            const db = b?.arrival_date ? new Date(b.arrival_date) : 0;
            return db - da;
          });
          globalTransferInfo[key] = sortedTransfers[0] || {};

          // analyses: 최신 하나 선택하여 사용 도구/절차/결과 매핑
          const analyses = Array.isArray(ev.analysis_info) ? ev.analysis_info : [];
          const latestAnalysis = analyses[analyses.length - 1] || null;
          if (latestAnalysis) {
            globalAnalysisInfo[key] = {
              analysis_tool: latestAnalysis.analysis_tool,
              analysis_process: latestAnalysis.analysis_process,
              analysis_result: latestAnalysis.analysis_result,
              // 호환 키
              tool: latestAnalysis.analysis_tool,
              procedure: latestAnalysis.analysis_process,
              result: latestAnalysis.analysis_result,
              raw: latestAnalysis,
            };
          }
        }

        // 3) 추가 전처리: 증거 종류별 카운트 및 분석대상 문자열 등 (기존 로직)
        const counts = {};
        globalEvidenceInfo.forEach(evidence => {
          const type = evidence.type || evidence.type_name || evidence.종류 || '기타';
          counts[type] = (counts[type] || 0) + 1;
        });
        const analysisTargetParts = [];
        for (const type in counts) {
          if (counts.hasOwnProperty(type)) {
            analysisTargetParts.push(`${type} ${counts[type]}개`);
          }
        }
        const analysisTargetString = "컴퓨터에 부속 장착된 " + analysisTargetParts.join(', ');
        globalCaseInfo.analysisTargetString = analysisTargetString;

        // 4) 페이지 구성 (기존 렌더러 호출 재사용)
        const allPages = [];
        allPages.push(renderFirstPage(styles));
        allPages.push(renderEvidenceTablePage());
        globalEvidenceInfo.forEach(evidence => {
          allPages.push(renderEvidenceDetailPage(evidence));
        });
        allPages.push(renderFinalSummaryPage());

        if (!cancelled) {
          setPagesContent(allPages);
          console.log("Loaded case, evidence, transfer, analysis.");
        }
      } catch (e) {
        console.error("loadAll error", e);
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const buttonElement = downloadButtonRef.current;

    if (buttonElement) {
      buttonElement.style.display = 'none';
    }

    const opt = {
      margin: [0, 0, 0, 0],
      filename: '디지털증거_분석_보고서.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 4,
        logging: true,
        dpi: 192,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };

    html2pdf().set(opt).from(element).save().then(() => {
      if (buttonElement) {
        buttonElement.style.display = '';
      }
    }).catch(err => {
      console.error("PDF generation failed", err);
      if (buttonElement) buttonElement.style.display = '';
    });
  };

  const totalPages = pagesContent.length || 1;
  const today = new Date();
  const formattedDate = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`;

  return (
    <div>
      {loading && <div style={{ padding: 16 }}>데이터 로딩 중...</div>}
      {error && <div style={{ color: 'red', padding: 16 }}>에러: {error}</div>}
      <div className={styles.reportWrapper} ref={reportRef}>
        {pagesContent.length > 0 ? pagesContent.map((pageContent, index) => (
          <div
            key={index}
            className={styles.reportCard}
            style={{
              width: A4_WIDTH,
              minHeight: A4_HEIGHT,
              margin: "0 auto 32px auto",
              border: "1px solid #ccc",
              padding: 48,
              background: "#fff",
              boxSizing: "border-box",
              display: 'flex',
              flexDirection: 'column',
              pageBreakAfter: index < totalPages - 1 ? 'always' : 'auto',
            }}
          >
            {index === 0 && (
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 30, marginBottom: 24 }}>
                디지털 포렌식 보고서
              </div>
            )}
            <div style={{ flexGrow: 1 }}>
              {pageContent}
            </div>

            {index === totalPages - 1 && (
              <div style={{ textAlign: 'center', fontSize: 23, marginTop: '24px', marginBottom: '120px', fontWeight: 'bold' }}>
                <div>{formattedDate}</div>
                <div>충남대학교 디지털포렌식팀</div>
                <div>디지털포렌식 수사관 {globalEvidenceInfo[0]?.responsible_member}</div>
              </div>
            )}

            <div style={{ marginTop: "auto", fontSize: 12, borderTop: "1px solid #eee", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div>{globalCaseInfo?.case_occur_location}</div>
              </div>
              <div>{index + 1} / {totalPages} 페이지</div>
            </div>
          </div>
        )) : (
          // pagesContent가 비어있다면 데이터 없음 카드 표시 (기존과 유사)
          <div
            className={styles.reportCard}
            style={{
              width: A4_WIDTH,
              minHeight: A4_HEIGHT,
              margin: "0 auto 32px auto",
              border: "1px solid #ccc",
              padding: 48,
              background: "#fff",
              boxSizing: "border-box",
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontWeight: 'bold' }}>
              데이터가 없습니다.
            </div>
            <div style={{ marginTop: "auto", fontSize: 12, borderTop: "1px solid #eee", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div>{globalCaseInfo?.수집장소 || '정보 없음'}</div>
              </div>
              <div>1 / 1 페이지</div>
            </div>
          </div>
        )}
      </div>

      <button className={styles.downloadButton} onClick={handleDownloadPDF} ref={downloadButtonRef}>
        서명 및 다운로드
      </button>
    </div>
  );
}
