import React, { useState } from "react";
import styles from "../styles/CaseAdmin.module.css";

export default function CaseAdmin() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("read");
  const [members, setMembers] = useState([
    { email: "creator@email.com", role: "owner" },
  ]);
  const [search, setSearch] = useState("");

  const addMember = () => {
    if (!email) return;
    setMembers([...members, { email, role }]);
    setEmail("");
    setRole("read");
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateRole = (index, newRole) => {
    const updated = [...members];
    updated[index].role = newRole;
    setMembers(updated);
  };

  const filteredMembers = members.filter((m) =>
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>사건 담당자 관리</h1>

      <div className={styles.formRow}>
        <div className={styles.leftGroup}>
          <input
            type="text"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={styles.select}
          >
            <option value="read">읽기</option>
            <option value="write">쓰기</option>
          </select>
          <button onClick={addMember} className={styles.addButton}>
            추가
          </button>
        </div>
        
        <input
          type="text"
          placeholder="이메일 검색 🔍"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.alignLeft}>이메일</th>
            <th className={styles.alignCenter}>권한</th>
            <th className={styles.alignCenter}>작업</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((m, idx) => (
            <tr key={idx}>
              <td className={styles.alignLeft}>{m.email}</td>
              <td className={styles.alignCenter}>
                {m.role === "owner" ? (
                  "생성자"
                ) : (
                  <select
                    value={m.role}
                    onChange={(e) => updateRole(idx, e.target.value)}
                    className={styles.select}
                  >
                    <option value="read">읽기</option>
                    <option value="write">쓰기</option>
                  </select>
                )}
              </td>
              <td className={styles.alignCenter}>
                {m.role !== "owner" && (
                  <button
                    onClick={() => removeMember(idx)}
                    className={styles.deleteButton}
                  >
                    삭제
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}