import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/Main.module.css';
import { useNavigate } from 'react-router-dom';
import { useEvidence } from '../contexts/EvidenceContext';

function Main() {
  const [caseList, setCaseList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLegalUploadModal, setShowLegalUploadModal] = useState(false);
  const [legalFile, setLegalFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('전체');
  const navigate = useNavigate();
  const { addCaseInfo } = useEvidence();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 로그인 안 되어 있으면 접근 차단
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) navigate('/');
  }, [navigate]);

  // 로그인 회원 사건 목록 불러오기
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const loadCases = async () => {
      try {
        const res = await fetch(`http://localhost:8000/getCasesByMember/${user.member_id}`);
        const data = await res.json();
        const ids = data.ids || [];

        if (ids.length === 0) {
          setCaseList([]);
          return;
        }

        const casePromises = ids.map(id => fetch(`http://localhost:8000/getCase/${id}`).then(r => r.json()));
        const caseData = await Promise.all(casePromises);

        const mapped = caseData.map(c => ({
        caseId: c.id, // DB 기본키
        caseNumber: c.case_number, // 사건 번호
          progress: c.present_stair || '증거 수집 중',
          progressPercent:
            c.present_stair === '분석 완료' ? 100 :
            c.present_stair === '증거 분석 중' ? 66 :
            c.present_stair === '증거 이송 중' ? 33 : 0,
        }));

        setCaseList(mapped);
      } catch (err) {
        console.error('사건 목록 불러오기 실패:', err);
      }
    };

    loadCases();
  }, []);

  // 로그아웃
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 사건 등록
  const handleAddCase = async () => {
    if (isSubmitting) return; // 중복 방지
    setIsSubmitting(true);

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const caseBody = {
      case_number: formData.caseNumber,
      case_type: formData.caseType,
      case_overview: formData.summary,
      present_stair: "증거 수집 중",
      doc_file_path: legalFile ? legalFile.name : "",
      case_occur_location: formData.location,
      case_occur_date: formData.incidentDateTime || null,
      commission_agency: formData.agency,
      commission_date: formData.requestDateTime || null,
      related_person_info: formData.persons,
    };

    try {
      const res = await fetch('http://localhost:8000/createCase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseBody),
      });
      if (!res.ok) throw new Error('Case creation failed');
      const newCase = await res.json();

      const mcRes = await fetch('http://localhost:8000/createMemberCase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: user.member_id,
          case_id: newCase.id,
          authority: 'master',
        }),
      });
      if (!mcRes.ok) throw new Error('MemberCase link failed');

      setCaseList(prev => [
        ...prev,
        { 
          caseId: newCase.id,
          caseNumber: formData.caseNumber,
          progress: '증거 수집 중', 
          progressPercent: 0 
        },
      ]);

      setShowModal(false);
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
    } catch (err) {
      console.error(err);
      alert('사건 등록 실패');
    } finally {
    setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleRemoveLegalFile = () => {
    setLegalFile(null);
    setFormData({ ...formData, legalPower: false });
  };

  const filteredCaseList = useMemo(() => {
    return caseList.filter(c => {
      const matchesSearch = c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = filterStage === '전체' || c.progress === filterStage;
      return matchesSearch && matchesStage;
    });
  }, [caseList, searchTerm, filterStage]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.searchBarContainer}>
        <input
          type="text"
          placeholder="🔍 사건 번호로 검색"
          className={styles.caseSearchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className={styles.stageFilterSelect}
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
        >
          <option value="전체">전체 단계</option>
          {progressStages.map(p => (
            <option key={p.stage} value={p.stage}>{p.stage}</option>
          ))}
        </select>  
        <button className={styles.registerButton} onClick={() => setShowModal(true)}>
          ⊕ 사건 등록
        </button>
        <button className={styles.logoutButton} onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <div className={styles.caseList}>
        {filteredCaseList.length === 0 ? (
          <div className={styles.emptyMessage}>
            {searchTerm || filterStage !== '전체'
              ? '검색 조건에 맞는 사건이 없습니다.'
              : (
                <>
                  등록된 사건 폴더가 없습니다.
                  <br />
                  ‘사건 등록’ 버튼을 눌러 폴더를 생성해주세요
                </>
              )
            }
          </div>
        ) : (
          filteredCaseList.map((c) => (
            <div
              className={styles.caseCard}
              key={c.caseId}
              onClick={() => {
                sessionStorage.setItem('caseId', c.caseId);
                navigate(`/caseinfo/${c.caseId}`);
                }
              }
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.folderIcon}>📁</div>
              <div className={styles.caseId}>{c.caseNumber}</div>
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
                      <button
                        type="button"
                        className={styles.removeFileButton}
                        onClick={handleRemoveLegalFile}
                      >
                        ✖
                      </button>
                    </div>
                  )}
                <button
                  className={styles.addButton}
                  type="submit"
                  disabled={!formData.caseNumber}
                  style={{
                    backgroundColor: formData.caseNumber && !isSubmitting ? '#007aff' : '#ddd',
                    cursor: formData.caseNumber && !isSubmitting ? 'pointer' : 'default',
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
