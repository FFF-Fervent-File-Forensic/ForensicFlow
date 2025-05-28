import React, { useState } from "react";
import styles from "../../styles/Login.module.css";

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
    console.log("회원가입 성공 (프론트단 테스트)");
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
        {!isPasswordMatch && (
          <div className={styles["error-message"]}>비밀번호가 일치하지 않습니다.</div>
        )}
        <button
          className={`${styles["btn"]} ${isFormValid ? styles["btn-active"] : styles["btn-disabled"]}`}
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