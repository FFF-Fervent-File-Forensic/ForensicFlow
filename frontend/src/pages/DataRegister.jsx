import React, { useState } from 'react';
import styles from '../styles/DataRegister.module.css';
import { useNavigate } from 'react-router-dom';
import { useEvidence } from '../contexts/EvidenceContext';

export default function EvidenceManager() {
  const { evidenceList, setEvidenceList } = useEvidence();

  const [isUploadUIVisible, setIsUploadUIVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const initialFormData = {
    name: '',
    hash: '',
    size: '',
    type: '',
    담당자: '',
    사용자: '',
    증거종류: '',
    제조사: '',
    모델명: '',
    수집장소: '',
    제조일시: '',
    보관장소: '',
    고유번호: '',
    수집일시: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fakeHash = file.name;
      const sizeInGB = (file.size / (1024 ** 3)).toFixed(2);
      setSelectedFile(file);
      setFormData({
        ...initialFormData,
        name: file.name,
        hash: fakeHash,
        size: `${sizeInGB} GB`,
      });
    }
  };

  const handleRegisterClick = () => {
    if (formData?.name && formData?.type && formData?.수집일시) {
      const dateObj = new Date(formData.수집일시);
      const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;
      setEvidenceList([
        ...evidenceList,
        {
          name: formData.name,
          type: formData.type,
          date: formattedDate
        }
      ]);
      setSelectedFile(null);
      setFormData(initialFormData);
      setIsUploadUIVisible(false);
      setSignatureFile(null);
    }
  };

  const requiredFields = [
    '담당자', '사용자', 'type', '제조사', '모델명', '수집장소', '보관장소', '고유번호', '제조일시', '수집일시'
  ];
  const isFormValid = requiredFields.every(key => formData[key] && formData[key] !== '') && !!signatureFile;

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
            {evidenceList.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.rightPane}>
        {!isUploadUIVisible ? (
          <button className={styles.addButton} onClick={() => setIsUploadUIVisible(true)}>
            + 신규 증거 등록
          </button>
        ) : (
          <div className={styles.uploadBox}>
            <p className={styles.uploadTitle}>증거 신규 등록</p>
            {!selectedFile ? (
              <div className={styles.fileDrop} onClick={() => document.getElementById('fileInput').click()}>
                파일을 업로드하세요.
                <input id="fileInput" type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
              </div>
            ) : (
              <div className={styles.fileInfoForm}>
                <p><strong>이름:</strong> {formData.name}</p>
                <p><strong>해시:</strong> {formData.hash}</p>
                <p><strong>용량:</strong> {formData.size}</p>
                <div className={styles.inputRow} style={{ gap: '8px' }}>
                  <label className={styles.inputLabel}>담당자</label>
                  <input className={styles.inputField} value={formData.담당자} onChange={e => setFormData({ ...formData, 담당자: e.target.value })} />
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
                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>사용자</label>
                  <input className={styles.inputField} value={formData.사용자} onChange={e => setFormData({ ...formData, 사용자: e.target.value })} />
                </div>
                <label>
                  종류:
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="">선택</option>
                    <option value="USB">USB</option>
                    <option value="HDD">HDD</option>
                    <option value="SSD">SSD</option>
                  </select>
                </label>
                <div className={styles.row}>
                  <div className={styles.inputRow}>
                    <label className={styles.inputLabel}>제조사</label>
                    <input className={styles.inputField} value={formData.제조사} onChange={e => setFormData({ ...formData, 제조사: e.target.value })} />
                  </div>
                  <div className={styles.inputRow}>
                    <label className={styles.inputLabel}>모델명</label>
                    <input className={styles.inputField} value={formData.모델명} onChange={e => setFormData({ ...formData, 모델명: e.target.value })} />
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.inputRow}>
                    <label className={styles.inputLabel}>수집장소</label>
                    <input className={styles.inputField} value={formData.수집장소} onChange={e => setFormData({ ...formData, 수집장소: e.target.value })} />
                  </div>
                  <div className={styles.inputRow}>
                    <label className={styles.inputLabel}>보관장소</label>
                    <input className={styles.inputField} value={formData.보관장소} onChange={e => setFormData({ ...formData, 보관장소: e.target.value })} />
                  </div>
                </div>
                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>고유번호</label>
                  <input className={styles.inputField} value={formData.고유번호} onChange={e => setFormData({ ...formData, 고유번호: e.target.value })} />
                </div>
                <label style={{ marginTop: '8px', marginBottom: '2px' }}>제조일시:</label>
                <input type="datetime-local" value={formData.제조일시} onChange={e => setFormData({ ...formData, 제조일시: e.target.value })} />
                <label style={{ marginTop: '8px', marginBottom: '2px' }}>수집일시:</label>
                <input type="datetime-local" value={formData.수집일시} onChange={e => setFormData({ ...formData, 수집일시: e.target.value })} />
                <div className={styles.formButtons}>
                  <button onClick={() => {
                    setIsUploadUIVisible(false);
                    setSelectedFile(null);
                    setFormData(initialFormData);
                    setSignatureFile(null);
                  }}>취소</button>
                  <button
                    onClick={handleRegisterClick}
                    disabled={!isFormValid}
                    style={{
                      backgroundColor: isFormValid ? '#007bff' : '#ccc',
                      color: isFormValid ? '#fff' : '#888'
                    }}
                  >등록</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.bottomButton}>
        <button onClick={() => navigate('/transfer')}>다음 단계</button>
      </div>
    </div>
  );
}
