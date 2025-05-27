import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AnalysisStepTable.css";

export default function AnalysisStepTable() {
//   const [data, setData] = useState([]);
const data = [{
    "name": "CASE001_USB01_E01.img",
    "owner": "임윤수",
    "collectedAt": "2025.05.15",
    "completed": true
  }]
  
//   useEffect(() => {
//     // 예시 URL입니다. 실제 API 엔드포인트에 맞게 변경하세요.
//     axios.get("/api/analysis-items")
//       .then((response) => {
//         setData(response.data);
//       })
//       .catch((error) => {
//         console.error("데이터 로딩 오류:", error);
//       });
//   }, []);
  const navigate = useNavigate();


  const handleClick = () => {
    navigate("/Analyzeinput");
  };

  return (
    <div className="analysis-container">
      <table className="analysis-table">
        <thead>
          <tr>
            <th className="align-left">이름</th>
            <th className="align-center">담당자</th>
            <th className="align-center">수집 일시</th>
            <th className="align-center">입력 완료</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (<tr key={idx}>
              <td className="align-left">
                <div className="file-row">
                  <span>{item.name}</span>
                  <button className="input-button" onClick={handleClick}>
                    입력
                  </button>
                </div>
              </td>
              <td className="align-center">{item.owner}</td>
              <td className="align-center">{item.collectedAt}</td>
              <td className="align-center check-cell">{item.completed ? "✔" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="footer">
        <button className="next-button" disabled>
          다음단계
        </button>
      </div>
    </div>
  );
}
