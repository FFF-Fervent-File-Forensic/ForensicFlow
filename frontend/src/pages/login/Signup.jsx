import React, { useState } from "react";
import "./Login.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isPasswordMatch = password === confirmPassword;
  const isFormFilled =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  const isFormValid = isFormFilled && isPasswordMatch;

  const handleSignup = () => {
    if (!isPasswordMatch) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    setErrorMessage("");
    // 추후 백엔드 연결 시 fetch("/api/signup") 등으로 연결하면 돼요!
    console.log("회원가입 성공 (프론트단 테스트)");
  };

  return (
    <div className="center-wrapper">
      <div className="login-container">
        <img src="/logo.png" alt="FFF logo" className="logo-image" />
        <input
          type="text"
          placeholder="이름"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="이메일"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          className="input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {!isPasswordMatch && (
          <div className="error-message">비밀번호가 일치하지 않습니다.</div>
        )}
        <button
          className={`btn ${isFormValid ? "btn-active" : "btn-disabled"}`}
          disabled={!isFormValid}
          onClick={handleSignup}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default Signup;
