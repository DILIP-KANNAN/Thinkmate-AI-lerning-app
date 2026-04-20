from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class BaseQueryRequest(BaseModel):
    user_id: str
    document_names: Optional[List[str]] = None

class SummaryRequest(BaseQueryRequest):
    # Optional document focus, if not provided will summarize recent chunks
    document_name: Optional[str] = None

class ExamPrepRequest(BaseQueryRequest):
    topic: str

class ConceptRequest(BaseQueryRequest):
    topic: str

class QuestionGenRequest(BaseQueryRequest):
    number_of_questions: int
    marks_per_question: int
    topic: Optional[str] = None

class GenericQueryRequest(BaseQueryRequest):
    mode: str
    input_text: str

class DocumentMetadata(BaseModel):
    document_name: str
    subject: Optional[str] = "General"
    topic: Optional[str] = "General"

class ChunkData(BaseModel):
    text: str
    metadata: DocumentMetadata
