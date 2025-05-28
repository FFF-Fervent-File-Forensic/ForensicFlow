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
        if (email === "admin" && password === "pwd") {
            setErrorMessage("");
            navigate("/main");
        } else {
            setErrorMessage(
                "이메일 또는 비밀번호가 잘못 되었습니다. 이메일과 비밀번호를 정확히 입력해 주세요."
            );
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