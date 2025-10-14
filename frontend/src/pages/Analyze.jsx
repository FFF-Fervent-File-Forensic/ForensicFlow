import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Analyze.module.css";
import { useParams } from 'react-router-dom';

export default function Analyze() {
  const [evidenceIdList, setEvidenceIdList ]= useState([]);
  const [evidenceInfo, setEvidenceInfo ] = useState([]);
  const [analysisMap, setAnalysisMap ] = useState({}); // evidence id -> first analysis id (or null)
  const navigate = useNavigate();
  const { caseId } = useParams();

  useEffect(() => {
    async function fetchEvidenceList() {
      const evidenceRes = await fetch(`http://localhost:8000/getEvidenceList/${caseId}`);
      const data = await evidenceRes.json();
      setEvidenceIdList(data.ids || []); 
    }
    if (caseId) fetchEvidenceList();
  }, [caseId]);

  useEffect(() => {
    if (!evidenceIdList || evidenceIdList.length === 0) return;

    async function fetchEvidenceInfo() {
      const infoList = [];

      for (const item of evidenceIdList) {
        // item이 단순 id라면 그대로, 객체라면 item.id
        const id = item.id ?? item; 
        const evidenceRes = await fetch(`http://localhost:8000/getEvidence/${id}`);
        if (evidenceRes.ok) {
          const evidenceData = await evidenceRes.json();
          infoList.push(evidenceData);
        }
      }
      // 한 번에 배열로 상태 업데이트
      setEvidenceInfo(infoList);
    }

    fetchEvidenceInfo();
  }, [evidenceIdList]);

useEffect(() => {
  if (!evidenceIdList || evidenceIdList.length === 0) return;
  if (evidenceIdList.every(ev => ev.hasOwnProperty('analysisInfoId'))) return;

  async function fetchAnalysisInfo() {
    try {
      const analysisMap = {};

      for (const item of evidenceIdList) {
        const id = item.id ?? item; // id가 없으면 item 자체를 사용
        if (item.analysisInfoId !== undefined) {
          analysisMap[id] = item.analysisInfoId;
          continue;
        }

        try {
          const res = await fetch(`http://localhost:8000/getAnalysisInfoList/${id}`);
          if (res.ok) {
            const data = await res.json();
            const ids = data.ids || [];
            analysisMap[id] = ids.length > 0 ? ids[0] : null;
          } else {
            analysisMap[id] = null;
          }
        } catch (err) {
          console.error(`analysis fetch failed for evidence ${id}:`, err);
          analysisMap[id] = null;
        }
      }

      setAnalysisMap(analysisMap);
      console.log("Fetched analysisMap:", analysisMap);
    } catch (err) {
      console.error("fetchAnalysisInfo error:", err);
    }
  }

  fetchAnalysisInfo();
}, [evidenceIdList]);



  const handleClick = (evidenceName) => {
    navigate(`/Analyzeinput/${caseId}/${evidenceName}`);
  };

  //const allCompleted = evidenceInfo.every(item => analysisInfo && analysisInfo[item.name]);
  const allCompleted = true; // 임시로 true 설정, 실제로는 위의 주석 처리된 코드 사용

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
            <tr key={item.id}>
              <td className={styles.alignLeft}>
                <div className={styles.fileRow}>
                  <span>{item.evidence_name}</span>
                </div>
              </td>
              <td className={styles.alignCenter}>
                {item.responsible_member}
              </td>
              <td className={styles.alignCenter}>{item.collect_date}</td>
              <td className={`${styles.alignCenter} ${styles.checkCell}`}>
                {analysisMap[item.id] ? (
                  <span className={styles.checkmark}>✔</span>
                ) : (
                  <button className={styles.inputButton} onClick={() => handleClick(item.id)}>
                      입력
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.footer}>
        <button
          className={`${styles.nextButton} ${allCompleted ? styles.enabled : styles.disabled}`}
          disabled={!allCompleted}
          onClick={async () => {
            try {
              const CURRENT_CASEID = caseId;

              if (!CURRENT_CASEID) {
                alert("현재 사건 ID를 찾을 수 없습니다.");
                navigate("/ReportPage"); // 그래도 페이지 이동은 수행
                return;
              }

              // 1️⃣ 현재 사건 정보 가져오기
              const caseResponse = await fetch(`http://localhost:8000/getCase/${CURRENT_CASEID}`);
              const caseData = await caseResponse.json();

              if (!caseData || !caseData.present_stair) {
                console.warn("사건 정보를 불러오지 못했습니다.");
                navigate("/ReportPage");
                return;
              }

              console.log(`현재 사건 단계: ${caseData.present_stair}`);

              // 2️⃣ 현재 단계가 "증거 분석 중"일 경우만 "분석 완료"로 갱신
              if (caseData.present_stair === "증거 분석 중") {
                const updateResponse = await fetch(`http://localhost:8000/updatePresentStair/${CURRENT_CASEID}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ new_stair: "분석 완료" }),
                });

                const updateResult = await updateResponse.json();

                if (!updateResult.success) {
                  console.warn("사건 단계 업데이트에 실패했습니다.");
                } else {
                  console.log(`Case ${CURRENT_CASEID} present_stair → '분석 완료'로 변경됨`);
                }
              } else {
                console.log(`현재 단계(${caseData.present_stair})가 '증거 분석 중'이 아니므로 갱신 생략`);
              }

              // 3️⃣ 페이지 이동 (조건과 관계없이 항상)
              navigate(`/ReportPage/${CURRENT_CASEID}`);

            } catch (error) {
              console.error("업데이트 중 오류 발생:", error);
              alert("서버와 통신 중 오류가 발생했습니다.");
              navigate("/ReportPage"); // 오류가 발생해도 이동은 진행
            }
          }}
        >
          다음단계
        </button>

      </div>
    </div>
  );
}