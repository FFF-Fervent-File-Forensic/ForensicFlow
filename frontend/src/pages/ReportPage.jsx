import React, { useRef, useEffect, useState } from "react";
import styles from "../styles/ReportPage.module.css";
import html2pdf from "html2pdf.js";
import { useEvidence } from '../contexts/EvidenceContext'; // useEvidence 훅 임포트

const A4_WIDTH = 600; // 페이지 너비를 원래대로 (화면상 크기 기준)
const A4_HEIGHT = Math.round(A4_WIDTH * 1.41); // A4 비율 유지하며 높이 조정 (약 846)

// 전역 변수로 데이터 선언
let globalCaseInfo = null;
let globalEvidenceInfo = [];
let globalTransferInfo = {};
let globalAnalysisInfo = {};

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

// 페이지 내용을 생성하는 함수 정의 - 전역 변수 사용
const renderFirstPage = (styles) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120, fontWeight: 'bold' }}>사건번호</div>
      <div>{globalCaseInfo?.caseNumber}</div>
    </div>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120, fontWeight: 'bold' }}>접수일자</div>
      <div>{globalCaseInfo?.incidentDateTime}</div>
    </div>
    <div style={{ borderTop: '1px solid #222', margin: '16px 0' }}></div>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120, fontWeight: 'bold' }}>분석일자</div>
      <div>{globalTransferInfo[globalEvidenceInfo[0]?.name]?.도착일시}</div>
    </div>
    <div style={{ display: 'flex', marginBottom: 8 }}>
      <div style={{ width: 120, fontWeight: 'bold' }}>장소</div>
      <div>{globalTransferInfo[globalEvidenceInfo[0]?.name]?.도착위치}</div>
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
    <div>{globalCaseInfo?.summary}</div>
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
          <th rowSpan="2" style={{ border: '1px solid #222', padding: '8px', textAlign: 'center', fontSize: '13px'}}>증거<br/>번호</th>
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
              <td colSpan="3" style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.고유번호}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.모델명}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.size}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.사용자}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.type}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.제조사}</td>
              <td style={{ border: '1px solid #222', padding: '8px', fontSize: '12px', textAlign: 'center' }}>{evidence.제조일시}</td>
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
          I. 분석 시스템 운양체제 : Window.
        </div>
        <div style={{ marginBottom: 8 }}>
          II. 복구&분석에 사용한 프로그램 : 
          {
            Array.from(new Set(globalEvidenceInfo.map(evidence => globalAnalysisInfo[evidence.name]?.tool)))
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
      분석 대상 - {evidence.name}
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
    <div style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '8px' }}>크기 : {evidence.size}</div>
      <div style={{ marginBottom: '8px' }}>해시값 : {evidence.hash}</div>
      <div style={{ marginBottom: '8px' }}>해시함수 : SHA-256</div>
      <div style={{ marginBottom: '8px' }}>사용 도구 : {globalAnalysisInfo[evidence.name]?.tool}</div>
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
      수행한 분석 방법 -
    </div>
    <div style={{ marginBottom: '16px' }}>
      {globalAnalysisInfo[evidence.name]?.procedure}
    </div>
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
      분석 결과 -
    </div>
    <div>
      {globalAnalysisInfo[evidence.name]?.result}
    </div>
  </React.Fragment>
);

// 최종 종합 분석 결과 페이지 내용 생성 함수
const renderFinalSummaryPage = () => (
  <React.Fragment>
    {/* 5. 종합 분석 결과 소제목 */}
    <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>
      5. 종합 분석 결과
    </div>
    {/* 종합 분석 결과 텍스트 */}
    <div style={{ marginBottom: 16 }}>
      종합 분석 결과로는.....
    </div>
    {/* 가로선 */}
    <div style={{ borderTop: '1px solid #111', margin: '16px 0' }}></div>
  </React.Fragment>
);

export default function DigitalReportFilled() {
  const reportRef = useRef(); // 전체 보고서를 감싸는 ref
  const downloadButtonRef = useRef(null); // 다운로드 버튼을 위한 ref
  const [pagesContent, setPagesContent] = useState([]);

  // Context에서 데이터 가져오기
  const { caseInfo, evidenceInfo, transferInfo, analysisInfo } = useEvidence();

  useEffect(() => {
    // 전역 변수에 데이터 할당
    globalCaseInfo = caseInfo;
    globalEvidenceInfo = evidenceInfo;
    globalTransferInfo = transferInfo;
    globalAnalysisInfo = analysisInfo;  // analysisInfo도 전역 변수에 할당

    // 데이터 로드 확인을 위한 콘솔 로그
    console.log('Transfer Info:', globalTransferInfo);
    console.log('First Evidence Name:', globalEvidenceInfo[0]?.name);
    console.log('First Transfer Data:', globalTransferInfo[globalEvidenceInfo[0]?.name]);
    console.log('Analysis Info:', globalAnalysisInfo);  // analysisInfo 로그 추가

    // caseInfo와 evidenceInfo가 로드되었는지 확인
    if (!globalCaseInfo || globalEvidenceInfo.length === 0) {
      // 데이터가 없을 경우 '데이터가 없습니다.' 페이지 생성
      setPagesContent([
        <div
          key="no-data"
          className={styles.reportCard}
          style={{
            width: A4_WIDTH,
            minHeight: A4_HEIGHT, // 최소 높이로 설정
            margin: "0 auto 32px auto",
            border: "1px solid #ccc",
            padding: 48,
            background: "#fff",
            boxSizing: "border-box",
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 페이지 제목 (생략하거나 필요에 따라 표시) */}
          {/* <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 30, marginBottom: 24 }}>
              디지털 포렌식 보고서
          </div> */}

          {/* 페이지 내용 - 데이터 없음 메시지 */}
          <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontWeight: 'bold'}}> {/* 내용 중앙 정렬 */}
            데이터가 없습니다.
          </div>

          {/* 하단 정보 - 페이지 번호는 1/1로 표시 */}
          <div style={{ marginTop: "auto", fontSize: 12, borderTop: "1px solid #eee", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            {/* 푸터 왼쪽 내용: 수집장소 */}
            <div>
              <div>{globalCaseInfo?.수집장소 || '정보 없음'}</div> {/* caseInfo가 없을 수도 있으므로 대체 텍스트 */}
            </div>
            {/* 푸터 오른쪽 내용: 페이지 번호 */}
            <div>1 / 1 페이지</div>
          </div>
        </div>
      ]);
      return;
    }

    const allPages = [];

    // 증거 종류별 개수 집계
    const counts = {};
    globalEvidenceInfo.forEach(evidence => {
      const type = evidence.type;
      counts[type] = (counts[type] || 0) + 1;
    });

    // 분석 대상 문자열 생성
    const analysisTargetParts = [];
    for (const type in counts) {
      if (counts.hasOwnProperty(type)) {
        analysisTargetParts.push(`${type} ${counts[type]}개`);
      }
    }
    const analysisTargetString = "컴퓨터에 부속 장착된 " + analysisTargetParts.join(', ');
    globalCaseInfo.analysisTargetString = analysisTargetString;

    // 첫 번째 페이지 내용 추가
    allPages.push(renderFirstPage(styles));

    // 두 번째 페이지 내용 추가
    allPages.push(renderEvidenceTablePage());

    // 각 증거에 대한 상세 페이지 추가
    globalEvidenceInfo.forEach(evidence => {
      allPages.push(renderEvidenceDetailPage(evidence));
    });

    // 최종 종합 분석 결과 페이지 추가
    allPages.push(renderFinalSummaryPage());

    setPagesContent(allPages);

  }, [caseInfo, evidenceInfo, transferInfo, analysisInfo]); // 의존성 배열에 caseInfo와 evidenceInfo와 transferInfo와 analysisInfo 추가

  const handleDownloadPDF = () => {
    const element = reportRef.current; // 전체 컨테이너를 대상으로 PDF 생성
    const buttonElement = downloadButtonRef.current; // 버튼 요소 참조

    // PDF 생성 전 버튼 숨기기
    if (buttonElement) {
      buttonElement.style.display = 'none';
    }

    const opt = {
      margin: [0, 0, 0, 0], // 마진을 0으로 설정하여 콘텐츠가 가장자리에 닿도록
      filename: '디지털증거_분석_보고서.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 4, // 스케일링 값을 높여 해상도를 높임 (4로 조정)
        logging: true, // 디버깅을 위해 로깅 활성화
        dpi: 192, // DPI 설정 (필요시 조정)
        letterRendering: true, // 글자 렌더링 개선
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, // PDF 포맷을 A4로 되돌림
      pagebreak: { mode: ['css', 'legacy'] }, // CSS 기반 페이지 나누기 모드 활성화
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // PDF 생성 완료 후 버튼 다시 표시
      if (buttonElement) {
        buttonElement.style.display = ''; // 또는 원래 display 속성으로 설정 (예: 'block', 'inline-block')
      }
    });
  };

  const totalPages = pagesContent.length;
  const today = new Date();
  const formattedDate = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`;

  return (
    <div className={styles.reportWrapper} ref={reportRef}> {/* 전체 페이지 컨테이너 */}
      {pagesContent.map((pageContent, index) => (
        <div
          key={index}
          className={styles.reportCard}
          style={{
            width: A4_WIDTH,
            minHeight: A4_HEIGHT, // 최소 높이로 설정하여 내용에 따라 유연하게 늘어나도록
            margin: "0 auto 32px auto", // 페이지 간 간격 및 가로 중앙 정렬
            border: "1px solid #ccc",
            padding: 48,
            background: "#fff",
            boxSizing: "border-box",
            display: 'flex',
            flexDirection: 'column',
            pageBreakAfter: index < totalPages - 1 ? 'always' : 'auto', // 마지막 페이지를 제외한 모든 페이지 뒤에 페이지 나누기 강제
          }}
        >
          {/* 페이지 제목 (첫 번째 페이지에만 표시) */}
          {index === 0 && (
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 30, marginBottom: 24 }}>
              디지털 포렌식 보고서
            </div>
          )}
          {/* 페이지별 내용 */}
          <div style={{flexGrow: 1}}> {/* 내용이 푸터를 밀어내도록 flexGrow 적용 */}
            {pageContent}
          </div>

          {/* 마지막 페이지 하단 오른쪽 정보 (푸터 위) */}
          {index === totalPages - 1 && (
            <div style={{ textAlign: 'center', fontSize: 23, marginTop: '24px', marginBottom: '120px', fontWeight: 'bold' }}> {/* 푸터와의 간격 조정 */}
              <div>{formattedDate}</div>
              <div>충남대학교 디지털포렌식팀</div>
              <div>디지털포렌식 수사관 {globalEvidenceInfo[0]?.담당자}</div>
            </div>
          )}

          {/* 하단 정보 (모든 페이지에 동일한 스타일, 내용은 마지막 페이지만 다름) */}
          <div style={{ marginTop: "auto", fontSize: 12, borderTop: "1px solid #eee", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            {/* 푸터 왼쪽 내용: 모든 페이지 수집장소 */}
            <div>
              <div>{globalCaseInfo?.수집장소}</div> {/* caseInfo에서 데이터 가져옴 */}
            </div>
            {/* 푸터 오른쪽 내용: 페이지 번호 */}
            <div>{index + 1} / {totalPages} 페이지</div>
          </div>
        </div>
      ))}
      {/* 다운로드 버튼에 ref 연결 */}
      <button className={styles.downloadButton} onClick={handleDownloadPDF} ref={downloadButtonRef}>
        서명 및 다운로드
      </button>
    </div>
  );
}