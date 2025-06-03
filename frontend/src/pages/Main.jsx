import React, { useState, useEffect } from 'react';
import styles from '../styles/Main.module.css';
import { useNavigate } from 'react-router-dom';
import { useEvidence } from '../contexts/EvidenceContext';

function Main() {
  const [caseList, setCaseList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLegalUploadModal, setShowLegalUploadModal] = useState(false);
  const [legalFile, setLegalFile] = useState(null);

  const navigate = useNavigate();
  const { addCaseInfo } = useEvidence();

  const [formData, setFormData] = useState({
    caseNumber: '',
    caseType: '',
    incidentDateTime: '',
    location: '',
    summary: '',
    persons: '',
    agency: '',
    requestDateTime: '',
    legalPower: false,
  });

  const progressStages = [
    { stage: '증거 수집 중', percent: 0 },
    { stage: '증거 이송 중', percent: 33 },
    { stage: '증거 분석 중', percent: 66 },
    { stage: '분석 완료', percent: 100 },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddCase = () => {
    if (caseList.some(c => c.id === formData.caseNumber)) {
      alert("이미 등록된 사건 번호입니다.");
      return;
    }

    const newCase = {
      id: formData.caseNumber,
      progress: progressStages[0].stage,
      progressPercent: progressStages[0].percent,
      ...formData,
    };

    // EvidenceContext에 저장
    addCaseInfo({
      ...formData,
      legalFile: legalFile,
    });

    setCaseList([...caseList, {
      id: newCase.id,
      progress: newCase.progress,
      progressPercent: newCase.progressPercent,
    }]);

    setFormData({
      caseNumber: '',
      caseType: '',
      incidentDateTime: '',
      location: '',
      summary: '',
      persons: '',
      agency: '',
      requestDateTime: '',
      legalPower: false,
    });
    setLegalFile(null);
    setShowModal(false);
  };

  const handleRemoveLegalFile = () => {
    setLegalFile(null);
    setFormData({ ...formData, legalPower: false });
  };

  useEffect(() => {
    setCaseList(prev => {
      if (prev.some(c => c.id === 'DF-2025-0413-001')) return prev;
      return [
        ...prev,
        {
          id: 'DF-2025-0413-001',
          progress: '증거 수집 중',
          progressPercent: 10,
        },
      ];
    });
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <button className={styles.registerButton} onClick={() => setShowModal(true)}>
          ⊕ 사건 등록
        </button>
      </div>

      <div className={styles.caseList}>
        {caseList.length === 0 ? (
          <div className={styles.emptyMessage}>
            등록된 사건 폴더가 없습니다.<br />
            ‘사건 등록’ 버튼을 눌러 폴더를 생성해주세요
          </div>
        ) : (
          caseList.map((c) => (
            <div
              className={styles.caseCard}
              key={c.id}
              onClick={() => navigate("/register")}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.folderIcon}>📁</div>
              <div className={styles.caseId}>{c.id}</div>
              <div className={styles.progress}>{c.progress}</div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${c.progressPercent}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.cancelButton} onClick={() => setShowModal(false)}>✖</button>
            <h2 className={styles.modalTitle}>사건 등록</h2>
            <form className={styles.form} onSubmit={e => { e.preventDefault(); handleAddCase(); }}>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <input
                    type="text"
                    name="caseNumber"
                    value={formData.caseNumber}
                    onChange={handleInputChange}
                    placeholder="사건 번호"
                    className={styles.inputBottomLine}
                  />
                </div>
                <div className={styles.formCol}>
                  <input
                    type="text"
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleInputChange}
                    placeholder="사건 유형"
                    className={styles.inputBottomLine}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="사건 발생 위치"
                    className={styles.inputBottomLine}
                  />
                </div>
                <div className={styles.formCol}>
                  <label className={styles.inputLabel}>사건 발생 일시</label>
                  <input
                    type="datetime-local"
                    name="incidentDateTime"
                    value={formData.incidentDateTime}
                    onChange={handleInputChange}
                    className={styles.inputBottomLine}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <label className={styles.inputLabel}>사건 개요</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    className={styles.textareaBottomLine}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <label className={styles.inputLabel}>관련자 정보</label>
                  <textarea
                    name="persons"
                    value={formData.persons}
                    onChange={handleInputChange}
                    className={styles.textareaBottomLine}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <input
                    type="text"
                    name="agency"
                    value={formData.agency}
                    onChange={handleInputChange}
                    placeholder="의뢰 기관"
                    className={styles.inputBottomLine}
                  />
                </div>
                <div className={styles.formCol}>
                  <label className={styles.inputLabel}>의뢰 일시</label>
                  <input
                    type="datetime-local"
                    name="requestDateTime"
                    value={formData.requestDateTime}
                    onChange={handleInputChange}
                    className={styles.inputBottomLine}
                  />
                </div>
              </div>
              <div className={`${styles.formRow} ${styles.alignCenter}`}>
                <label className={styles.checkbox} onClick={() => setShowLegalUploadModal(true)}>
                  <input
                    type="checkbox"
                    name="legalPower"
                    checked={formData.legalPower}
                    readOnly
                  />
                  <div className={styles.checkboxTextGroup}>
                    <div className={styles.mainLabel}>법적 권한</div>
                    <div className={styles.subtext}>압수수색영장, 피고인 사실확인서 등</div>
                  </div>
                </label>
                {formData.legalPower && legalFile && (
                  <div className={styles.uploadedFile}>
                    {legalFile.name}
                    <button className={styles.removeFileButton} onClick={handleRemoveLegalFile}>✖</button>
                  </div>
                )}
                <button
                  className={styles.addButton}
                  type="submit"
                  disabled={!formData.caseNumber}
                  style={{
                    backgroundColor: formData.caseNumber ? '#007aff' : '#ddd',
                    cursor: formData.caseNumber ? 'pointer' : 'default',
                  }}
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLegalUploadModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.uploadModal}>
            <button
              className={styles.closeButton}
              onClick={() => setShowLegalUploadModal(false)}
            >
              ✖
            </button>
            <label htmlFor="legalFileUpload" className={styles.uploadBox}>
              파일을 업로드하세요.
            </label>
            <input
              id="legalFileUpload"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setLegalFile(file);
                  setFormData({ ...formData, legalPower: true });
                  setShowLegalUploadModal(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
