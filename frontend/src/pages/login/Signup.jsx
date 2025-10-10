import React, { useState } from "react";
import styles from "../../styles/Login.module.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const isPasswordMatch = password === confirmPassword;
  const isFormFilled =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";
  const isFormValid = isFormFilled && isPasswordMatch;

  const handleSignup = async () => {
    if (!isPasswordMatch) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/createMember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_email: email,
          login_password: password,
          member_name: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail || "회원가입 실패");
        return;
      }

      alert("회원가입이 완료되었습니다!");
      navigate("/"); // 회원가입 후 로그인 페이지로 이동
    } catch (error) {
      console.error("회원가입 오류:", error);
      setErrorMessage("서버와 통신할 수 없습니다.");
    }
  };

  return (
    <div className={styles["center-wrapper"]}>
      <div className={styles["login-container"]}>
        <img src="/logo.png" alt="FFF logo" className={styles["logo-image"]} />
        <input
          type="text"
          placeholder="이름"
          className={styles["input"]}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="이메일"
          className={styles["input"]}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className={styles["input"]}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          className={styles["input"]}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errorMessage && (
          <div className={styles["error-message"]}>{errorMessage}</div>
        )}
        <button
          className={`${styles["btn"]} ${
            isFormValid ? styles["btn-active"] : styles["btn-disabled"]
          }`}
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
