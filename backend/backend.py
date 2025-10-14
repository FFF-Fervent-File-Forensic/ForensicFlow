from sqlalchemy import Column, Integer, String, Boolean, create_engine, ForeignKey, Date, DateTime, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from typing import List, Dict
from datetime import datetime, date
import random
import hashlib

# 1. DB 연결 설정
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://freedb_forensic:V3fwX87P%25z%26%2AwKg@sql.freedb.tech:3306/freedb_forensic_assist"
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)


# 2. ORM Base 클래스
Base = declarative_base()


# 3. 테이블 객체화(ORM)
# CaseTable
class CaseTable(Base):
    __tablename__ = "CaseTable"
    id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(String(100))
    case_type = Column(String(100))
    case_overview = Column(String(1000))
    present_stair = Column(String(100))
    doc_file_path = Column(String(255))
    case_occur_location = Column(String(255))
    case_occur_date = Column(DateTime)
    commission_agency = Column(String(100))
    commission_date = Column(DateTime)
    related_person_info = Column(String(1000))

    evidences = relationship("Evidence", back_populates="case", cascade="all, delete")
    members = relationship("MemberCase", back_populates="case", cascade="all, delete")

# Evidence
class Evidence(Base):
    __tablename__ = "Evidence"
    id = Column(Integer, primary_key=True, autoincrement=True)
    hash_value = Column(String(255))
    evidence_name = Column(String(100))
    responsible_member = Column(String(100))
    type = Column(String(100))
    evidence_user = Column(String(100))
    model_name = Column(String(100))
    collect_location = Column(String(255))
    store_location = Column(String(255))
    unique_number = Column(Integer)
    manufactory_date = Column(Date)
    collect_date = Column(Date)
    sign_file_path = Column(String(255))
    case_id = Column(Integer, ForeignKey("CaseTable.id"))

    case = relationship("CaseTable", back_populates="evidences")
    analysis_info = relationship("AnalysisInformation", back_populates="evidence", cascade="all, delete")
    transfer_info = relationship("TransferInformation", back_populates="evidence", cascade="all, delete")

# Analysis_information
class AnalysisInformation(Base):
    __tablename__ = "Analysis_information"
    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_location = Column(String(255))
    analysis_manager = Column(String(100))
    analysis_tool = Column(String(100))
    analysis_list = Column(String(255))
    analysis_process = Column(String(255))
    analysis_result = Column(String(255))
    analysis_filt_path = Column(String(255))
    a_hash_validation_status = Column(Boolean)
    complete_status = Column(Boolean)
    evidence_id = Column(Integer, ForeignKey("Evidence.id"))

    evidence = relationship("Evidence", back_populates="analysis_info")

# Transfer_information
class TransferInformation(Base):
    __tablename__ = "Transfer_information"
    id = Column(Integer, primary_key=True, autoincrement=True)
    case_number = Column(Integer)
    t_hash_validation_status = Column(Boolean)
    departure_location = Column(String(255))
    departure_date = Column(Date)
    arrival_location = Column(String(255))
    arrival_date = Column(Date)
    sender = Column(String(100))
    sender_contact = Column(String(100))
    receiver = Column(String(100))
    receiver_contact = Column(String(100))
    transfer_manager = Column(String(100))
    transfer_manager_contact = Column(String(100))
    responsible_member = Column(String(100))
    responsible_member_sign = Column(String(255))
    image_file_path = Column(String(255))
    evidence_id = Column(Integer, ForeignKey("Evidence.id"))

    evidence = relationship("Evidence", back_populates="transfer_info")

# Member
class Member(Base):
    __tablename__ = "Member"
    id = Column(Integer, primary_key=True, autoincrement=True)
    login_email = Column(String(100))
    login_password = Column(String(100))
    member_name = Column(String(100))

    member_cases = relationship("MemberCase", back_populates="member", cascade="all, delete")

# MemberCase
class MemberCase(Base):
    __tablename__ = "MemberCase"
    id = Column(Integer, primary_key=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("Member.id"))
    case_id = Column(Integer, ForeignKey("CaseTable.id"))
    authority = Column(String(100))

    member = relationship("Member", back_populates="member_cases")
    case = relationship("CaseTable", back_populates="members")

    __table_args__ = (
        UniqueConstraint("member_id", "case_id", name="uq_member_case"),
    )

# 세션 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# < -- 이 아래로는 DB내 데이터를 삽입, 조회, 수정 및 삭제하는 함수 정의 -- >

# ===============
# == Case 함수 ==
# ===============

# Case의 데이터를 매개변수로 받고 CaseTable 테이블에 데이터 추가
def createCase(
    case_number: str,
    case_type: str,
    case_overview: str,
    present_stair: str,
    doc_file_path: str,
    case_occur_location: str,
    case_occur_date: datetime,
    commission_agency: str,
    commission_date: datetime,
    related_person_info: str
) -> CaseTable:
    db = SessionLocal()
    try:
        new_case = CaseTable(
            case_number=case_number,
            case_type=case_type,
            case_overview=case_overview,
            present_stair=present_stair,
            doc_file_path=doc_file_path,
            case_occur_location=case_occur_location,
            case_occur_date=case_occur_date,
            commission_agency=commission_agency,
            commission_date=commission_date,
            related_person_info=related_person_info
        )
        db.add(new_case)
        db.commit()
        db.refresh(new_case)
        return new_case
    finally:
        db.close()

# Case의 id(기본 키)들을 리스트로 반환
def getCaseList() -> List[Dict]:
    db: Session = SessionLocal()
    try:
        rows = db.query(CaseTable.id, CaseTable.case_number, CaseTable.present_stair).all()
        # rows: list of tuples (id, case_number, present_stair)
        return [
            {
                "id": r[0],
                "case_number": r[1],
                "present_stair": r[2]
            }
            for r in rows
        ]
    finally:
        db.close()

# Case의 id(기본 키)를 조회하여 데이터를 딕셔너리로 반환
def getCase(case_id: int) -> dict:
    db = SessionLocal()
    try:
        case = db.query(CaseTable).filter(CaseTable.id == case_id).first()

        if case is None:
            return {}

        case_dict = {
            "id": case.id,
            "case_number": case.case_number,
            "case_type": case.case_type,
            "case_overview": case.case_overview,
            "present_stair": case.present_stair,
            "doc_file_path": case.doc_file_path,
            "case_occur_location": case.case_occur_location,
            "case_occur_date": case.case_occur_date.isoformat() if case.case_occur_date else None,
            "commission_agency": case.commission_agency,
            "commission_date": case.commission_date.isoformat() if case.commission_date else None,
            "related_person_info": case.related_person_info,
        }
        return case_dict
    finally:
        db.close()


# Case의 id(기본 키)를 조회하여 해당 Case를 삭제. 추후 이 Table을 외래 키로 참조하는 데이터도 삭제하도록 수정 필요
def deleteCase(case_id: int) -> bool:
    db = SessionLocal()
    try:
        case = db.query(CaseTable).filter(CaseTable.id == case_id).first()

        if case is None:
            print("삭제 실패 : 해당 case_id가 존재하지 않습니다.")
            return False

        db.delete(case)
        db.commit()
        print("삭제 완료 : Case ID : %d 사건을 삭제하였습니다." % case_id)
        return True
    finally:
        db.close()


# 특정 Case의 present_stair 값을 변경
def updateCasePresentStair(case_id: int, new_stair: int) -> bool:
    db = SessionLocal()
    try:
        # 대상 Case 조회
        case = db.query(CaseTable).filter(CaseTable.id == case_id).first()

        if case is None:
            print(f"변경 실패 : Case ID {case_id} 가 존재하지 않습니다.")
            return False

        # 값 변경
        case.present_stair = new_stair

        # DB에 반영
        db.commit()
        db.refresh(case)

        print(f"변경 완료 : Case ID {case_id} 의 present_stair → {new_stair}")
        return True

    except Exception as e:
        print(f"변경 중 오류 발생 : {e}")
        return False

    finally:
        db.close()


# ===================
# == Evidence 함수 ==
# ===================

# Evidence의 데이터를 매개변수로 받고 Evidence 테이블에 데이터 추가
def createEvidence(
    hash_value: str,
    evidence_name: str,
    responsible_member: str,
    type: str,
    evidence_user: str,
    model_name: str,
    collect_location: str,
    store_location: str,
    unique_number: int,
    manufactory_date: str,   # "YYYY-MM-DD" 형식 문자열
    collect_date: str,       # "YYYY-MM-DD" 형식 문자열
    sign_file_path: str,
    case_id: int
) -> Evidence:
    db = SessionLocal()
    try:
        new_evidence = Evidence(
            hash_value=hash_value,
            evidence_name=evidence_name,
            responsible_member=responsible_member,
            type=type,
            evidence_user=evidence_user,
            model_name=model_name,
            collect_location=collect_location,
            store_location=store_location,
            unique_number=unique_number,
            manufactory_date=manufactory_date,
            collect_date=collect_date,
            sign_file_path=sign_file_path,
            case_id=case_id
        )
        db.add(new_evidence)
        db.commit()
        db.refresh(new_evidence)
        return new_evidence
    finally:
        db.close()

# 특정 Case에 속한 Evidence들의 id(기본 키)들을 리스트로 반환
def getEvidenceList(case_id: int) -> list[int]:
    db = SessionLocal()
    try:
        evidences = db.query(Evidence.id).filter(Evidence.case_id == case_id).all()
        evidence_ids = [evidence[0] for evidence in evidences]
        return evidence_ids
    finally:
        db.close()

# Evidence의 id(기본 키)를 조회하여 데이터를 딕셔너리로 반환
def getEvidence(evidence_id: int) -> dict:
    db = SessionLocal()
    try:
        evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()

        if evidence is None:
            return {}

        evidence_dict = {
            "id": evidence.id,
            "hash_value": evidence.hash_value,
            "evidence_name": evidence.evidence_name,
            "responsible_member": evidence.responsible_member,
            "type": evidence.type,
            "evidence_user": evidence.evidence_user,
            "model_name": evidence.model_name,
            "collect_location": evidence.collect_location,
            "store_location": evidence.store_location,
            "unique_number": evidence.unique_number,
            "manufactory_date": str(evidence.manufactory_date) if evidence.manufactory_date else None,
            "collect_date": str(evidence.collect_date) if evidence.collect_date else None,
            "sign_file_path": evidence.sign_file_path,
            "case_id": evidence.case_id
        }
        return evidence_dict
    finally:
        db.close()

# Evidence의 id(기본 키)를 조회하여 해당 Evidence를 삭제. 추후 이 Table을 외래 키로 참조하는 데이터도 삭제하도록 수정 필요
def deleteEvidence(evidence_id: int) -> bool:
    db = SessionLocal()
    try:
        evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()

        if evidence is None:
            print("삭제 실패 : 해당 evidence_id가 존재하지 않습니다.")
            return False

        db.delete(evidence)
        db.commit()
        print("삭제 완료 : Evidence ID : %d 데이터를 삭제하였습니다." % evidence_id)
        return True
    finally:
        db.close()

# Evidence 테이블의 hash_value와 업로드된 파일의 SHA-256 해시가 동일한지 비교하는 함수
def isSameHash(evidence_id: int, file) -> bool:
    db: Session = SessionLocal()
    try:
        evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
        if not evidence:
            print(f"[isSameHash] Evidence ID {evidence_id}를 찾을 수 없습니다.")
            return False

        db_hash = evidence.hash_value
        if not db_hash:
            print(f"[isSameHash] Evidence ID {evidence_id}의 hash_value가 존재하지 않습니다.")
            return False

        # 🔹 동기식으로 파일 읽기 (UploadFile.file 사용)
        file.file.seek(0)
        file_bytes = file.file.read()

        file_hash = hashlib.sha256(file_bytes).hexdigest()
        is_same = (file_hash == db_hash)

        print(f"[isSameHash] evidence_id={evidence_id}, DB Hash={db_hash[:16]}..., File Hash={file_hash[:16]}..., Same={is_same}")
        return is_same

    except Exception as e:
        print(f"[isSameHash] 오류 발생: {e}")
        return False

    finally:
        db.close()

# ===============================
# == Transfer_information 함수 ==
# ===============================

# Transfer_Information 에 데이터 삽입
def createTransferInfo(
    case_number: int,
    t_hash_validation_status: bool,
    departure_location: str,
    departure_date: str, # "YYYY-MM-DD" 형식 문자열
    arrival_location: str,
    arrival_date: str, # "YYYY-MM-DD" 형식 문자열
    sender: str,
    sender_contact: str,
    receiver: str,
    receiver_contact: str,
    transfer_manager: str,
    transfer_manager_contact: str,
    responsible_member: str,
    responsible_member_sign: str,
    image_file_path: str,
    evidence_id: int
) -> TransferInformation:
    db = SessionLocal()
    try:
        new_transfer = TransferInformation(
            case_number=case_number,
            t_hash_validation_status=t_hash_validation_status,
            departure_location=departure_location,
            departure_date=departure_date,
            arrival_location=arrival_location,
            arrival_date=arrival_date,
            sender=sender,
            sender_contact=sender_contact,
            receiver=receiver,
            receiver_contact=receiver_contact,
            transfer_manager=transfer_manager,
            transfer_manager_contact=transfer_manager_contact,
            responsible_member=responsible_member,
            responsible_member_sign=responsible_member_sign,
            image_file_path=image_file_path,
            evidence_id=evidence_id
        )
        db.add(new_transfer)
        db.commit()
        db.refresh(new_transfer)
        print(f"추가 완료 : TransferInformation ID {new_transfer.id}")
        return new_transfer
    finally:
        db.close()

# 특정 Evidence에 속한 TransferInformation ID 리스트 반환
def getTransferInfoList(evidence_id: int) -> list[int]:
    db = SessionLocal()
    try:
        transfers = db.query(TransferInformation).filter(TransferInformation.evidence_id == evidence_id).all()
        return [t.id for t in transfers]
    finally:
        db.close()

# TransferInformation의 id(기본 키)를 조회하여 데이터를 딕셔너리로 반환
def getTransferInfo(transfer_id: int) -> dict:
    db = SessionLocal()
    try:
        transfer = db.query(TransferInformation).filter(TransferInformation.id == transfer_id).first()

        if transfer is None:
            return {}

        transfer_dict = {
            "id": transfer.id,
            "case_number": transfer.case_number,
            "t_hash_validation_status": transfer.t_hash_validation_status,
            "departure_location": transfer.departure_location,
            "departure_date": transfer.departure_date,
            "arrival_location": transfer.arrival_location,
            "arrival_date": transfer.arrival_date,
            "sender": transfer.sender,
            "sender_contact": transfer.sender_contact,
            "receiver": transfer.receiver,
            "receiver_contact": transfer.receiver_contact,
            "transfer_manager": transfer.transfer_manager,
            "transfer_manager_contact": transfer.transfer_manager_contact,
            "responsible_member": transfer.responsible_member,
            "responsible_member_sign": transfer.responsible_member_sign,
            "image_file_path": transfer.image_file_path,
            "evidence_id": transfer.evidence_id,
        }
        return transfer_dict
    finally:
        db.close()

# TransferInformation의 id(기본 키)를 조회하여 해당 TransferInformation를 삭제.
def deleteTransferInfo(transfer_id: int) -> bool:
    db = SessionLocal()
    try:
        transfer = db.query(TransferInformation).filter(TransferInformation.id == transfer_id).first()

        if transfer is None:
            print("삭제 실패 : 해당 transfer_id가 존재하지 않습니다.")
            return False

        db.delete(transfer)
        db.commit()
        print(f"삭제 완료 : TransferInformation ID {transfer_id}")
        return True
    finally:
        db.close()

# 특정 TransferInformation의 t_hash_validation_status 값을 변경
def toggleTransformHash(transfer_id: int, value: bool) -> bool:
    db = SessionLocal()
    try:
        # 대상 TransferInformation 조회
        transfer = db.query(TransferInformation).filter(TransferInformation.id == transfer_id).first()

        if transfer is None:
            print(f"변경 실패 : TransferInformation ID {transfer_id} 가 존재하지 않습니다.")
            return False

        # 상태 변경
        transfer.t_hash_validation_status = value

        # DB에 반영
        db.commit()
        db.refresh(transfer)

        print(f"변경 완료 : TransferInformation ID {transfer_id} 의 t_hash_validation_status → {value}")
        return True

    except Exception as e:
        print(f"변경 중 오류 발생 : {e}")
        return False

    finally:
        db.close()



# ===============================
# == Analysis_information 함수 ==
# ===============================

# Analysis_information 데이터 삽입
def createAnalysisInfo(
    analysis_location: str,
    analysis_manager: str,
    analysis_tool: str,
    analysis_list: str,
    analysis_process: str,
    analysis_result: str,
    analysis_filt_path: str,
    a_hash_validation_status: bool,
    complete_status: bool,
    evidence_id: int
) -> AnalysisInformation:
    db = SessionLocal()
    try:
        new_analysis = AnalysisInformation(
            analysis_location=analysis_location,
            analysis_manager=analysis_manager,
            analysis_tool=analysis_tool,
            analysis_list=analysis_list,
            analysis_process=analysis_process,
            analysis_result=analysis_result,
            analysis_filt_path=analysis_filt_path,
            a_hash_validation_status=a_hash_validation_status,
            complete_status=complete_status,
            evidence_id=evidence_id
        )
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        print(f"추가 완료 : AnalysisInformation ID {new_analysis.id}")
        return new_analysis
    finally:
        db.close()


# 특정 Evidence에 속한 AnalysisInformation ID 리스트 반환
def getAnalysisInfoList(evidence_id: int) -> list[int]:
    db = SessionLocal()
    try:
        analyses = db.query(AnalysisInformation).filter(AnalysisInformation.evidence_id == evidence_id).all()
        return [a.id for a in analyses]
    finally:
        db.close()


# AnalysisInformation의 id(기본 키)를 조회하여 데이터를 딕셔너리로 반환
def getAnalysisInfo(analysis_id: int) -> dict:
    db = SessionLocal()
    try:
        analysis = db.query(AnalysisInformation).filter(AnalysisInformation.id == analysis_id).first()

        if analysis is None:
            return {}

        analysis_dict = {
            "id": analysis.id,
            "analysis_location": analysis.analysis_location,
            "analysis_manager": analysis.analysis_manager,
            "analysis_tool": analysis.analysis_tool,
            "analysis_list": analysis.analysis_list,
            "analysis_process": analysis.analysis_process,
            "analysis_result": analysis.analysis_result,
            "analysis_filt_path": analysis.analysis_filt_path,
            "a_hash_validation_status": analysis.a_hash_validation_status,
            "complete_status": analysis.complete_status,
            "evidence_id": analysis.evidence_id,
        }
        return analysis_dict
    finally:
        db.close()


# AnalysisInformation의 id(기본 키)를 조회하여 삭제
def deleteAnalysisInfo(analysis_id: int) -> bool:
    db = SessionLocal()
    try:
        analysis = db.query(AnalysisInformation).filter(AnalysisInformation.id == analysis_id).first()

        if analysis is None:
            print("삭제 실패 : 해당 analysis_id가 존재하지 않습니다.")
            return False

        db.delete(analysis)
        db.commit()
        print(f"삭제 완료 : AnalysisInformation ID {analysis_id}")
        return True
    finally:
        db.close()


# =================
# == Member 함수 ==
# =================

# Member 데이터 삽입
def createMember(
    login_email: str,
    login_password: str,
    member_name: str,
) -> Member:
    db = SessionLocal()
    try:
        new_member = Member(
            login_email=login_email,
            login_password=login_password,
            member_name=member_name,
        )
        db.add(new_member)
        db.commit()
        db.refresh(new_member)
        print(f"추가 완료 : Member ID {new_member.id}")
        return new_member
    finally:
        db.close()

# Member 테이블에 존재하는 모든 id,이름 리스트 반환
def getMemberList() -> List[Dict]:
    db = SessionLocal()
    try:
        rows = db.query(Member.id, Member.member_name).all()
        return [
            {
                "id": r[0],
                "member_name": r[1],
            }
            for r in rows
        ]
    finally:
        db.close()


# Member의 id(기본 키)를 조회하여 데이터를 딕셔너리로 반환
def getMember(member_id: int) -> dict:
    db = SessionLocal()
    try:
        member = db.query(Member).filter(Member.id == member_id).first()

        if member is None:
            return {}

        member_dict = {
            "id": member.id,
            "login_email": member.login_email,
            "login_password": member.login_password,
            "member_name": member.member_name,
        }
        return member_dict
    finally:
        db.close()


# Member의 id(기본 키)를 조회하여 삭제
def deleteMember(member_id: int) -> bool:
    db = SessionLocal()
    try:
        member = db.query(Member).filter(Member.id == member_id).first()

        if member is None:
            print("삭제 실패 : 해당 member_id가 존재하지 않습니다.")
            return False

        db.delete(member)
        db.commit()
        print(f"삭제 완료 : Member ID {member_id}")
        return True
    finally:
        db.close()

# 이메일 기준으로 Member 정보 조회
def getMemberByEmail(login_email: str) -> Member | None:
    db = SessionLocal()
    try:
        member = db.query(Member).filter(Member.login_email == login_email).first()
        return member  # Member 객체 그대로 반환 (없으면 None)
    finally:
        db.close()

# =====================
# == MemberCase 함수 ==
# =====================

# MemberCase 데이터 삽입
def createMemberCase(member_id: int, case_id: int, authority: str) -> MemberCase:
    db = SessionLocal()
    try:
        new_mc = MemberCase(
            member_id=member_id,
            case_id=case_id,
            authority=authority
        )
        db.add(new_mc)
        db.commit()
        db.refresh(new_mc)
        return new_mc
    finally:
        db.close()

# 특정 Member가 접근할 수 있는 Case ID 리스트
def getCasesByMember(member_id: int) -> list[int]:
    db = SessionLocal()
    try:
        entries = db.query(MemberCase).filter(MemberCase.member_id == member_id).all()
        return [e.case_id for e in entries]
    finally:
        db.close()

# 특정 Case에 접근 권한이 있는 Member ID 리스트
def getMembersByCase(case_id: int) -> list[dict]:
    db = SessionLocal()
    try:
        entries = db.query(MemberCase).filter(MemberCase.case_id == case_id).all()
        result = []
        for e in entries:
            result.append({
                "mc_id": e.id,
                "member_id": e.member.id,
                "member_name": e.member.member_name,
                "authority": e.authority
            })
        return result
    finally:
        db.close()

# id 기준 삭제
def deleteMemberCaseById(mc_id: int) -> bool:
    db = SessionLocal()
    try:
        entry = db.query(MemberCase).filter(MemberCase.id == mc_id).first()
        if entry is None:
            return False
        db.delete(entry)
        db.commit()
        return True
    finally:
        db.close()

# (member_id, case_id) 기준 삭제
def deleteMemberCase(member_id: int, case_id: int) -> bool:
    db = SessionLocal()
    try:
        entry = db.query(MemberCase).filter(
            MemberCase.member_id == member_id,
            MemberCase.case_id == case_id
        ).first()
        if entry is None:
            return False
        db.delete(entry)
        db.commit()
        return True
    finally:
        db.close()

def update_member_case(member_id: int, case_id: int, authority: str) -> MemberCase:
    db = SessionLocal()
    mc = db.query(MemberCase).filter(
        MemberCase.member_id == member_id,
        MemberCase.case_id == case_id
    ).first()

    if not mc:
        raise ValueError("해당 MemberCase가 존재하지 않습니다.")

    mc.authority = authority
    db.commit()
    db.refresh(mc)
    return mc

# 테스트용 코드

def test_all_tables(delete: bool):
    print("\n=== CASE TABLE TEST ===")
    if not delete:
        # 1. CaseTable 데이터 생성
        case = createCase(
            case_number=12345,
            case_type="사기 범죄",
            case_overview="A가 B를 상대로 사기를 저지름",
            present_stair="증거 수집 중",
            doc_file_path="/cases/12345",
            case_occur_location="서울",
            case_occur_date=DateTime(2025, 1, 1),
            commission_agency="춘천지방검찰청",
            commission_date=DateTime(2025, 1, 31),
            related_person_info="A, B"
        )
        print("생성된 Case ID:", case.id)

        # 2. Case 조회
        case_data = getCase(case.id)
        print("조회된 Case:", case_data)

        # 3. Case ID 리스트 조회
        case_ids = getCaseList()
        print("모든 Case ID:", case_ids)

        # 4. Case 삭제
        deleteCase(case.id)
        print("Case 삭제 후 리스트:", getCaseList())

    print("\n=== EVIDENCE TABLE TEST ===")
    # Case를 다시 생성 (외래 키 필요)
    case = createCase(
        case_number=12345,
        case_type="사기 범죄",
        case_overview="A가 B를 상대로 사기를 저지름",
        present_stair="증거 수집 중",
        doc_file_path="/cases/12345",
        case_occur_location="서울",
        case_occur_date=DateTime(2024, 1, 1),
        commission_agency="춘천지방검찰청",
        commission_date=DateTime(2024, 1, 31),
        related_person_info="A, B"
    )
    evidence = createEvidence(
        hash_value="abc123",
        evidence_name="노트북",
        responsible_member="홍길동",
        type="전자기기",
        evidence_user="A",
        model_name="ThinkPad",
        collect_location="서울",
        store_location="서버실",
        unique_number=1,
        manufactory_date=date(2022, 1, 1),
        collect_date=date(2025, 1, 5),
        sign_file_path="/signs/evidence1.png",
        case_id=case.id
    )
    print("생성된 Evidence ID:", evidence.id)

    # Evidence 조회
    evidence_data = getEvidence(evidence.id)
    print("조회된 Evidence:", evidence_data)

    # Evidence 리스트
    evidence_ids = getEvidenceList(case.id)
    print(f"Case {case.id}에 속한 Evidence ID 리스트:", evidence_ids)

    # Evidence 삭제
    if not delete:
        deleteEvidence(evidence.id)
        print(f"Evidence 삭제 후 리스트:", getEvidenceList(case.id))

    print("\n=== TRANSFER INFORMATION TEST ===")
    # 새 Evidence 생성
    evidence = createEvidence(
        hash_value="abc124",
        evidence_name="USB",
        responsible_member="홍길동",
        type="저장매체",
        evidence_user="B",
        model_name="SanDisk",
        collect_location="서울",
        store_location="서버실",
        unique_number=2,
        manufactory_date=date(2023, 2, 2),
        collect_date=date(2025, 2, 5),
        sign_file_path="/signs/evidence2.png",
        case_id=case.id
    )
    transfer = createTransferInfo(
        case_number=case.case_number,
        t_hash_validation_status=True,
        departure_location="서울",
        departure_date="2025-02-06",
        arrival_location="부산",
        arrival_date="2025-02-07",
        sender="홍길동",
        sender_contact="010-1111-2222",
        receiver="김철수",
        receiver_contact="010-3333-4444",
        transfer_manager="박관리",
        transfer_manager_contact="010-5555-6666",
        responsible_member="홍길동",
        responsible_member_sign="/signs/manager.png",
        image_file_path="/images/transfer1.png",
        evidence_id=evidence.id
    )
    print("생성된 TransferInformation ID:", transfer.id)
    print("조회 TransferInformation:", getTransferInfo(transfer.id))
    print("Evidence에 속한 Transfer 정보 ID 리스트:", getTransferInfoList(evidence.id))
    if not delete:
        deleteTransferInfo(transfer.id)
        print("삭제 후 Transfer 정보 ID 리스트:", getTransferInfoList(evidence.id))

    print("\n=== ANALYSIS INFORMATION TEST ===")
    analysis = createAnalysisInfo(
        analysis_location="서울 분석실",
        analysis_manager="이분석",
        analysis_tool="ForensicTool v1",
        analysis_list="리스트1",
        analysis_process="프로세스1",
        analysis_result="정상",
        analysis_filt_path="/analysis/filter1.png",
        a_hash_validation_status=True,
        complete_status=False,
        evidence_id=evidence.id
    )
    print("생성된 AnalysisInformation ID:", analysis.id)
    print("조회 AnalysisInformation:", getAnalysisInfo(analysis.id))
    print("Evidence에 속한 Analysis 정보 ID 리스트:", getAnalysisInfoList(evidence.id))
    if not delete:
        deleteAnalysisInfo(analysis.id)
        print("삭제 후 Analysis 정보 ID 리스트:", getAnalysisInfoList(evidence.id))

    print("\n=== MEMBER TABLE TEST ===")
    randomValue = random.randint(100000, 999999)
    member = createMember(
        login_email="test" + str(randomValue) + "@example.com",
        login_password="1234",
        member_name="홍길동",
    )
    print("생성된 Member ID:", member.id)
    print("조회 Member:", getMember(member.id))
    print("모든 Member ID 리스트:", getMemberList())
    if not delete:
        deleteMember(member.id)
        print("Member 삭제 후 ID 리스트:", getMemberList())

    print("\n=== MEMBERCASE TABLE TEST ===")
    # Member와 Case 다시 생성
    member = createMember(
        login_email="test2@example.com",
        login_password="1234",
        member_name="김철수",
    )
    mc = createMemberCase(member_id=member.id, case_id=case.id, authority="읽기")
    print("생성된 MemberCase ID:", mc.id)
    print("Member가 접근 가능한 Case ID 리스트:", getCasesByMember(member.id))
    print("Case에 접근 가능한 Member ID 리스트:", getMembersByCase(case.id))
    if not delete:
        deleteMemberCase(member.id, case.id)
        print("삭제 후 Case 접근 Member 리스트:", getMembersByCase(case.id))

print("< ---------------- 실행 시작 ----------------->")


if __name__ == "__main__":

    TEST = 3
    CASE_ID = 4

    if TEST % 2 == 0:
        # 전체 쿼리 테스트
        test_all_tables(False)
    
    if TEST % 3 == 0:
        test_all_tables(True)

    if TEST % 5 == 0:
        # 케이스 및 멤버 전체 삭제
        for case in getCaseList():
            deleteCase(case)
        for member in getMemberList():
            deleteMember(member)