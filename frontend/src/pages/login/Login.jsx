import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/Login.module.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const isFormValid = email.trim() !== "" && password.trim() !== "";

    const handleLogin = async () => {
        if (!isFormValid) return;

        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login_email: email,
                    login_password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("로그인 성공:", data);
                localStorage.setItem("member_id", data.member_id);
                localStorage.setItem("member_name", data.member_name);
                navigate("/main");
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.detail || "로그인 실패");
            }
        } catch (error) {
            console.error("로그인 요청 오류:", error);
            setErrorMessage("서버 연결에 실패했습니다.");
        }
    };

    return (
        <div className={styles["center-wrapper"]}>
            <div className={styles["login-container"]}>
                <img src="/logo.png" alt="FFF logo" className={styles["logo-image"]} />
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
                {errorMessage && <div className={styles["error-message"]}>{errorMessage}</div>}
                <button
                    className={`${styles["btn"]} ${isFormValid ? styles["btn-active"] : styles["btn-disabled"]}`}
                    disabled={!isFormValid}
                    onClick={handleLogin}
                >
                    로그인
                </button>

                <div className={styles["link-wrapper"]}>
                    <Link to="/signup" className={styles["link"]}>회원가입</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;