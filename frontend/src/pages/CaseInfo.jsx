import React, { useEffect, useState } from 'react';
import styles from '../styles/CaseInfo.module.css';
import { useParams } from 'react-router-dom';

function CaseInfo() {
  const { caseId } = useParams();
  const [caseInfo, setCaseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '정보 없음';
    try {
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch (e) {
      return dateTimeString;
    }
  };

  // 사건 데이터 불러오기
  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/getCase/${caseId}`);
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
        const data = await res.json();

        if (!data || !data.case_number) {
          throw new Error('사건 정보를 찾을 수 없습니다.');
        }

        const mappedCase = {
          caseNumber: data.case_number,
          caseType: data.case_type,
          incidentDateTime: data.case_occur_date,
          location: data.case_occur_location,
          summary: data.case_overview,
          persons: data.related_person_info,
          agency: data.commission_agency,
          requestDateTime: data.commission_date,
          legalPower: !!data.doc_file_path,
          legalFileName: data.doc_file_path ? data.doc_file_path.split('/').pop() : null,
        };

        setCaseInfo(mappedCase);
      } catch (err) {
        console.error('사건 정보 로드 실패:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  if (loading) {
    return <div className={styles.loading}>🔄 사건 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>❌ 오류: {error}</div>;
  }

  if (!caseInfo) {
    return <div className={styles.error}>❌ 사건 정보를 찾을 수 없습니다.</div>;
  }

  const fields = [
    { label: '사건 번호', key: 'caseNumber' },
    { label: '사건 유형', key: 'caseType' },
    { label: '사건 발생 위치', key: 'location' },
    { label: '사건 발생 일시', key: 'incidentDateTime', formatter: formatDateTime },
    { label: '의뢰 기관', key: 'agency' },
    { label: '의뢰 일시', key: 'requestDateTime', formatter: formatDateTime },
  ];

  return (
    <div className={styles.caseInfoContainer}>
      <div className={styles.infoCard}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.formRow}>
            {fields.map(field => (
              <div className={styles.formCol} key={field.key}>
                <label className={styles.label}>{field.label}</label>
                <div className={styles.displayValue}>
                  {field.formatter
                    ? field.formatter(caseInfo[field.key])
                    : caseInfo[field.key] || '정보 없음'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>상세 내용</h2>
          <div className={styles.formRow}>
            <div className={styles.formColFull}>
              <label className={styles.label}>사건 개요</label>
              <div className={`${styles.displayValue} ${styles.textareaDisplay}`}>
                {caseInfo.summary || '정보 없음'}
              </div>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formColFull}>
              <label className={styles.label}>관련자 정보</label>
              <div className={`${styles.displayValue} ${styles.textareaDisplay}`}>
                {caseInfo.persons || '정보 없음'}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>법적 권한</h2>
          <div className={styles.formRow}>
            <div className={styles.formColHalf}>
              <label className={styles.label}>법적 권한 유무</label>
              <div className={styles.displayValue}>
                {caseInfo.legalPower ? '✅ 있음' : '❌ 없음'}
              </div>
            </div>
            <div className={styles.formColHalf}>
              <label className={styles.label}>첨부 파일</label>
              <div className={styles.displayValue}>
                {caseInfo.legalFileName && caseInfo.legalPower
                  ? <span className={styles.fileName}>{caseInfo.legalFileName}</span>
                  : '첨부 파일 없음'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseInfo;
