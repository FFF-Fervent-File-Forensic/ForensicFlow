import React, { useState } from "react";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const isFormValid = email.trim() !== "" && password.trim() !== "";

    const handleLogin = async () => {
        // 임시 로그인 (admin, pwd)
        if (email === "admin" && password === "pwd") {
            setErrorMessage("");
        } else {
            setErrorMessage(
                "이메일 또는 비밀번호가 잘못 되었습니다. 이메일과 비밀번호를 정확히 입력해 주세요."
            );
        }
    };

    return (
        <div className="center-wrapper">
            <div className="login-container">
                <img src="/logo.png" alt="FFF logo" className="logo-image" />
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
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button
                    className={`btn ${isFormValid ? "btn-active" : "btn-disabled"}`}
                    disabled={!isFormValid}
                    onClick={handleLogin}
                >
                    로그인
                </button>
                <div className="link-wrapper">
                    <a href="/signup" className="link">회원가입</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
