from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
import os

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__="users"; id:Mapped[int]=mapped_column(primary_key=True); email:Mapped[str]=mapped_column(String(200),unique=True); role:Mapped[str]=mapped_column(String(40)); name:Mapped[str]=mapped_column(String(200))
class Organization(Base):
    __tablename__="organizations"; id:Mapped[int]=mapped_column(primary_key=True); name:Mapped[str]=mapped_column(String(250)); kind:Mapped[str]=mapped_column(String(80),default="subsidiary")
class Membership(Base):
    __tablename__="memberships"; id:Mapped[int]=mapped_column(primary_key=True); user_id:Mapped[int]=mapped_column(ForeignKey("users.id")); organization_id:Mapped[int]=mapped_column(ForeignKey("organizations.id")); role:Mapped[str]=mapped_column(String(40))
class ServiceVersion(Base):
    __tablename__="service_versions"; id:Mapped[int]=mapped_column(primary_key=True); service_id:Mapped[str]=mapped_column(String(100),index=True); version:Mapped[str]=mapped_column(String(20)); status:Mapped[str]=mapped_column(String(30)); definition:Mapped[dict]=mapped_column(JSON); author:Mapped[str]=mapped_column(String(150)); summary:Mapped[str]=mapped_column(String(300)); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class BusinessPassport(Base):
    __tablename__="business_passports"; id:Mapped[int]=mapped_column(primary_key=True); user_email:Mapped[str]=mapped_column(String(200),unique=True); data:Mapped[dict]=mapped_column(JSON); updated_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class Application(Base):
    __tablename__="applications"; id:Mapped[int]=mapped_column(primary_key=True); number:Mapped[str|None]=mapped_column(String(60),unique=True,nullable=True); owner:Mapped[str]=mapped_column(String(200),index=True); service_id:Mapped[str]=mapped_column(String(100)); status:Mapped[str]=mapped_column(String(50),default="draft"); answers:Mapped[dict]=mapped_column(JSON,default=dict); documents:Mapped[list]=mapped_column(JSON,default=list); consent:Mapped[bool]=mapped_column(Boolean,default=False); external_id:Mapped[str|None]=mapped_column(String(80),nullable=True); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow); updated_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class StatusEvent(Base):
    __tablename__="status_events"; id:Mapped[int]=mapped_column(primary_key=True); application_id:Mapped[int]=mapped_column(ForeignKey("applications.id")); status:Mapped[str]=mapped_column(String(50)); message:Mapped[str]=mapped_column(String(300)); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class IntegrationEvent(Base):
    __tablename__="integration_events"; id:Mapped[int]=mapped_column(primary_key=True); connector:Mapped[str]=mapped_column(String(60)); endpoint:Mapped[str]=mapped_column(String(150)); method:Mapped[str]=mapped_column(String(10)); status:Mapped[str]=mapped_column(String(20)); response_ms:Mapped[int]=mapped_column(Integer); payload:Mapped[dict]=mapped_column(JSON); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class AuditLog(Base):
    __tablename__="audit_logs"; id:Mapped[int]=mapped_column(primary_key=True); actor:Mapped[str]=mapped_column(String(200)); action:Mapped[str]=mapped_column(String(100)); entity:Mapped[str]=mapped_column(String(100)); detail:Mapped[dict]=mapped_column(JSON); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
class GenericEntity(Base):
    __tablename__="platform_entities"; id:Mapped[int]=mapped_column(primary_key=True); entity_type:Mapped[str]=mapped_column(String(80),index=True); owner:Mapped[str|None]=mapped_column(String(200),nullable=True); data:Mapped[dict]=mapped_column(JSON); created_at:Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)

URL=os.getenv("DATABASE_URL","sqlite:///./baiterek.db"); engine=create_engine(URL,connect_args={"check_same_thread":False} if URL.startswith("sqlite") else {},pool_pre_ping=True); SessionLocal=sessionmaker(bind=engine,expire_on_commit=False)
def init_db(): Base.metadata.create_all(engine)

