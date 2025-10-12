import React, { useState, useEffect } from 'react';
import styles from '../styles/DataTransfer.module.css';
import { useNavigate } from 'react-router-dom';
import HashVerifierFooter from '../components/HashVerifierFooter';

const initialTransferForm = {
  출발위치: '',
  도착위치: '',
  이송일시: '',
  도착일시: '',
  발신자: '',
  발신자연락처: '',
  이송자: '',
  이송자연락처: '',
  수령자: '',
  수령자연락처: '',
  담당자: '',
  서명: null,
  이미지: null,
};

export default function DataTransfer() {
  const [evidenceInfo, setEvidenceInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowStates, setRowStates] = useState([]);
  const [modalIdx, setModalIdx] = useState(null);
  const [form, setForm] = useState(initialTransferForm);
  const [signatureFile, setSignatureFile] = useState(null);
  const [hashModalIdx, setHashModalIdx] = useState(null);
  const navigate = useNavigate();

  // --------------------------
  // ① DB에서 EList 기반으로 데이터 불러오기 & rowStates 초기화
  // --------------------------
  useEffect(() => {
    const fetchEvidenceData = async () => {
      try {
        const CURRENT_CASEID = localStorage.getItem("currentCaseID");
        if (!CURRENT_CASEID) {
          alert("현재 사건 ID를 찾을 수 없습니다.");
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:8000/getEvidenceList/${CURRENT_CASEID}`);
        if (!res.ok) throw new Error("리스트 불러오기 실패");
        const list = await res.json();
        const EList = list.ids;

        if (!EList || EList.length === 0) {
          alert("해당 사건에 등록된 증거가 없습니다.");
          setLoading(false);
          return;
        }

        const fetchedEvidence = [];
        const rowStatesWithTransfer = [];

        for (const id of EList) {
          const response = await fetch(`http://localhost:8000/getEvidence/${id}`);
          if (!response.ok) {
            console.warn(`증거 ID ${id}의 데이터를 불러오는 데 실패했습니다.`);
            continue;
          }
          const result = await response.json();
          fetchedEvidence.push({
            id,
            name: result.evidence_name,
            type: result.type,
            date: result.collect_date,
          });

          // transferInfo 존재 여부 확인
          const tRes = await fetch(`http://localhost:8000/getTransferInfoList/${id}`);
          const tResult = await tRes.json();

          if (tResult.ids && tResult.ids.length > 0) {
            rowStatesWithTransfer.push({
              transfer: "정보 기입 완료",
              transferStatus: "done",
              hashStatus: "none", // 해시 검증 버튼 활성화
              transferData: tResult.data || null,
            });
          } else {
            rowStatesWithTransfer.push({
              transfer: "이송 정보 기입",
              transferStatus: "pending",
              hashStatus: "disabled", // 해시 검증 비활성화
              transferData: null,
            });
          }
        }

        setEvidenceInfo(fetchedEvidence);
        setRowStates(rowStatesWithTransfer);
      } catch (err) {
        console.error("서버 통신 중 오류:", err);
        alert("서버 통신 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvidenceData();
  }, []);

  // --------------------------
  // 모달 및 폼 관련 함수
  // --------------------------
  const openModal = (idx) => {
    setModalIdx(idx);
    setForm(initialTransferForm);
    setSignatureFile(null);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalIdx(null);
    setForm(initialTransferForm);
    setSignatureFile(null);
    document.body.style.overflow = 'auto';
  };

  const handleFormChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const isFormValid = () => {
    return (
      form.출발위치 &&
      form.도착위치 &&
      form.이송일시 &&
      form.도착일시 &&
      form.발신자 &&
      form.발신자연락처 &&
      form.이송자 &&
      form.이송자연락처 &&
      form.수령자 &&
      form.수령자연락처 &&
      form.담당자 &&
      signatureFile &&
      form.이미지
    );
  };

  const handleRegister = async () => {
    if (!isFormValid()) {
      alert("모든 필드를 입력해야 합니다.");
      return;
    }

    try {
      const evidence = evidenceInfo[modalIdx];
      if (!evidence) throw new Error("해당 증거 정보를 찾을 수 없습니다.");

      const caseID = localStorage.getItem("currentCaseID");
      const caseRes = await fetch(`http://localhost:8000/getCase/${caseID}`);
      if (!caseRes.ok) throw new Error("case_number 조회 실패");
      const caseData = await caseRes.json();
      const caseNumber = caseData.case_number;

      const signaturePath = `/signs/${signatureFile?.name || "unknown_sign.png"}`;
      const imagePath = `/images/${form.이미지?.name || "unknown_image.png"}`;

      const transferData = {
        case_number: Number(caseNumber),
        t_hash_validation_status: false,
        departure_location: form.출발위치,
        departure_date: form.이송일시.split('T')[0],
        arrival_location: form.도착위치,
        arrival_date: form.도착일시.split('T')[0],
        sender: form.발신자,
        sender_contact: form.발신자연락처,
        receiver: form.수령자,
        receiver_contact: form.수령자연락처,
        transfer_manager: form.이송자,
        transfer_manager_contact: form.이송자연락처,
        responsible_member: form.담당자,
        responsible_member_sign: signaturePath,
        image_file_path: imagePath,
        evidence_id: evidence.id,
      };

      const res = await fetch("http://localhost:8000/createTransfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      });

      if (!res.ok) throw new Error("이송 정보 등록 실패");

      alert("이송 정보가 성공적으로 등록되었습니다.");

      // rowStates 업데이트: transfer 완료 + hash 버튼 활성화
      setRowStates((states) =>
        states.map((item, i) =>
          i === modalIdx
            ? {
                ...item,
                transfer: "정보 기입 완료",
                transferStatus: "done",
                hashStatus: "none", // hash 버튼 활성화
                transferData,
              }
            : item
        )
      );

      closeModal();
    } catch (err) {
      console.error(err);
      alert("이송 정보 등록 중 오류가 발생했습니다.");
    }
  };

  // --------------------------
  // 해시 검증 관련
  // --------------------------
  const onHashValid = () => {
    setRowStates((states) =>
      states.map((item, i) =>
        i === hashModalIdx ? { ...item, hashStatus: 'done' } : item
      )
    );
    setHashModalIdx(null);
  };

  const onHashInvalid = () => {
    alert('해시가 일치하지 않습니다!');
  };

  const openHashModal = (idx) => {
    setHashModalIdx(idx);
    document.body.style.overflow = 'hidden';
  };

  const closeHashModal = () => {
    setHashModalIdx(null);
    document.body.style.overflow = 'auto';
  };

  const isAllDone = rowStates.every(
    (item) => item.transferStatus === 'done' && item.hashStatus === 'done'
  );

  // --------------------------
  // 렌더링
  // --------------------------
  if (loading) {
    return (
      <div className={styles.dtContainer}>
        <p style={{ textAlign: 'center', marginTop: '100px', fontSize: '20px' }}>
          🔄 서버 응답 대기 중...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.dtContainer}>
      {/* 이송 정보 입력 모달 */}
      {modalIdx !== null && (
        <div className={styles.transferModalOverlay}>
          <div className={styles.transferModalBackdrop} />
          <div className={styles.transferModalContent}>
            <p className={styles.uploadTitle}>이송 정보 입력</p>
            <div className={styles.fileInfoForm}>
              <p><strong>파일명:</strong> {evidenceInfo[modalIdx]?.name}</p>
              <div className={styles.inputRow}>
                <label className={styles.inputLabel}>출발 위치</label>
                <input className={styles.inputField} value={form.출발위치} onChange={e => handleFormChange('출발위치', e.target.value)} />
              </div>
              <div className={styles.inputRow}>
                <label className={styles.inputLabel}>도착 위치</label>
                <input className={styles.inputField} value={form.도착위치} onChange={e => handleFormChange('도착위치', e.target.value)} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>이송 일시</label>
                  <input type="datetime-local" className={styles.inputField} value={form.이송일시} onChange={e => handleFormChange('이송일시', e.target.value)} />
                </div>
                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>도착 일시</label>
                  <input type="datetime-local" className={styles.inputField} value={form.도착일시} onChange={e => handleFormChange('도착일시', e.target.value)} />
                </div>
              </div>
              {[['발신자', '발신자연락처'], ['이송자', '이송자연락처'], ['수령자', '수령자연락처']].map(([a, b]) => (
                <div className={styles.formRow} key={a}>
                  <div className={styles.inputRow}>
                    <label className={styles.inputLabel}>{a}</label>
                    <input className={styles.inputField} value={form[a]} onChange={e => handleFormChange(a, e.target.value)} />
                  </div>
                  <div className={styles.inputRow}>
                    <label className={styles.inputLabel}>{b}</label>
                    <input className={styles.inputField} value={form[b]} onChange={e => handleFormChange(b, e.target.value)} />
                  </div>
                </div>
              ))}
              <div className={styles.inputRowGap8}>
                <label className={styles.inputLabel}>담당자</label>
                <input className={styles.inputField} value={form.담당자} onChange={e => handleFormChange('담당자', e.target.value)} />
                <button
                  type="button"
                  onClick={() => document.getElementById('signatureInput').click()}
                  className={styles.signatureAttachButton}
                >서명</button>
                <input
                  id="signatureInput"
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={e => {
                    if (e.target.files[0]) {
                      setSignatureFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              {signatureFile && <div className={styles.signatureFileInfo}>첨부된 서명: {signatureFile.name}</div>}
              <label className={styles.inputLabel}>이미지</label>
              <input id="imgInput" type="file" accept="image/*" className={styles.hiddenInput} onChange={e => handleFormChange('이미지', e.target.files[0])} />
              <div className={styles.fileDropTransferImage} onClick={() => document.getElementById('imgInput').click()}>
                {form.이미지 ? form.이미지.name : '증거 사진을 업로드하세요.'}
              </div>
              <div className={styles.formButtons}>
                <button onClick={closeModal}>취소</button>
                <button onClick={handleRegister} disabled={!isFormValid()}>등록</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 해시 검증 모달 */}
      {hashModalIdx !== null && (
        <div className={styles.hashModalOverlay}>
          <div className={styles.hashModalBackdrop} />
          <div className={styles.hashModalContent}>
            <p className={styles.uploadTitle}>해시 검증</p>
            <HashVerifierFooter
              storedHash={evidenceInfo[hashModalIdx]?.hash}
              onValid={onHashValid}
              onInvalid={onHashInvalid}
              disabled={false}
            />
            <div className={styles.formButtonsHashModal}>
              <button onClick={closeHashModal}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* DB에서 가져온 데이터로 테이블 생성 */}
      <table className={styles.dtTable}>
        <thead>
          <tr>
            <th>이름</th>
            <th>종류</th>
            <th>수집 일시</th>
            <th>이송 정보</th>
            <th>해시 검증</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {evidenceInfo.map((item, idx) => (
            <tr key={item.evidence_name || idx}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.date}</td>
              <td>
                {rowStates[idx]?.transferStatus === 'done' ? (
                  <span className={styles.dtStatusOk}><span className={styles.dtIconOk}>✔</span> {rowStates[idx]?.transfer}</span>
                ) : (
                  <button className={styles.dtBtnBlue} onClick={() => openModal(idx)}>
                    {rowStates[idx]?.transfer}
                  </button>
                )}
              </td>
              <td>
                {rowStates[idx]?.hashStatus === 'done' ? (
                  <span className={styles.dtStatusOk}><span className={styles.dtIconOk}>✔</span></span>
                ) : (
                  rowStates[idx]?.hashStatus !== 'disabled' ? (
                    <button className={styles.dtBtnBlue} onClick={() => openHashModal(idx)}>
                      해시 검증
                    </button>
                  ) : (
                    <span className={styles.dtStatusFail}>✖</span>
                  )
                )}
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.dtBottomBtn}>
        <button
          className={`${styles.dtNextBtn} ${isAllDone ? styles.dtNextBtnActive : ''}`}
          disabled={!isAllDone}
          onClick={() => navigate('/analyze')}
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}
