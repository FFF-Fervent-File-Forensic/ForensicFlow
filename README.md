# ForensicFlow

포렌식 절차 지원 웹 사이트 개발 


### 조원

> 남인혁, 임윤수, 박정현

---

### Commit Convention

```bash
'feat': 기능 구현
'fix': 버그 수정
'style': 코드 / UI 스타일 개선
'refactor': 코드 구조 개선

Commit 예시
- style: addFolder 버튼 크기 수정
- refactor: 로그인 폼 코드 중복 제거
```

---

### Getting Started

**git clone**
```bash
git.clone git@github.com:FFF-Fervent-File-Forensic/ForensicFlow.git
```
**라이브러리 설치**
```bash
cd frontend
npm install
```
**개발 서버 실행**
```bash
npm start

cd ../backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

