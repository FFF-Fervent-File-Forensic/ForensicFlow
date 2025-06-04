import React, { useState } from "react";

export default function HashGeneratorHeader({ onHashCalculated }) {
  const [hash, setHash] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateHash = async (file) => {
    setIsCalculating(true);
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    setHash(hashHex);
    setIsCalculating(false);
    if (onHashCalculated) onHashCalculated(hashHex);
  };

  const onFileChange = (e) => {
    if (e.target.files.length > 0) {
      calculateHash(e.target.files[0]);
    }
  };

  return (
    <div>
      <label style={{ cursor: "pointer", color: "#007bff" }}>
        파일 업로드 (해시 생성)
        <input type="file" onChange={onFileChange} style={{ display: "none" }} />
      </label>
      {isCalculating && <p>해시 계산 중...</p>}
      {hash && <p>생성된 해시: {hash}</p>}
    </div>
  );
}
