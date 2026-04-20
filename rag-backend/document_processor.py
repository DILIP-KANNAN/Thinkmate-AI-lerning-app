import fitz  # PyMuPDF
import re
from typing import List
from models import ChunkData, DocumentMetadata

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts text from a loaded PDF using PyMuPDF."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    return text

def semantic_chunking(text: str, metadata: DocumentMetadata, chunk_size: int = 400, overlap: int = 50) -> List[ChunkData]:
    """
    Splits text into conceptual chunks using paragraphs and sentences.
    Approximates tokens by splitting on whitespace.
    """
    # Simply split by paragraphs first to keep semantic boundaries
    paragraphs = re.split(r'\n\s*\n', text)
    
    chunks = []
    current_chunk_words = []
    
    for p in paragraphs:
        words = p.strip().split()
        if not words:
            continue
            
        # If adding this paragraph exceeds the chunk size, we finish the current chunk
        if len(current_chunk_words) + len(words) > chunk_size and len(current_chunk_words) > 0:
            chunks.append(ChunkData(
                text=" ".join(current_chunk_words),
                metadata=metadata
            ))
            
            # Keep the overlap words from the end of the previous chunk
            overlap_words = current_chunk_words[-overlap:] if overlap > 0 else []
            current_chunk_words = overlap_words + words
        else:
            current_chunk_words.extend(words)
            
    # Add the last chunk
    if current_chunk_words:
        chunks.append(ChunkData(
            text=" ".join(current_chunk_words),
            metadata=metadata
        ))
        
    return chunks

def process_document(pdf_bytes: bytes, metadata: DocumentMetadata) -> List[ChunkData]:
    raw_text = extract_text_from_pdf(pdf_bytes)
    # clean slightly
    raw_text = re.sub(r'\s+', ' ', raw_text) 
    # But wait, above I used paragraph splits via \n\n. We should clean AFTER splitting, or clean just excessive spaces.
    # Let's redefine extract_text_from_pdf to preserve paragraph breaks but remove weird formatting.
    # Wait, the re.sub above replaces all newlines. I'll just use a softer clean during chunking.
    pass

def process_document(pdf_bytes: bytes, metadata: DocumentMetadata) -> List[ChunkData]:
    raw_text = extract_text_from_pdf(pdf_bytes)
    raw_text = raw_text.replace('\u0000', '') # remove null bytes
    return semantic_chunking(raw_text, metadata)
