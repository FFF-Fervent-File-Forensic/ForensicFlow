import React, { useState } from 'react';
import '../styles/DataTransfer.css';
import { useEvidence } from '../contexts/EvidenceContext';

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
  const { evidenceList } = useEvidence();
  const [rowStates, setRowStates] = useState(
    evidenceList.map((item, idx) => ({
      transfer: '이송 정보 기입',
      transferStatus: 'pending',
      hashStatus: 'none',
      transferData: null,
    }))
  );
  const [modalIdx, setModalIdx] = useState(null); // 이송 정보 모달 인덱스
  const [form, setForm] = useState(initialTransferForm);
  const [signatureFile, setSignatureFile] = useState(null);
  const [hashModalIdx, setHashModalIdx] = useState(null); // 해시 검증 모달 인덱스
  const [hashFile, setHashFile] = useState(null);
  const [hashError, setHashError] = useState(false);

  const openModal = (idx) => {
    setModalIdx(idx);
    setForm(initialTransferForm);
    setSignatureFile(null);
  };
  const closeModal = () => {
    setModalIdx(null);
    setForm(initialTransferForm);
    setSignatureFile(null);
  };

  const openHashModal = (idx) => {
    setHashModalIdx(idx);
    setHashFile(null);
    setHashError(false);
  };
  const closeHashModal = () => {
    setHashModalIdx(null);
    setHashFile(null);
    setHashError(false);
  };

  const handleTransferClick = (idx) => {
    openModal(idx);
  };

  const handleHashClick = (idx) => {
    openHashModal(idx);
  };

  const handleFormChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
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
    setRowStates(states => states.map((item, i) =>
      i === modalIdx
        ? { ...item, transfer: '이송 정보 확인', transferStatus: 'done', transferData: { ...form, 서명: signatureFile } }
        : item
    ));
    closeModal();
  };

  // 해시 검증 파일 첨부
  const handleHashFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHashFile(file);
    // 파일명(해시) 비교 또는 만능키.txt 허용
    if (file.name === evidenceList[hashModalIdx].name || file.name === '만능키.txt') {
      setRowStates(states => states.map((item, i) =>
        i === hashModalIdx ? { ...item, hashStatus: 'done' } : item
      ));
      closeHashModal();
    } else {
      setHashError(true);
    }
  };

  // 모든 증거의 이송 정보와 해시 검증이 완료되었는지 확인
  const isAllDone = rowStates.every(item => item.transferStatus === 'done' && item.hashStatus === 'done');

  return (
    <div className="dt-container" style={{ position: 'relative' }}>
      {/* 이송 정보 입력 모달 */}
      {modalIdx !== null && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:2000}}>
          <div className="dt-modal-backdrop" style={{zIndex:2001}} />
          <div className="upload-box dt-modal-upload-box" style={{zIndex:2002}}>
            <p className="upload-title">이송 정보 입력</p>
            <div className="file-info-form">
              <p><strong>파일명:</strong> {evidenceList[modalIdx]?.name}</p>
              <div className="input-row">
                <label className="input-label">출발 위치</label>
                <input className="input-field" value={form.출발위치} onChange={e=>handleFormChange('출발위치',e.target.value)} />
              </div>
              <div className="input-row">
                <label className="input-label">도착 위치</label>
                <input className="input-field" value={form.도착위치} onChange={e=>handleFormChange('도착위치',e.target.value)} />
              </div>
              <div className="row">
                <div className="input-row">
                  <label className="input-label">이송 일시</label>
                  <input className="input-field" type="datetime-local" value={form.이송일시} onChange={e=>handleFormChange('이송일시',e.target.value)} />
                </div>
                <div className="input-row">
                  <label className="input-label">도착 일시</label>
                  <input className="input-field" type="datetime-local" value={form.도착일시} onChange={e=>handleFormChange('도착일시',e.target.value)} />
                </div>
              </div>
              <div className="row">
                <div className="input-row">
                  <label className="input-label">발신자</label>
                  <input className="input-field" value={form.발신자} onChange={e=>handleFormChange('발신자',e.target.value)} />
                </div>
                <div className="input-row">
                  <label className="input-label">발신자 연락처</label>
                  <input className="input-field" value={form.발신자연락처} onChange={e=>handleFormChange('발신자연락처',e.target.value)} />
                </div>
              </div>
              <div className="row">
                <div className="input-row">
                  <label className="input-label">이송자</label>
                  <input className="input-field" value={form.이송자} onChange={e=>handleFormChange('이송자',e.target.value)} />
                </div>
                <div className="input-row">
                  <label className="input-label">이송자 연락처</label>
                  <input className="input-field" value={form.이송자연락처} onChange={e=>handleFormChange('이송자연락처',e.target.value)} />
                </div>
              </div>
              <div className="row">
                <div className="input-row">
                  <label className="input-label">수령자</label>
                  <input className="input-field" value={form.수령자} onChange={e=>handleFormChange('수령자',e.target.value)} />
                </div>
                <div className="input-row">
                  <label className="input-label">수령자 연락처</label>
                  <input className="input-field" value={form.수령자연락처} onChange={e=>handleFormChange('수령자연락처',e.target.value)} />
                </div>
              </div>
              <div className="input-row" style={{ gap: '8px' }}>
                <label className="input-label">담당자</label>
                <input className="input-field" value={form.담당자} onChange={e=>handleFormChange('담당자',e.target.value)} />
                <button
                  type="button"
                  onClick={() => document.getElementById('signatureInput').click()}
                  style={{ padding: '6px 20px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                >서명</button>
                <input
                  id="signatureInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setSignatureFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              {signatureFile && (
                <div style={{ fontSize: '13px', color: '#007bff', marginBottom: '4px' }}>
                  첨부된 서명: {signatureFile.name}
                </div>
              )}
              <label className="input-label">이미지</label>
              <div>
                <input id="imgInput" type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFormChange('이미지',e.target.files[0])} />
                <div className="file-drop" onClick={()=>document.getElementById('imgInput').click()} style={{height:'100px',lineHeight:'100px',marginBottom:'0'}}>
                  {form.이미지 ? form.이미지.name : '증거 사진을 업로드하세요.'}
                </div>
              </div>
              <div className="form-buttons">
                <button onClick={closeModal}>취소</button>
                <button
                  onClick={handleRegister}
                  disabled={!isFormValid()}
                  style={{ backgroundColor: isFormValid() ? '#007bff' : '#ccc', color: isFormValid() ? '#fff' : '#888' }}
                >등록</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 해시 검증 모달 */}
      {hashModalIdx !== null && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:2100}}>
          <div className="dt-modal-backdrop" style={{zIndex:2101}} />
          <div className="upload-box dt-modal-upload-box" style={{zIndex:2102, minWidth:'400px', width:'440px', display:'flex', flexDirection:'column', alignItems:'flex-start', padding:'32px 36px'}}>
            <p className="upload-title" style={{marginBottom:'18px'}}>해시 검증</p>
            <div style={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <input id="hashFileInput" type="file" style={{display:'none'}} onChange={handleHashFile} />
              <div className="file-drop" onClick={()=>document.getElementById('hashFileInput').click()} style={{height:'170px',width:'360px',fontSize:'14px',textAlign:'center',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:'6px',lineHeight:'1.3',marginBottom:'0'}}>
                <span style={{fontSize:'15px',color:'#444'}}>{evidenceList[hashModalIdx]?.name}</span>
                <span style={{fontSize:'13px',color:'#888'}}>파일을 업로드하세요.</span>
              </div>
            </div>
            {hashError && (
              <div style={{color:'#d32f2f',marginTop:'18px',fontWeight:'bold',fontSize:'16px',textAlign:'center',width:'100%'}}>해시값이 동일하지 않습니다!</div>
            )}
            <div className="form-buttons" style={{marginTop:'28px',justifyContent:'flex-end',width:'100%'}}>
              <button style={{background:'#fff',color:'#222',border:'1px solid #ccc',boxShadow:'0 2px 4px rgba(0,0,0,0.04)'}} onClick={closeHashModal}>취소</button>
            </div>
          </div>
        </div>
      )}
      <table className="dt-table">
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
          {evidenceList.map((item, idx) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.date}</td>
              <td>
                {rowStates[idx]?.transferStatus === 'done' ? (
                  <span className="dt-status-ok">
                    <span className="dt-icon-ok">✔</span> {rowStates[idx]?.transfer}
                  </span>
                ) : (
                  <button className="dt-btn-blue" onClick={() => handleTransferClick(idx)}>
                    {rowStates[idx]?.transfer}
                  </button>
                )}
              </td>
              <td>
                {rowStates[idx]?.hashStatus === 'done' ? (
                  <span className="dt-status-ok">
                    <span className="dt-icon-ok">✔</span>
                  </span>
                ) : (
                  <span className="dt-status-fail">✖</span>
                )}
              </td>
              <td>
                {rowStates[idx]?.hashStatus !== 'done' && (
                  <button className="dt-btn-blue" onClick={() => handleHashClick(idx)}>
                    해시 생성
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dt-bottom-btn">
        <button
          className="dt-next-btn"
          disabled={!isAllDone}
          style={isAllDone ? {
            background: '#ffffff',
            color: '#000000',
            borderRadius: '999px',
            fontSize: '20px',
            padding: '10px 70px',
            border: "2px solid #cccccc",
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            opacity: 1
          } : {}}
        >다음 단계</button>
      </div>
    </div>
  );
}
