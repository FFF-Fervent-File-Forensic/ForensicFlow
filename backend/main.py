from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import date
import hashlib
import backend

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CaseCreate(BaseModel):
    case_number: int
    case_type: str
    case_overview: str
    present_stair: str
    doc_file_path: str
    case_occur_location: str
    case_occur_date: date
    commission_period: str
    commission_date: str
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
        ids = backend.getCaseList()
        return {"ids": ids}
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

# ===============================
# == AnalysisInformation 엔드포인트 ==
# ===============================

@app.post("/createAnalysis")
def create_analysis(analysis: AnalysisCreate):
    try:
        new_analysis = backend.createAnalysisInfo(**analysis.dict())
        return new_analysis.__dict__
    except Exception as e:
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
        ids = backend.getMemberList()
        return {"ids": ids}
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
def get_members_by_case(case_id: int):
    try:
        ids = backend.getMembersByCase(case_id)
        return {"ids": ids}
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
