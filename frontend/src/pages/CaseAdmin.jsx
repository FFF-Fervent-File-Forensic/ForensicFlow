import React, { useState, useEffect } from "react";
import styles from "../styles/CaseAdmin.module.css";
import { useParams } from 'react-router-dom';

export default function CaseAdmin() {
  const [cases, setCases] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [memberRoles, setMemberRoles] = useState({}); // member_id: role
  const [caseMembers, setCaseMembers] = useState([]); // 선택 사건 회원 (테이블용)
  const { caseId } = useParams();
  // 1) 사건 목록
  useEffect(() => {
    fetch("http://localhost:8000/getCaseList")
      .then(res => res.json())
      .then(data => setCases(data.cases || []))
      .catch(err => console.error("사건 목록 실패", err));
  }, []);

  // 2) 전체 회원 목록
  useEffect(() => {
    fetch("http://localhost:8000/getMemberList")
      .then(res => res.json())
      .then(data => {
        setMembers(
          data.members.map(m => ({
            member_id: m.id,
            name: m.member_name,
          }))
        );
      })
      .catch(err => console.error("회원 목록 실패", err));
  }, []);

  // 3) 선택한 사건에 대한 MemberCase 정보 가져오기
  useEffect(() => {
    fetch(`http://localhost:8000/getMembersByCase/${caseId}`)
      .then(res => res.json())
      .then(data => {
        const membersData = data.memberCases.map(mc => ({
          member_id: mc.member_id,
          name: mc.member_name,
          authority: mc.authority,
          mc_id: mc.mc_id
        }));

        // 상태 업데이트
        setCaseMembers(membersData);

        // memberRoles도 초기화
        const rolesMap = {};
        membersData.forEach(m => {
          rolesMap[m.member_id] = m.authority;
        });
        setMemberRoles(rolesMap);
      })
      .catch(err => console.error("회원-사건 정보 실패", err));
  }, [caseId]);

  // MemberCase 등록 (form submit)
  const handleAddMemberCase = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedAuthority) {
      alert("회원, 권한을 모두 선택해주세요.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/createMemberCase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selectedMemberId,
          case_id: caseId,
          authority: selectedAuthority,
        }),
      });

      if (!res.ok) throw new Error("권한 생성 실패");

      const data = await res.json();
      alert(`권한이 성공적으로 적용되었습니다. (ID: ${data.id})`);

      // 1) 새 MemberCase를 caseMembers에 바로 추가
      const memberInfo = members.find(m => m.member_id === selectedMemberId);
      setCaseMembers(prev => [
        ...prev,
        {
          member_id: selectedMemberId,
          name: memberInfo.name,
          authority: selectedAuthority,
          mc_id: data.id
        }
      ]);

      // 2) memberRoles 업데이트
      setMemberRoles(prev => ({
        ...prev,
        [selectedMemberId]: selectedAuthority
      }));

      // 선택 초기화
      setSelectedMemberId(null);
      setSelectedAuthority("");
    } catch (err) {
      console.error(err);
      alert("권한 적용 중 오류 발생");
    }
  };

  // 권한 변경
  const handleUpdateRole = async (member_id) => {
    const authority = memberRoles[member_id];
    try {
      const res = await fetch("http://localhost:8000/updateMemberCase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id,
          case_id: caseId,
          authority,
        }),
      });

      if (!res.ok) throw new Error("권한 수정 실패");
      const data = await res.json();

      // caseMembers 상태 업데이트
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

      {/* 사건 선택 + MemberCase 등록 */}
      <div className={styles.formRow}>
        <form onSubmit={handleAddMemberCase} className={styles.formRow}>
          <select
            value={selectedMemberId || ""}
            onChange={e => setSelectedMemberId(Number(e.target.value))}
            className={styles.select}
          >
            <option value="" disabled>회원 선택</option>
            {members.map(m => (
              <option key={m.member_id} value={m.member_id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAuthority || ""}
            onChange={e => setSelectedAuthority(e.target.value)}
            className={styles.select}
          >
            <option value="" disabled>권한 선택</option>
            <option value="readable">읽기</option>
            <option value="writeable">쓰기</option>
          </select>

          <button type="submit" className={styles.button}>
            적용
          </button>
        </form>
      </div>

      {/* 사건 회원 테이블 */}
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
                      [m.member_id]: e.target.value
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
                  className={styles.button}
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
