import React, { useState, useEffect } from 'react';
import styles from '../styles/DataTransfer.module.css';
import { useNavigate, useParams } from 'react-router-dom';

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
  const { caseId } = useParams();
  const CURRENT_CASEID = Number(caseId);

  // --------------------------
  // ① DB에서 데이터 불러오기
  // --------------------------
  useEffect(() => {
    const fetchEvidenceData = async () => {
      try {
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
          const result = await response.json();
          fetchedEvidence.push({
            id,
            name: result.evidence_name,
            type: result.type,
            date: result.collect_date,
          });

          const tRes = await fetch(`http://localhost:8000/getTransferInfoList/${id}`);
          const tList = await tRes.json();
          let transferStatus = "pending";
          let hashStatus = "disabled";
          let transferData = null;

          if (tList.ids && tList.ids.length > 0) {
            const tInfoRes = await fetch(`http://localhost:8000/getTransferInfo/${tList.ids[0]}`);
            const tInfo = await tInfoRes.json();
            transferData = tInfo;
            transferStatus = "done";
            hashStatus = tInfo.t_hash_validation_status ? "done" : "none";
          }

          rowStatesWithTransfer.push({
            transfer: transferStatus === "done" ? "정보 기입 완료" : "이송 정보 기입",
            transferStatus,
            hashStatus,
            transferData,
          });
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
  // 모달 관련
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

  // --------------------------
  // 이송 정보 등록
  // --------------------------
  const handleRegister = async () => {
    if (!isFormValid()) {
      alert("모든 필드를 입력해야 합니다.");
      return;
    }

    try {
      const evidence = evidenceInfo[modalIdx];
      if (!evidence) throw new Error("해당 증거 정보를 찾을 수 없습니다.");

      const caseRes = await fetch(`http://localhost:8000/getCase/${CURRENT_CASEID}`);
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

      setRowStates((states) =>
        states.map((item, i) =>
          i === modalIdx
            ? {
                ...item,
                transfer: "정보 기입 완료",
                transferStatus: "done",
                hashStatus: "none",
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
  // 해시 검증
  // --------------------------
  const openHashModal = (idx) => {
    setHashModalIdx(idx);
    document.body.style.overflow = 'hidden';
  };

  const closeHashModal = () => {
    setHashModalIdx(null);
    document.body.style.overflow = 'auto';
  };

  const handleHashVerify = async (file) => {
    try {
      const evidence = evidenceInfo[hashModalIdx];
      if (!evidence) {
        alert("해당 증거 정보를 찾을 수 없습니다.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("evidence_id", evidence.id);

      const verifyRes = await fetch("http://localhost:8000/verifyEvidenceHash", {
        method: "POST",
        body: formData,
      });

      if (!verifyRes.ok) throw new Error("해시 검증 요청 실패");
      const isSame = await verifyRes.json();

      if (isSame === true) {
        alert("✅ 해시 검증 완료!");
        const transferData = rowStates[hashModalIdx]?.transferData;
        if (transferData && transferData.id) {
          await fetch(`http://localhost:8000/toggleTransferHash/${transferData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: true })
          });
        }

        setRowStates((states) =>
          states.map((item, i) =>
            i === hashModalIdx ? { ...item, hashStatus: "done" } : item
          )
        );

        closeHashModal();
      } else {
        alert("❌ 해시가 일치하지 않습니다!");
        closeHashModal();
      }
    } catch (err) {
      console.error(err);
      alert("해시 검증 중 오류가 발생했습니다.");
    }
  };

  const isAllDone = rowStates.every(
    (item) => item.transferStatus === 'done' && item.hashStatus === 'done'
  );

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
      {/* 이송 정보 모달 */}
      {modalIdx !== null && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBackdrop} onClick={closeModal} />
          <div className={styles.modalContent}>
            <h3>이송 정보 입력</h3>

            <input
              type="text"
              placeholder="출발위치"
              value={form.출발위치}
              onChange={(e) => handleFormChange("출발위치", e.target.value)}
            />
            <input
              type="text"
              placeholder="도착위치"
              value={form.도착위치}
              onChange={(e) => handleFormChange("도착위치", e.target.value)}
            />
            <input
              type="datetime-local"
              value={form.이송일시}
              onChange={(e) => handleFormChange("이송일시", e.target.value)}
            />
            <input
              type="datetime-local"
              value={form.도착일시}
              onChange={(e) => handleFormChange("도착일시", e.target.value)}
            />
            <input
              type="text"
              placeholder="발신자"
              value={form.발신자}
              onChange={(e) => handleFormChange("발신자", e.target.value)}
            />
            <input
              type="text"
              placeholder="발신자 연락처"
              value={form.발신자연락처}
              onChange={(e) => handleFormChange("발신자연락처", e.target.value)}
            />
            <input
              type="text"
              placeholder="이송자"
              value={form.이송자}
              onChange={(e) => handleFormChange("이송자", e.target.value)}
            />
            <input
              type="text"
              placeholder="이송자 연락처"
              value={form.이송자연락처}
              onChange={(e) => handleFormChange("이송자연락처", e.target.value)}
            />
            <input
              type="text"
              placeholder="수령자"
              value={form.수령자}
              onChange={(e) => handleFormChange("수령자", e.target.value)}
            />
            <input
              type="text"
              placeholder="수령자 연락처"
              value={form.수령자연락처}
              onChange={(e) => handleFormChange("수령자연락처", e.target.value)}
            />
            <input
              type="text"
              placeholder="담당자"
              value={form.담당자}
              onChange={(e) => handleFormChange("담당자", e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFormChange("이미지", e.target.files[0])}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSignatureFile(e.target.files[0])}
            />

            <div className={styles.formButtons}>
              <button onClick={handleRegister}>등록</button>
              <button onClick={closeModal}>취소</button>
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
            <input
              id="verifyFileInput"
              type="file"
              accept="*/*"
              className={styles.hiddenInput}
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleHashVerify(e.target.files[0]);
                }
              }}
            />
            <div
              className={styles.fileDropTransferImage}
              onClick={() => document.getElementById("verifyFileInput").click()}
            >
              해시 검증을 위해 파일을 업로드하세요.
            </div>
            <div className={styles.formButtonsHashModal}>
              <button onClick={closeHashModal}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 테이블 */}
      <table className={styles.dtTable}>
        <thead>
          <tr>
            <th>이름</th>
            <th>종류</th>
            <th>수집 일시</th>
            <th>이송 정보</th>
            <th>해시 검증</th>
          </tr>
        </thead>
        <tbody>
          {evidenceInfo.map((item, idx) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.date}</td>
              <td>
                {rowStates[idx]?.transferStatus === 'done' ? (
                  <span className={styles.dtStatusOk}>
                    <span className={styles.dtIconOk}>✔</span> {rowStates[idx]?.transfer}
                  </span>
                ) : (
                  <button className={styles.dtBtnBlue} onClick={() => openModal(idx)}>
                    {rowStates[idx]?.transfer}
                  </button>
                )}
              </td>
              <td>
                {rowStates[idx]?.hashStatus === 'done' ? (
                  <span className={styles.dtStatusOk}>
                    <span className={styles.dtIconOk}>✔</span>
                  </span>
                ) : rowStates[idx]?.hashStatus === 'none' ? (
                  <button className={styles.dtBtnBlue} onClick={() => openHashModal(idx)}>
                    해시 검증
                  </button>
                ) : (
                  <span className={styles.dtStatusFail}>✖</span>
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
          onClick={async () => {
            try {
              const CURRENT_CASEID = localStorage.getItem("currentCaseID");

              if (!CURRENT_CASEID) {
                alert("현재 사건 ID를 찾을 수 없습니다.");
                return;
              }

              // 1️⃣ 현재 Case 정보 가져오기
              const caseResponse = await fetch(`http://localhost:8000/getCase/${CURRENT_CASEID}`);
              const caseData = await caseResponse.json();

              if (!caseData || !caseData.present_stair) {
                alert("사건 정보를 불러오지 못했습니다.");
                navigate(`/analyze/${CURRENT_CASEID}`); // 정보가 없어도 페이지는 이동
                return;
              }

              console.log(`현재 사건 단계: ${caseData.present_stair}`);

              // 2️⃣ present_stair가 "증거 이송 중"일 경우만 갱신
              if (caseData.present_stair === "증거 이송 중") {
                const updateResponse = await fetch(`http://localhost:8000/updatePresentStair/${CURRENT_CASEID}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ new_stair: "증거 분석 중" }),
                });

                const updateResult = await updateResponse.json();

                if (!updateResult.success) {
                  console.warn("사건 단계 업데이트에 실패했습니다.");
                } else {
                  console.log(`Case ${CURRENT_CASEID} present_stair → '증거 분석 중' 으로 변경됨`);
                }
              } else {
                console.log(`현재 단계(${caseData.present_stair})가 '증거 이송 중'이 아니므로 갱신 생략`);
              }

              // 3️⃣ 페이지 이동 (조건과 관계없이 항상)
              navigate(`/analyze/${CURRENT_CASEID}`);

            } catch (error) {
              console.error("업데이트 중 오류 발생:", error);
              alert("서버와 통신 중 오류가 발생했습니다.");
              navigate(`/analyze/${CURRENT_CASEID}`); // 오류가 있어도 페이지는 이동
            }
          }}
        >
          다음 단계
        </button>


      </div>
    </div>
  );
}
