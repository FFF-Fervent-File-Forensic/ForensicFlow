import React, { useState, useEffect } from "react";
import styles from "../styles/DataRegister.module.css";
import { useNavigate, useParams } from "react-router-dom";

export default function EvidenceManager() {
  const { caseId } = useParams();
  console.log("caseId", caseId);
  const CURRENT_CASEID = Number(caseId);
  console.log("CURRENT_CASEID", CURRENT_CASEID);
  const navigate = useNavigate();

  // -----------------------------
  // 상태 정의
  // -----------------------------
  const [EList, setEList] = useState([]); // Evidence ID 목록
  const [evidenceInfo, setEvidenceInfo] = useState([]); // 테이블 표시용 데이터
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 신규 증거 등록 관련 상태
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [showDataInputBox, setShowDataInputBox] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null); // { filename, hash }

  const [formData, setFormData] = useState({
    responsible_member: "",
    sign_file_path: "",
    evidence_user: "",
    type: "",
    manufactory: "",
    model_name: "",
    collect_location: "",
    store_location: "",
    unique_number: "",
    manufactory_date: "",
    collect_date: "",
  });

  // -----------------------------
  // Evidence 리스트 불러오기
  // -----------------------------
  useEffect(() => {
    const fetchEvidenceList = async () => {
      try {
        const res = await fetch(`http://localhost:8000/getEvidenceList/${CURRENT_CASEID}`);
        if (!res.ok) throw new Error("리스트 불러오기 실패");
        const list = await res.json();
        setEList(list.ids);
      } catch (err) {
        console.error("리스트 불러오기 오류:", err);
      }
    };
    fetchEvidenceList();
  }, []);

  // -----------------------------
  // Evidence 데이터 불러오기
  // -----------------------------
  useEffect(() => {
    const fetchEvidenceData = async () => {
      if (EList.length === 0) return;
      setIsLoading(true);
      try {
        const results = [];
        for (const id of EList) {
          const response = await fetch(`http://localhost:8000/getEvidence/${id}`);
          if (!response.ok) throw new Error(`ID ${id} 불러오기 실패`);
          const result = await response.json();
          results.push({
            name: result.evidence_name,
            type: result.type,
            date: result.collect_date,
          });
        }
        setEvidenceInfo(results);
      } catch (error) {
        console.error("Evidence 데이터 불러오기 오류:", error);
        alert("서버 통신 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvidenceData();
  }, [EList]);

  // -----------------------------
  // 파일 업로드 처리
  // -----------------------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/hashfile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("서버 응답 오류");
      const data = await response.json();

      console.log("서버로부터 받은 해시값:", data.sha256);
      setUploadedFileInfo({
        filename: file.name,
        hash: data.sha256,
      });

      // 업로드 완료 → 파일 입력창 닫고 데이터 입력창 열기
      setShowUploadBox(false);
      setShowDataInputBox(true);
    } catch (err) {
      console.error("파일 업로드 중 오류:", err);
      alert("파일 업로드 중 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 폼 입력 처리
  // -----------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------
  // Evidence 생성 처리
  // -----------------------------
  const handleCreateEvidence = async () => {
    const allFilled = Object.values(formData).every((v) => v !== "");
    if (!allFilled || !uploadedFileInfo) {
      alert("모든 입력을 완료해야 합니다.");
      return;
    }

    const evidenceData = {
      hash_value: uploadedFileInfo.hash,
      evidence_name: uploadedFileInfo.filename,
      responsible_member: formData.responsible_member,
      type: formData.type,
      evidence_user: formData.evidence_user,
      model_name: formData.model_name,
      collect_location: formData.collect_location,
      store_location: formData.store_location,
      unique_number: parseInt(formData.unique_number),
      manufactory_date: formData.manufactory_date,
      collect_date: formData.collect_date,
      sign_file_path: formData.sign_file_path,
      case_id: CURRENT_CASEID,
    };

    try {
      const res = await fetch("http://localhost:8000/createEvidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evidenceData),
      });

      if (!res.ok) throw new Error("DB 등록 실패");

      alert("신규 증거가 성공적으로 등록되었습니다.");
      
      
      // 새 데이터 반영 위해 테이블 갱신
      const newListRes = await fetch(`http://localhost:8000/getEvidenceList/${CURRENT_CASEID}`);
      const newList = await newListRes.json();
      setEList(newList.ids);

      // 입력창 닫기
      setShowDataInputBox(false);
      setUploadedFileInfo(null);
      setFormData({
        responsible_member: "",
        sign_file_path: "",
        evidence_user: "",
        type: "",
        manufactory: "",
        model_name: "",
        collect_location: "",
        store_location: "",
        unique_number: "",
        manufactory_date: "",
        collect_date: "",
      });
    } catch (err) {
      console.error("Evidence 등록 오류:", err);
      alert("DB 저장 중 문제가 발생했습니다.");
    }
  };

  // -----------------------------
  // UI 렌더링
  // -----------------------------
  return (
    <div className={styles.container} style={{ position: "relative" }}>
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
            {isLoading ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>
                  서버 응답 대기 중..
                </td>
              </tr>
            ) : evidenceInfo.length > 0 ? (
              evidenceInfo.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "#aaa" }}>
                  불러올 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.rightPane}>
        <button
          className={styles.addButton}
          onClick={async () => {
            try {
              const CURRENT_CASEID = localStorage.getItem("currentCaseID");

              if (!CURRENT_CASEID) {
                alert("현재 사건 ID를 찾을 수 없습니다.");
                return;
              }

              // 1️⃣ 현재 Case 데이터 가져오기
              const caseResponse = await fetch(`http://localhost:8000/getCase/${CURRENT_CASEID}`);
              const caseResult = await caseResponse.json();

              if (!caseResponse.ok) {
                alert("사건 정보를 불러오는 데 실패했습니다.");
                return;
              }

              console.log("현재 사건 데이터:", caseResult);

              // 2️⃣ 현재 present_stair 확인
              const currentStair = caseResult.present_stair;

              if (currentStair === "증거 수집 중") {
                // 3️⃣ present_stair 변경 요청
              const updateResponse = await fetch(`http://localhost:8000/updatePresentStair/${CURRENT_CASEID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ new_stair: "증거 이송 중" }),
              });

              const updateResult = await updateResponse.json();

              if (!updateResult.success) {
                alert("사건 단계 업데이트에 실패했습니다.");
                return;
              }

              console.log(`Case ${CURRENT_CASEID} present_stair → '증거 이송 중' 으로 변경됨`);
              }

              // 4️⃣ 페이지 이동
              navigate(`/transfer/${CURRENT_CASEID}`);

            } catch (error) {
              console.error("업데이트 중 오류 발생:", error);
              alert("서버와 통신 중 오류가 발생했습니다.");
            }
          }}
        >
          다음 단계
        </button>



        <button
          className={styles.addEvidenceButton}
          onClick={() => {
            setShowUploadBox(true);
          }}
        >
          신규 증거 등록
        </button>
      </div>


      {/* 업로드 박스 */}
      {showUploadBox && (
        <div className={styles.uploadBox}>
          <div className={styles.uploadBox2}>
            <div className={styles.fileDrop} onClick={() => document.getElementById('fileInput').click()}>
                파일을 업로드하세요.
                <input id="fileInput" type="file" style={{ display:'none'}} onChange={handleFileUpload} />
              </div>
            <br />
            <button className={styles.cancelButton} onClick={() => setShowUploadBox(false)}>취소</button>
          </div>
        </div>
      )}

      {showDataInputBox && (
        <div className={styles.overlay}>
          <div className={styles.evidenceDataInputBox}>
            <h2 className={styles.title}>
              신규 증거 등록
            </h2>

            <div className={styles.fileRow}>
              <label className={styles.fileLabel}>파일명 :</label>
              <input
                type="text"
                value={uploadedFileInfo?.filename || ""}
                readOnly
                className={styles.fileNameBox}
              />
            </div>

            <div className={styles.formGrid}>
              <div><label>담당자</label><input type="text" name="responsible_member" value={formData.responsible_member} onChange={handleInputChange} /></div>
              <div><label>사용자</label><input type="text" name="evidence_user" value={formData.evidence_user} onChange={handleInputChange} /></div>

              <div><label>서명</label><input type="text" name="sign_file_path" value={formData.sign_file_path} onChange={handleInputChange} /></div>
              <div><label>모델명</label><input type="text" name="model_name" value={formData.model_name} onChange={handleInputChange} /></div>

              <div><label>제조사</label><input type="text" name="manufactory" value={formData.manufactory} onChange={handleInputChange} /></div>
              <div><label>보관장소</label><input type="text" name="store_location" value={formData.store_location} onChange={handleInputChange} /></div>

              <div><label>종류</label><select name="type" value={formData.type} onChange={handleInputChange}><option value="">-- 선택 --</option><option value="USB">USB</option><option value="HDD">HDD</option><option value="SSD">SSD</option></select></div>

              <div><label>수집장소</label><input type="text" name="collect_location" value={formData.collect_location} onChange={handleInputChange} /></div>
              <div><label>수집일자</label><input type="date" name="collect_date" value={formData.collect_date} onChange={handleInputChange} /></div>

              <div><label>고유번호</label><input type="text" name="unique_number" value={formData.unique_number} onChange={handleInputChange} /></div>
              <div><label>제조일자</label><input type="date" name="manufactory_date" value={formData.manufactory_date} onChange={handleInputChange} /></div>
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.cancelBtn} onClick={() => setShowDataInputBox(false)}>취소</button>
              <button className={styles.submitBtn} onClick={handleCreateEvidence}>등록</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
