import React, { useState } from 'react';
import styles from '../styles/DataRegister.module.css';
import { useNavigate } from 'react-router-dom';
import { useEvidence } from '../contexts/EvidenceContext';
import { calculateHash } from '../components/HashGeneratorHeader';

export default function EvidenceManager() {
  const { evidenceInfo, addEvidence } = useEvidence();

  const [isUploadUIVisible, setIsUploadUIVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [formData, setFormData] = useState({
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
  });

  const navigate = useNavigate();

  const requiredFields = ['담당자', '사용자', 'type', '제조사', '모델명', '수집장소', '보관장소', '고유번호', '제조일시', '수집일시'];
  const isFormValid = requiredFields.every((key) => formData[key] && formData[key] !== '') && !!signatureFile && !!formData.hash;

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const sizeInGB = (file.size / (1024 ** 3)).toFixed(2);
      const hash = await calculateHash(file);
      setFormData((prev) => ({
        ...prev,
        name: file.name,
        size: `${sizeInGB} GB`,
        hash,
      }));
    }
  };

  const handleHashCalculated = (hash) => {
    setFormData((prev) => ({
      ...prev,
      hash,
    }));
  };

  const handleRegisterClick = () => {
    if (!isFormValid) {
      alert('필수 항목을 모두 입력하고 서명 및 파일 업로드를 완료해주세요.');
      return;
    }
    const dateObj = new Date(formData.수집일시);
    const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}`;

    const evidenceItem = {
      name: formData.name,
      type: formData.type,
      date: formattedDate,
      hash: formData.hash,
      size: formData.size,
      담당자: formData.담당자,
      사용자: formData.사용자,
      증거종류: formData.증거종류,
      제조사: formData.제조사,
      모델명: formData.모델명,
      수집장소: formData.수집장소,
      제조일시: formData.제조일시,
      보관장소: formData.보관장소,
      고유번호: formData.고유번호,
      서명파일: signatureFile,
    };

    addEvidence(evidenceItem);
    setSelectedFile(null);
    setFormData({
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
    });
    setSignatureFile(null);
    setIsUploadUIVisible(false);
  };

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
            {(evidenceInfo || []).map((item, idx) => (
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
            {!selectedFile ? (
              <div className={styles.fileDrop} onClick={() => document.getElementById('fileInput').click()}>
                파일을 업로드하세요.
                <input id="fileInput" type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
              </div>
            ) : (
              <>
                <p><strong>이름:</strong> {formData.name}</p>
                <p><strong>용량:</strong> {formData.size}</p>
                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>해시값</label>
                  <div style={{
                    wordBreak: 'break-all'
                  }}>
                    {formData.hash || '아직 생성되지 않았습니다.'}
                  </div>
                </div>
                <div className={styles.inputRow} style={{ gap: '8px' }}>
                  <label className={styles.inputLabel}>담당자</label>
                  <input className={styles.inputField} value={formData.담당자} onChange={e => setFormData({ ...formData, 담당자: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => document.getElementById('signatureInput').click()}
                    style={{ padding: '6px 20px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >
                    서명
                  </button>
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
                {signatureFile && <div style={{ fontSize: '13px', color: '#007bff', marginBottom: '4px' }}>첨부된 서명: {signatureFile.name}</div>}

                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>사용자</label>
                  <input className={styles.inputField} value={formData.사용자} onChange={e => setFormData({ ...formData, 사용자: e.target.value })} />
                </div>

                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>종류</label>
                  <select
                    className={styles.inputField}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="">선택</option>
                    <option value="USB">USB</option>
                    <option value="HDD">HDD</option>
                    <option value="SSD">SSD</option>
                  </select>
                </div>

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


                <div className={styles.inputRow}>
                  <label className={styles.inputLabel}>제조일시:</label>
                  <input
                    type="datetime-local"
                    value={formData.제조일시}
                    onChange={e => setFormData({ ...formData, 제조일시: e.target.value })}
                    className={styles.inputField}
                  />
                </div>

                <div className={styles.inputRow} style={{ marginTop: '10px' }}>
                  <label className={styles.inputLabel}>수집일시:</label>
                  <input
                    type="datetime-local"
                    value={formData.수집일시}
                    onChange={e => setFormData({ ...formData, 수집일시: e.target.value })}
                    className={styles.inputField}
                  />
                </div>



                <div className={styles.formButtons}>
                  <button onClick={() => {
                    setIsUploadUIVisible(false);
                    setSelectedFile(null);
                    setFormData({
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
                    });
                    setSignatureFile(null);
                  }}>취소</button>
                  <button
                    onClick={handleRegisterClick}
                    disabled={!formData.hash}
                    style={{
                      backgroundColor: isFormValid ? '#007bff' : '#ccc',
                      color: isFormValid ? '#fff' : '#888'
                    }}
                  >등록</button>
                </div>
              </>
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
