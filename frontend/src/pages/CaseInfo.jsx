import React from 'react';
import styles from '../styles/CaseInfo.module.css';
import { useNavigate } from 'react-router-dom';

// 더미 데이터
const DUMMY_CASE_DATA = {
    caseNumber: 'DF-2025-0413-001',
    caseType: '디지털 증거 분석',
    incidentDateTime: '2025-04-13T10:00',
    location: '서울시 강남구 테헤란로',
    summary: '기업 내부 기밀 유출 사건. 특정 직원의 업무용 PC 및 이동식 저장 장치 포렌식 요청.',
    persons: '관련자: 김철수(용의자), 박영희(제보자)',
    agency: '서울 중앙지방검찰청',
    requestDateTime: '2025-04-15T14:30',
    legalPower: true,
    legalFileName: '압수수색영장_DF-2025-0413-001.pdf', //우선 파일 이름만 표시 (이후 다운로드 가능하게끔 변경 가능)
};

function CaseInfo() {
    const navigate = useNavigate();
    const caseInfo = DUMMY_CASE_DATA;

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
                                    {field.formatter ? field.formatter(caseInfo[field.key]) : caseInfo[field.key] || '정보 없음'}
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