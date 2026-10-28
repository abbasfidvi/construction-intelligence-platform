from typing import List, Optional
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant' or 'system'")
    content: str

class KnowledgeQueryRequest(BaseModel):
    query: str
    conversation_history: Optional[List[ChatMessage]] = Field(default_factory=list)
    image_base64: Optional[str] = Field(None, description="Optional construction photo, blueprint, or defect image")
    engineering_domain: Optional[str] = Field("Structural & Site Engineering", description="Structural, Geotechnical, OSHA/Safety, Building Codes, MEP, Project Management")

class KnowledgeQueryResponse(BaseModel):
    reply: str
    referenced_codes_and_standards: List[str]
    suggested_followup_topics: List[str]
    confidence_level: str
