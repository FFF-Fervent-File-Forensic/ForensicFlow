import React, { useState } from "react";
import styles from "../../styles/Login.module.css";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const isPasswordMatch = password === confirmPassword;
  const isFormFilled =
    name.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";
  const isFormValid = isFormFilled && isPasswordMatch && !isSubmitting; // 중복 전송 방지
  const handleSignup = async () => {
    if (!isPasswordMatch) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true); //중복 클릭 방지 시작

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
        setIsSubmitting(false); // 실패 시 다시 클릭 가능
        return;
      }

      alert("회원가입이 완료되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("회원가입 오류:", error);
      setErrorMessage("서버와 통신할 수 없습니다.");
      setIsSubmitting(false);
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
          {isSubmitting ? "처리 중..." : "회원가입"}
        </button>
      </div>
    </div>
  );
}

export default Signup;
