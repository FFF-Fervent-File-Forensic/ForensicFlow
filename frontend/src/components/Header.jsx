import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/Header.module.css';

export default function Header() {
  const location = useLocation();
  const isMaster = true; //임의 master 지정.

  const navLinks = [
    { name: '홈', path: '/main' }, // Main.jsx
    { name: '사건 등록', path: ' ' }, // 사전 정보 확인 페이지 별도 추가 필요.
    { name: '증거 등록', path: '/register' }, // DataRegister.jsx
    { name: '증거 이송 및 보관', path: '/transfer' }, // DataTransfer.jsx
    { name: '증거 분석', path: '/analyze' }, // Analyze.jsx
    { name: '결과 보고서', path: '/reportPage' }, // ReportPage.jsx
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`${styles.navLink} ${
                location.pathname.startsWith(link.path) ? styles.disabled : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {isMaster && (
          <Link to="/admin" className={styles.adminButton} title="관리자 페이지">
            ⚙️
          </Link>
        )}
      </nav>
    </header>
  );
}
