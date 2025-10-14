from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request, Body
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
from datetime import datetime
from pathlib import Path
import uuid
import shutil
from typing import List
from datetime import datetime, date
import hashlib
import backend

app = FastAPI()

# 1) 업로드 루트 절대경로 + 폴더 미리 생성
UPLOAD_BASE = Path(os.environ.get("UPLOAD_BASE", "uploads")).resolve()
UPLOAD_BASE.mkdir(parents=True, exist_ok=True)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CaseCreate(BaseModel):
    case_number: str
    case_type: str
    case_overview: str
    present_stair: str
    doc_file_path: str
    case_occur_location: str
    case_occur_date: datetime
    commission_agency: str
    commission_date: datetime
    related_person_info: str

class EvidenceCreate(BaseModel):
    hash_value: str
    evidence_name: str
    responsible_member: str
    type: str
    evidence_user: str
    model_name: str
    collect_location: str
    store_location: str
    unique_number: int
    manufactory_date: date
    collect_date: date
    sign_file_path: str
    case_id: int

class AnalysisCreate(BaseModel):
    analysis_location: str
    analysis_manager: str
    analysis_tool: str
    analysis_list: str
    analysis_process: str
    analysis_result: str
    analysis_filt_path: str
    a_hash_validation_status: bool
    complete_status: bool
    evidence_id: int

class TransferCreate(BaseModel):
    case_number: int
    t_hash_validation_status: bool
    departure_location: str
    departure_date: date
    arrival_location: str
    arrival_date: date
    sender: str
    sender_contact: str
    receiver: str
    receiver_contact: str
    transfer_manager: str
    transfer_manager_contact: str
    responsible_member: str
    responsible_member_sign: str
    image_file_path: str
    evidence_id: int

class MemberCreate(BaseModel):
    login_email: str
    login_password: str
    member_name: str

class MemberCaseCreate(BaseModel):
    member_id: int
    case_id: int
    authority: str

class LoginRequest(BaseModel):
    login_email: str
    login_password: str

class UpdateMemberCaseRequest(BaseModel):
    member_id: int
    case_id: int
    authority: str

@app.post("/hashfile")
def hash_file(file: UploadFile = File(...)):
    sha256 = hashlib.sha256()
    content = file.file.read()
    sha256.update(content)
    return {"sha256": sha256.hexdigest()}

@app.post("/createCase")
def create_case(case: CaseCreate):
    try:
        new_case = backend.createCase(**case.dict())
        return new_case.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getCaseList")
def get_case_list():
    try:
        cases = backend.getCaseList()
        return {"cases": cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getCase/{case_id}")
def get_case(case_id: int):
    try:
        case = backend.getCase(case_id)
        if not case:
            raise HTTPException(status_code=404, detail="Case not found")
        return case
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/deleteCase/{case_id}")
def delete_case(case_id: int):
    try:
        result = backend.deleteCase(case_id)
        if not result:
            raise HTTPException(status_code=404, detail="Case not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 특정 Case의 present_stair 값을 변경
@app.put("/updatePresentStair/{case_id}")
def update_present_stair(case_id: int, payload: dict = Body(...)):
    success = backend.updateCasePresentStair(case_id, payload["new_stair"])
    return {"success": success}


# =================
# == Evidence 엔드포인트 ==
# =================

@app.post("/createEvidence")
def create_evidence(evidence: EvidenceCreate):
    try:
        new_evidence = backend.createEvidence(**evidence.dict())
        return new_evidence.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getEvidenceList/{case_id}")
def get_evidence_list(case_id: int):
    try:
        ids = backend.getEvidenceList(case_id)
        return {"ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getEvidence/{evidence_id}")
def get_evidence(evidence_id: int):
    try:
        data = backend.getEvidence(evidence_id)
        if not data:
            raise HTTPException(status_code=404, detail="Evidence not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/deleteEvidence/{evidence_id}")
def delete_evidence(evidence_id: int):
    try:
        result = backend.deleteEvidence(evidence_id)
        if not result:
            raise HTTPException(status_code=404, detail="Evidence not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verifyEvidenceHash")
async def verify_evidence_hash(evidence_id: int = Form(...), file: UploadFile = File(...)):
    return backend.isSameHash(evidence_id, file)

# ===============================
# == TransferInformation 엔드포인트 ==
# ===============================

@app.post("/createTransfer")
def create_transfer(transfer: TransferCreate):
    try:
        new_transfer = backend.createTransferInfo(**transfer.dict())
        return new_transfer.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getTransferInfoList/{evidence_id}")
def get_transfer_info_list(evidence_id: int):
    try:
        ids = backend.getTransferInfoList(evidence_id)
        return {"ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getTransferInfo/{transfer_id}")
def get_transfer_info(transfer_id: int):
    try:
        data = backend.getTransferInfo(transfer_id)
        if not data:
            raise HTTPException(status_code=404, detail="TransferInfo not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/deleteTransferInfo/{transfer_id}")
def delete_transfer_info(transfer_id: int):
    try:
        result = backend.deleteTransferInfo(transfer_id)
        if not result:
            raise HTTPException(status_code=404, detail="TransferInfo not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ToggleHashRequest(BaseModel):
    value: bool

# 특정 TransferInformation의 t_hash_validation_status 값을 True 또는 False로 변경
@app.put("/toggleTransferHash/{transfer_id}")
def toggle_transfer_hash(transfer_id: int, payload: dict = Body(...)):
    success = backend.toggleTransformHash(transfer_id, payload["value"])
    return {"success": success}

# ===============================
# == AnalysisInformation 엔드포인트 ==
# ===============================

@app.post("/createAnalysis", status_code=201)
async def create_analysis(
    request: Request,
    analysis_location: str = Form(...),
    analysis_manager: str = Form(...),
    analysis_tool: str = Form(...),
    analysis_list: str = Form(...),
    analysis_process: str = Form(...),
    analysis_result: str = Form(...),
    a_hash_validation_status: bool = Form(...),
    complete_status: bool = Form(...),
    evidence_id: int = Form(...),
    file: UploadFile | None = File(None)   # 옵션 파일
):
    try:
        # 2) 요청 Content-Type 확인 (multipart인지)
        ct = request.headers.get("content-type")
        print(f"[REQ] Content-Type = {ct}")

        save_path_str = ""

        # 3) 파일 저장은 file이 있고 filename이 있을 때만
        if file is not None and file.filename:
            save_dir = UPLOAD_BASE
            save_dir.mkdir(parents=True, exist_ok=True)

            suffix = Path(file.filename).suffix
            safe_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex}{suffix}"
            save_path = (save_dir / safe_name).resolve()

            print(f"[SAVE] Trying to save: {save_path}")
            # 보안: 업로드 루트 밖으로 벗어나는 경로 방지
            if UPLOAD_BASE not in save_path.parents:
                raise HTTPException(status_code=400, detail="Invalid upload path")

            # 스트림을 파일로 복사
            with save_path.open("wb") as out:
                shutil.copyfileobj(file.file, out)

            save_path_str = str(Path("uploads") / save_path.name).replace(os.sep, "/")
            print(f"[SAVE] Saved OK at: {save_path_str}")
        else:
            print("[SAVE] No file provided; skip saving file.")

        new_analysis = backend.createAnalysisInfo(
            analysis_location=analysis_location,
            analysis_manager=analysis_manager,
            analysis_tool=analysis_tool,
            analysis_list=analysis_list,
            analysis_process=analysis_process,
            analysis_result=analysis_result,
            analysis_filt_path=save_path_str,  # 파일 없으면 ""
            a_hash_validation_status=a_hash_validation_status,
            complete_status=complete_status,
            evidence_id=evidence_id
        )

        data = new_analysis.__dict__.copy()
        data.pop("_sa_instance_state", None)
        return data

    except Exception as e:
        # 에러 상태에서 원인 파악 쉽게
        import traceback
        print("[ERROR] create_analysis failed:\n", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getAnalysisInfoList/{evidence_id}")
def get_analysis_info_list(evidence_id: int):
    try:
        ids = backend.getAnalysisInfoList(evidence_id)
        return {"ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getAnalysisInfo/{analysis_id}")
def get_analysis_info(analysis_id: int):
    try:
        data = backend.getAnalysisInfo(analysis_id)
        if not data:
            raise HTTPException(status_code=404, detail="AnalysisInfo not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/deleteAnalysisInfo/{analysis_id}")
def delete_analysis_info(analysis_id: int):
    try:
        result = backend.deleteAnalysisInfo(analysis_id)
        if not result:
            raise HTTPException(status_code=404, detail="AnalysisInfo not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =================
# == Member 엔드포인트 ==
# =================

@app.post("/createMember")
def create_member(member: MemberCreate):
    try:
        new_member = backend.createMember(**member.dict())
        return new_member.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getMemberList")
def get_member_list():
    try:
        members = backend.getMemberList()
        return {"members": members}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getMember/{member_id}")
def get_member(member_id: int):
    try:
        data = backend.getMember(member_id)
        if not data:
            raise HTTPException(status_code=404, detail="Member not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(request: LoginRequest):
    try:
        db_member = backend.getMemberByEmail(request.login_email)
        if not db_member:
            raise HTTPException(status_code=404, detail="존재하지 않는 이메일입니다.")
        
        if db_member.login_password != request.login_password:
            raise HTTPException(status_code=401, detail="비밀번호가 올바르지 않습니다.")
        
        return {
            "success": True,
            "member_id": db_member.id,
            "member_name": db_member.member_name,
            "login_email": db_member.login_email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/deleteMember/{member_id}")
def delete_member(member_id: int):
    try:
        result = backend.deleteMember(member_id)
        if not result:
            raise HTTPException(status_code=404, detail="Member not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =====================
# == MemberCase 엔드포인트 ==
# =====================

@app.post("/createMemberCase")
def create_member_case(mc: MemberCaseCreate):
    try:
        new_mc = backend.createMemberCase(**mc.dict())
        return new_mc.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/getCasesByMember/{member_id}")
def get_cases_by_member(member_id: int):
    try:
        ids = backend.getCasesByMember(member_id)
        return {"ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/getMembersByCase/{case_id}")
def get_members_by_case(case_id: int) -> dict[str, List[dict]]:
    try:
        result = backend.getMembersByCase(case_id)
        return {"memberCases": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/deleteMemberCaseById/{mc_id}")
def delete_member_case_by_id(mc_id: int):
    try:
        result = backend.deleteMemberCaseById(mc_id)
        if not result:
            raise HTTPException(status_code=404, detail="MemberCase not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/deleteMemberCase")
def delete_member_case(member_id: int, case_id: int):
    try:
        result = backend.deleteMemberCase(member_id, case_id)
        if not result:
            raise HTTPException(status_code=404, detail="MemberCase not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/updateMemberCase")
def update_member_case_api(req: UpdateMemberCaseRequest):
    try:
        mc = backend.update_member_case(req.member_id, req.case_id, req.authority)
        if not mc:
            raise HTTPException(status_code=404, detail="해당 MemberCase가 존재하지 않습니다.")
        return {
            "id": mc.id,
            "member_id": mc.member_id,
            "case_id": mc.case_id,
            "authority": mc.authority
        }
    except ValueError as ve:
        # backend에서 ValueError 발생 시 404로 반환
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        print(f"[ERROR] update_member_case_api: {e}")
        raise HTTPException(status_code=500, detail="권한 수정 중 서버 오류 발생")