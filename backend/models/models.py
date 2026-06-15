from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    datasets = relationship("Dataset", back_populates="owner")
    histories = relationship("AllocationHistory", back_populates="user")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    json_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="datasets")
    warehouses = relationship("Warehouse", back_populates="dataset", cascade="all, delete-orphan")
    regions = relationship("Region", back_populates="dataset", cascade="all, delete-orphan")
    allocation_results = relationship("AllocationResult", back_populates="dataset", cascade="all, delete-orphan")
    histories = relationship("AllocationHistory", back_populates="dataset", cascade="all, delete-orphan")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    location_name = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    resources = Column(Integer)
    
    dataset = relationship("Dataset", back_populates="warehouses")


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    name = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    severity = Column(Integer)
    demand = Column(Integer)

    dataset = relationship("Dataset", back_populates="regions")


class AllocationHistory(Base):
    __tablename__ = "allocation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    total_cost = Column(Float)
    resources_remaining = Column(Integer)
    coverage_percentage = Column(Float)

    user = relationship("User", back_populates="histories")
    dataset = relationship("Dataset", back_populates="histories")


class AllocationResult(Base):
    __tablename__ = "allocation_results"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    analysis_data = Column(JSON) # To store detailed allocation results per region
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="allocation_results")
