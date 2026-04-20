from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from models import (
    SummaryRequest, ExamPrepRequest, ConceptRequest, QuestionGenRequest, DocumentMetadata
)
from document_processor import process_document
from database import VectorDBStore
from llm import generate_response

app = FastAPI(title="ThinkMate RAG System")

# Allow CORS for integration with frontend / Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_document(
    user_id: str = Form(...),
    subject: str = Form("General"),
    topic: str = Form("General"),
    clear_first: bool = Form(False),
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    pdf_bytes = await file.read()
    
    # Process text into chunk models
    metadata = DocumentMetadata(
        document_name=file.filename,
        subject=subject,
        topic=topic
    )
    chunks = process_document(pdf_bytes, metadata)
    
    if len(chunks) == 0:
        raise HTTPException(status_code=400, detail="Could not extract any meaningful text chunks from the PDF. It might be an image-based PDF or empty.")
    
    # Store chunks in faiss index per user
    db = VectorDBStore(user_id=user_id)
    if clear_first:
        db.clear()
        
    db.add_chunks(chunks)
    
    return {
        "status": "success",
        "message": f"Document {file.filename} ingested successfully into {user_id}'s knowledge base.",
        "chunks_processed": len(chunks)
    }

@app.post("/summary")
async def get_summary(req: SummaryRequest):
    db = VectorDBStore(user_id=req.user_id)
    
    # Retrieve top chunks (for summarization we might want more chunks, but we limit to top 10 for token sizes)
    # If they want the entire retrieved content summarization, we just fetch a top k.
    query_text = f"Summary of {req.document_name}" if req.document_name else "Detailed overview and summary of the content"
    doc_names_list = [req.document_name] if req.document_name else req.document_names
    retrieved_chunks = db.search(query_text, top_k=10, document_names=doc_names_list)
    
    response = await generate_response("summarization", retrieved_chunks)
    return {"response": response, "chunks_used": len(retrieved_chunks)}

@app.post("/exam")
async def get_exam_prep(req: ExamPrepRequest):
    db = VectorDBStore(user_id=req.user_id)
    retrieved_chunks = db.search(req.topic, top_k=5, document_names=req.document_names)
    response = await generate_response("exam_preparation", retrieved_chunks, topic=req.topic)
    return {"response": response, "chunks_used": len(retrieved_chunks)}

@app.post("/concept")
async def get_concept(req: ConceptRequest):
    db = VectorDBStore(user_id=req.user_id)
    retrieved_chunks = db.search(req.topic, top_k=5, document_names=req.document_names)
    response = await generate_response("concept_explanation", retrieved_chunks, topic=req.topic)
    return {"response": response, "chunks_used": len(retrieved_chunks)}

@app.post("/questions")
async def get_questions(req: QuestionGenRequest):
    db = VectorDBStore(user_id=req.user_id)
    search_query = req.topic if req.topic else "Generate general questions"
    retrieved_chunks = db.search(search_query, top_k=5, document_names=req.document_names)
    
    response = await generate_response(
        "question_generation", 
        retrieved_chunks, 
        topic=req.topic,
        num_questions=req.number_of_questions,
        marks=req.marks_per_question
    )
    return {"response": response, "chunks_used": len(retrieved_chunks)}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ThinkMate RAG System"}
