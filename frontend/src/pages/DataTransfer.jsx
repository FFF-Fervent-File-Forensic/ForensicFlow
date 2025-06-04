import React, { useState } from 'react';
import styles from '../styles/DataTransfer.module.css';
import { useEvidence } from '../contexts/EvidenceContext';
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
  const { evidenceInfo, addTransferInfo } = useEvidence();
  const [rowStates, setRowStates] = useState(
    evidenceInfo.map(() => ({
      transfer: '이송 정보 기입',
      transferStatus: 'pending',
      hashStatus: 'none',
      transferData: null,
    }))
  );
  const [modalIdx, setModalIdx] = useState(null);
  const [form, setForm] = useState(initialTransferForm);
  const [signatureFile, setSignatureFile] = useState(null);
  const [hashModalIdx, setHashModalIdx] = useState(null);
  const navigate = useNavigate();

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
      form.출발위치 && form.도착위치 && form.이송일시 && form.도착일시 &&
      form.발신자 && form.발신자연락처 && form.이송자 && form.이송자연락처 &&
      form.수령자 && form.수령자연락처 && form.담당자 && signatureFile && form.이미지
    );
  };

  const handleRegister = () => {
    if (!isFormValid()) return;
    const evidenceName = evidenceInfo[modalIdx]?.name;

    const transferData = {
      ...form,
      서명: signatureFile,
    };

    addTransferInfo(evidenceName, transferData);

    setRowStates((states) =>
      states.map((item, i) =>
        i === modalIdx
          ? {
              ...item,
              transfer: '이송 정보 확인',
              transferStatus: 'done',
              transferData,
            }
          : item
      )
    );
    closeModal();
  };

  // 해시 검증 성공 콜백
  const onHashValid = () => {
    setRowStates((states) =>
      states.map((item, i) =>
        i === hashModalIdx ? { ...item, hashStatus: 'done' } : item
      )
    );
    setHashModalIdx(null);
  };

  // 해시 검증 실패 콜백
  const onHashInvalid = () => {
    alert('해시가 일치하지 않습니다!');
  };

  // 해시 검증 모달 열기
  const openHashModal = (idx) => {
    setHashModalIdx(idx);
    document.body.style.overflow = 'hidden';
  };

  // 해시 검증 모달 닫기
  const closeHashModal = () => {
    setHashModalIdx(null);
    document.body.style.overflow = 'auto';
  };

  const isAllDone = rowStates.every(
    (item) => item.transferStatus === 'done' && item.hashStatus === 'done'
  );

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
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.date}</td>
              <td>
                {rowStates[idx]?.transferStatus === 'done' ? (
                  <span className={styles.dtStatusOk}><span className={styles.dtIconOk}>✔</span> {rowStates[idx]?.transfer}</span>
                ) : (
                  <button className={styles.dtBtnBlue} onClick={() => openModal(idx)}>{rowStates[idx]?.transfer}</button>
                )}
              </td>
              <td>
                {rowStates[idx]?.hashStatus === 'done' ? (
                  <span className={styles.dtStatusOk}><span className={styles.dtIconOk}>✔</span></span>
                ) : (
                  <span className={styles.dtStatusFail}>✖</span>
                )}
              </td>
              <td>
                {rowStates[idx]?.hashStatus !== 'done' && (
                  <button className={styles.dtBtnBlue} onClick={() => openHashModal(idx)}>해시 검증</button>
                )}
              </td>
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
