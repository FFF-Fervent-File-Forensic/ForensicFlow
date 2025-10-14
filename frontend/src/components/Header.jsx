import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/Header.module.css';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMaster, setIsMaster] = useState(false);
  const [presentStair, setPresentStair] = useState(null);
  const [caseId, setCaseId] = useState(null);

  useEffect(() => {
    async function fetchCase() {
      const storedCaseId = sessionStorage.getItem('caseId');
      if (!storedCaseId) {
        navigate('/main');
        return;
      }
      setCaseId(storedCaseId);

      try {
        // 사건 정보
        const caseRes = await fetch('http://localhost:8000/getCase/' + storedCaseId);
        const caseResponse = await caseRes.json();
        setPresentStair(caseResponse.present_stair);

        // 현재 로그인된 유저 id
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const memId = user?.member_id ?? null;

        // 사건에 대한 memberCase 목록(응답 예시: { memberCases: [ {...} ] })

        const authorRes = await fetch('http://localhost:8000/getMembersByCase/' + storedCaseId);
        const authorResponse = await authorRes.json();

        // 안전하게 배열 취득
        const memberCases = authorResponse?.memberCases || [];

        // 현재 유저의 memberCase 찾기
        const myEntry = memberCases.find(mc => Number(mc.member_id) === Number(memId));

        // authority가 'master'인지 검사해서 상태로 저장
        setIsMaster(Boolean(myEntry && myEntry.authority === 'master'));

      } catch (err) {
        console.error(err);
        navigate('/main');
      }
    }

    fetchCase();
  }, [navigate]);

  // presentStair에 따라 활성화/비활성화 결정
  const isLinkEnabled = (linkName) => {
    if (!presentStair) return false;

    switch (presentStair) {
      case '증거 수집 중':
        return linkName === '홈' || linkName === '사건 등록' || linkName === '증거 등록';
      case '증거 이송 중':
        return ['홈', '사건 등록', '증거 등록', '증거 이송 및 보관'].includes(linkName);
      case '증거 분석 중':
        return ['홈', '사건 등록', '증거 등록', '증거 이송 및 보관', '증거 분석'].includes(linkName);
      case '완료':
        return true;
      default:
        return false;
    }
  };

  const navLinks = [
    { name: '홈', path: '/main/' },
    { name: '사건 등록', path: '/caseinfo/' },
    { name: '증거 등록', path: '/register/' },
    { name: '증거 이송 및 보관', path: '/transfer/' },
    { name: '증거 분석', path: '/analyze/' },
    { name: '결과 보고서', path: '/reportPage/' },
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navLinks}>
          {navLinks.map((link) => {
            const enabled = isLinkEnabled(link.name);
            const fullPath = (() => {
              if (link.name === '홈') return link.path; // 홈은 caseId 없이
              return caseId ? `${link.path}${caseId}` : link.path;
            })();

            return (
              <Link
                key={link.name}
                to={enabled ? fullPath : '#'}
                className={`${styles.navLink} 
                  ${!enabled ? styles.disabled : ''} 
                  ${enabled && location.pathname.startsWith(link.path) ? styles.active : ''}`}
                onClick={(e) => {
                  if (!enabled) e.preventDefault(); // 비활성화 클릭 막기
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {isMaster && (
          <Link
            to={caseId ? `/admin/${caseId}` : "/admin"}
            className={styles.adminButton}
            title="관리자 페이지"
          >
            ⚙️
          </Link>
        )}
      </nav>
    </header>
  );
}
