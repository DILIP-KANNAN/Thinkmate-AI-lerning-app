import os
import json
import faiss
import numpy as np
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer
from models import ChunkData

# Global embedding model (loaded once to save memory and time)
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
model = None

def get_embedding_model() -> SentenceTransformer:
    global model
    if model is None:
        model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return model

class VectorDBStore:
    def __init__(self, user_id: str, base_dir: str = ".faiss_store"):
        self.user_id = user_id
        self.user_dir = os.path.join(base_dir, user_id)
        self.index_path = os.path.join(self.user_dir, "index.faiss")
        self.metadata_path = os.path.join(self.user_dir, "metadata.json")
        
        os.makedirs(self.user_dir, exist_ok=True)
        
        self.model = get_embedding_model()
        self.dimension = self.model.get_sentence_embedding_dimension()
        
        # Load or initialize FAISS index and metadata
        self.index = self._load_index()
        self.metadata_store = self._load_metadata()

    def _load_index(self):
        if os.path.exists(self.index_path):
            return faiss.read_index(self.index_path)
        # Initialize an L2 distance FAISS index
        return faiss.IndexFlatL2(self.dimension)

    def _load_metadata(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata_store, f, ensure_ascii=False, indent=2)

    def clear(self):
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata_store = []
        self._save()

    def add_chunks(self, chunks: List[ChunkData]):
        if not chunks:
            return
            
        texts = [chunk.text for chunk in chunks]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        
        self.index.add(embeddings)
        
        for chunk in chunks:
            self.metadata_store.append({
                "text": chunk.text,
                "document_name": chunk.metadata.document_name,
                "subject": chunk.metadata.subject,
                "topic": chunk.metadata.topic
            })
            
        self._save()

    def search(self, query: str, top_k: int = 5, document_names: List[str] = None) -> List[Dict[str, Any]]:
        if self.index.ntotal == 0:
            return []
            
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        
        # Increase fetch size if we are filtering by document_names
        fetch_k = top_k * 10 if document_names else top_k
        fetch_k = min(fetch_k, self.index.ntotal)
        if fetch_k == 0:
            return []
            
        distances, indices = self.index.search(query_embedding, fetch_k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx < len(self.metadata_store):
                res = self.metadata_store[idx].copy()
                
                # Metadata filter
                if document_names and res.get("document_name") not in document_names:
                    continue
                    
                res["distance"] = float(dist)
                results.append(res)
                
                if len(results) >= top_k:
                    break
                    
        return results
