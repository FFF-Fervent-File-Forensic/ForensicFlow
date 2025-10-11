import React, { useState, useEffect } from 'react';
import styles from '../styles/DataRegister.module.css';
import { useNavigate } from 'react-router-dom';

// 개발 및 디버깅을 위한 하드 코딩. 추후 수정 필요
const CURRENT_CASEID = 1;

const response = await fetch(`http://localhost:8000/getEvidenceList/1`);
const evidenceIDList = await response.json();

export default function EvidenceManager() {
  const navigate = useNavigate();

  // Evidence ID 리스트
  const [EList, setEList] = useState(evidenceIDList.ids);

  // Evidence 데이터 목록
  const [evidenceInfo, setEvidenceInfo] = useState([]);

  // 서버 응답 상태
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트가 처음 렌더링될 때 DB에서 증거 데이터 불러오기
  useEffect(() => {
    const fetchEvidenceData = async () => {
      setIsLoading(true); // 서버 응답 대기 상태 시작

      try {
        const results = [];

        // EList의 각 ID에 대해 fetch 수행
        for (const id of EList) {
          const response = await fetch(`http://localhost:8000/getEvidence/${id}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch evidence with id ${id}`);
          }

          const result = await response.json();

          // result에는 DB에서 반환한 Evidence 데이터가 들어 있음
          results.push({
            name: result.evidence_name,
            type: result.type,
            date: result.collect_date,
          });
        }

        setEvidenceInfo(results); // evidenceTable 데이터 갱신
      } catch (error) {
        console.error("Error fetching evidence data:", error);
        alert("서버로부터 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchEvidenceData();
  }, [EList]);

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <table className={styles.evidenceTable}>
          <thead>
            <tr>
              <th>이름</th>
              <th>종류</th>
              <th>수집 일시</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: '#888' }}>
                  서버 응답 대기 중..
                </td>
              </tr>
            ) : evidenceInfo.length > 0 ? (
              evidenceInfo.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: '#aaa' }}>
                  불러올 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.rightPane}>
        <button
          className={styles.addButton}
          onClick={() => navigate('/transfer')}
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}
