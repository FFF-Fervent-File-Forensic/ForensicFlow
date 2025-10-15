import React, { useState, useEffect } from "react";
import styles from "../styles/CaseAdmin.module.css";
import { useParams } from "react-router-dom";

export default function CaseAdmin() {
  const [cases, setCases] = useState([]);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [memberRoles, setMemberRoles] = useState({});
  const [caseMembers, setCaseMembers] = useState([]);
  const { caseId } = useParams();

  // 사건 목록
  useEffect(() => {
    fetch("http://localhost:8000/getCaseList")
      .then(res => res.json())
      .then(data => setCases(data.cases || []))
      .catch(err => console.error("사건 목록 실패", err));
  }, []);

  // 사건 관련 회원 정보
  useEffect(() => {
    fetch(`http://localhost:8000/getMembersByCase/${caseId}`)
      .then(res => res.json())
      .then(data => {
        const membersData = data.memberCases.map(mc => ({
          member_id: mc.member_id,
          name: mc.member_name,
          authority: mc.authority,
          mc_id: mc.mc_id,
        }));
        setCaseMembers(membersData);

        const rolesMap = {};
        membersData.forEach(m => {
          rolesMap[m.member_id] = m.authority;
        });
        setMemberRoles(rolesMap);
      })
      .catch(err => console.error("회원-사건 정보 실패", err));
  }, [caseId]);

  // 등록 (조회 + 등록)
  const handleAddMemberCase = async (e) => {
    e.preventDefault();

    if (!email || !selectedAuthority) {
      alert("이메일과 권한을 모두 입력해주세요.");
      return;
    }

    try {
      // 1️⃣ 이메일로 회원 조회
      const searchRes = await fetch(`http://localhost:8000/getMemberByEmail/${email}`);
      if (!searchRes.ok) {
        if (searchRes.status === 404) {
          alert("해당 회원은 존재하지 않습니다.");
          return;
        } else {
          throw new Error(`서버 오류: ${searchRes.status}`);
        }
      }
      const member = await searchRes.json();

      // 2️⃣ 회원 ID로 권한 등록
      const createRes = await fetch("http://localhost:8000/createMemberCase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: member.id,
          case_id: caseId,
          authority: selectedAuthority,
        }),
      });

      if (!createRes.ok) throw new Error("권한 생성 실패");
      const data = await createRes.json();

      // 3️⃣ UI 즉시 반영
      setCaseMembers(prev => [
        ...prev,
        {
          member_id: member.id,
          name: member.member_name,
          authority: selectedAuthority,
          mc_id: data.id,
        },
      ]);

      setMemberRoles(prev => ({
        ...prev,
        [member.id]: selectedAuthority,
      }));

      alert(`'${member.member_name}' 회원에게 '${selectedAuthority}' 권한이 등록되었습니다.`);

      // 상태 초기화
      setEmail("");
      setSelectedAuthority("");
    } catch (err) {
      console.error(err);
      alert("등록 중 오류 발생");
    }
  };

  // 권한 변경
  const handleUpdateRole = async (member_id) => {
    const authority = memberRoles[member_id];
    try {
      const res = await fetch("http://localhost:8000/updateMemberCase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id, case_id: caseId, authority }),
      });

      if (!res.ok) throw new Error("권한 수정 실패");
      const data = await res.json();

      setCaseMembers(prev =>
        prev.map(m =>
          m.member_id === member_id ? { ...m, authority } : m
        )
      );

      alert(`권한이 성공적으로 수정되었습니다. (ID: ${data.id})`);
    } catch (err) {
      console.error(err);
      alert("권한 수정 중 오류 발생");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>회원 권한 관리</h1>

      <div className={styles.formRow}>
        <form onSubmit={handleAddMemberCase} className={styles.formRow}>
          <input
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="회원 이메일 입력"
            className={styles.searchInput}
          />

          <select
            value={selectedAuthority || ""}
            onChange={e => setSelectedAuthority(e.target.value)}
            className={styles.select}
          >
            <option value="" disabled>권한 선택</option>
            <option value="readable">읽기</option>
            <option value="writeable">쓰기</option>
          </select>

          <button type="submit" className={styles.addButton}>
            등록
          </button>
        </form>
        {errorMsg && <div className={styles.error}>{errorMsg}</div>}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.alignLeft}>회원</th>
            <th className={styles.alignCenter}>권한</th>
            <th className={styles.alignCenter}>액션</th>
          </tr>
        </thead>
        <tbody>
          {caseMembers.map(m => (
            <tr key={m.member_id}>
              <td className={styles.alignLeft}>{m.name}</td>
              <td className={styles.alignCenter}>
                <select
                  value={memberRoles[m.member_id] || "none"}
                  onChange={e =>
                    setMemberRoles(prev => ({
                      ...prev,
                      [m.member_id]: e.target.value,
                    }))
                  }
                  className={styles.select}
                >
                  <option value="disabled" disabled>권한 선택</option>
                  <option value="readable">읽기</option>
                  <option value="writeable">쓰기</option>
                </select>
              </td>
              <td className={styles.alignCenter}>
                <button
                  className={styles.modifyButton}
                  onClick={() => handleUpdateRole(m.member_id)}
                  disabled={memberRoles[m.member_id] === "none"}
                >
                  수정
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
