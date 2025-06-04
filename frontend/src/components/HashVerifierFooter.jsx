import React, { useState } from "react";

export default function HashVerifierFooter({ storedHash, onValid, onInvalid, disabled }) {
  const [verified, setVerified] = useState(null); // true, false, null
  const [isChecking, setIsChecking] = useState(false);

  const verifyHash = async (file) => {
    setIsChecking(true);
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    setIsChecking(false);
    if (hashHex === storedHash) {
      setVerified(true);
      if (onValid) onValid();
    } else {
      setVerified(false);
      if (onInvalid) onInvalid();
    }
  };

  const onFileChange = (e) => {
    if (e.target.files.length > 0) {
      verifyHash(e.target.files[0]);
    }
  };

  return (
    <div>
      <label style={{ cursor: disabled ? "not-allowed" : "pointer", color: disabled ? "#aaa" : "#007bff" }}>
        파일 업로드 (해시 검증)
        <input type="file" onChange={onFileChange} disabled={disabled} style={{ display: "none" }} />
      </label>
      {isChecking && <p>검증 중...</p>}
      {verified === true && <p style={{ color: "green" }}>해시가 일치합니다.</p>}
      {verified === false && <p style={{ color: "red" }}>해시가 일치하지 않습니다.</p>}
    </div>
  );
}
