import React, { useState } from 'react';
import './Main.css';

function Main() {
  const [caseList, setCaseList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLegalUploadModal, setShowLegalUploadModal] = useState(false);
  const [legalFile, setLegalFile] = useState(null);

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
    const newCase = {
      id: formData.caseNumber,
      progress: progressStages[0].stage,
      progressPercent: progressStages[0].percent,
      ...formData,
    };

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

  return (
    <div className="main-container">
      <div className="header">
        <button className="register-button" onClick={() => setShowModal(true)}>
          ⊕ 사건 등록
        </button>
      </div>

      <div className="case-list">
        {caseList.length === 0 ? (
          <div className="empty-message">
            등록된 사건 폴더가 없습니다.<br />
            ‘사건 등록’ 버튼을 눌러 폴더를 생성해주세요
          </div>
        ) : (
          caseList.map((c) => (
            <div className="case-card" key={c.id}>
              <div className="folder-icon">📁</div>
              <div className="case-id">{c.id}</div>
              <div className="progress">{c.progress}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${c.progressPercent}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 사건 등록 모달 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="cancel-button" onClick={() => setShowModal(false)}>✖</button>
            <h2 className="modal-title">사건 등록</h2>
            <form className="form" onSubmit={e => { e.preventDefault(); handleAddCase(); }}>
              <div className="form-row">
                <div className="form-col">
                  <input
                    type="text"
                    name="caseNumber"
                    value={formData.caseNumber}
                    onChange={handleInputChange}
                    placeholder="사건 번호"
                    className="input-bottom-line"
                  />
                </div>
                <div className="form-col">
                  <input
                    type="text"
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleInputChange}
                    placeholder="사건 유형"
                    className="input-bottom-line"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="사건 발생 위치"
                    className="input-bottom-line"
                  />
                </div>
                <div className="form-col">
                  <label className="input-label">사건 발생 일시</label>
                  <input
                    type="datetime-local"
                    name="incidentDateTime"
                    value={formData.incidentDateTime}
                    onChange={handleInputChange}
                    className="input-bottom-line"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <label className="input-label">사건 개요</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    className="textarea-bottom-line"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <label className="input-label">관련자 정보</label>
                  <textarea
                    name="persons"
                    value={formData.persons}
                    onChange={handleInputChange}
                    className="textarea-bottom-line"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <input
                    type="text"
                    name="agency"
                    value={formData.agency}
                    onChange={handleInputChange}
                    placeholder="의뢰 기관"
                    className="input-bottom-line"
                  />
                </div>
                <div className="form-col">
                  <label className="input-label">의뢰 일시</label>
                  <input
                    type="datetime-local"
                    name="requestDateTime"
                    value={formData.requestDateTime}
                    onChange={handleInputChange}
                    className="input-bottom-line"
                  />
                </div>
              </div>
              <div className="form-row align-center">
                <label className="checkbox" onClick={() => setShowLegalUploadModal(true)}>
                  <input
                    type="checkbox"
                    name="legalPower"
                    checked={formData.legalPower}
                    readOnly
                  />
                  <div className="checkbox-text-group">
                    <div className="main-label">법적 권한</div>
                    <div className="subtext">압수수색영장, 피고인 사실확인서 등</div>
                  </div>
                </label>
                {formData.legalPower && legalFile && (
                  <div className="uploaded-file">
                    {legalFile.name}
                    <button className="remove-file-button" onClick={handleRemoveLegalFile}>✖</button>
                  </div>
                )}
                <button
                  className="add-button"
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
        <div className="modal-overlay">
          <div className="upload-modal">
            <button
              className="close-button"
              onClick={() => setShowLegalUploadModal(false)}
            >
              ✖
            </button>

            <label htmlFor="legalFileUpload" className="upload-box">
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
