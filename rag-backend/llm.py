import httpx
import json
from typing import List, Dict, Any, Optional

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "mistral"

MASTER_PROMPT = """You are an academic assistant.
Use ONLY the provided context to answer the prompt.
Do not hallucinate or include external knowledge.
If the context is insufficient, return EXACTLY: "The provided material does not contain enough information."
Structure answers clearly with headings and bullet points.
"""

MODE_PROMPTS = {
    "summarization": """MODE: SUMMARIZATION
Summarize the entire retrieved content.
Provide your response in the following structure:
- Overview
- Key Topics
- Important Concepts
- Definitions
- Revision Points
- Conclusion""",
    
    "exam_preparation": """MODE: EXAM PREPARATION
Prepare the student for an exam regarding the provided topic.
Topic: {topic}
Provide your response in the following structure:
- Topic Overview
- Important Focus Areas
- Exam Relevance
- Answer Writing Strategy
- Related Topics
- Common Mistakes""",
    
    "concept_explanation": """MODE: CONCEPT EXPLANATION
Explain the following concept based on the retrieved text.
Topic: {topic}
Provide your response in the following structure:
- Definition
- Detailed Explanation
- Example
- Real-World Application
- Analogy
- Key Takeaways""",
    
    "question_generation": """MODE: QUESTION GENERATION
Generate questions based on the text.
Number of questions: {num_questions}
Marks per question: {marks}
Focus Topic (if any): {topic}

For EACH question, provide the following structure:
- Question
- Structured Answer
- Keywords
- Focus Area"""
}

def format_context(retrieved_chunks: List[Dict[str, Any]]) -> str:
    if not retrieved_chunks:
        return ""
    context_text = "\n\n---\n\n".join([chunk["text"] for chunk in retrieved_chunks])
    return f"CONTEXT:\n{context_text}\n\n"

async def generate_response(
    mode: str, 
    retrieved_chunks: List[Dict[str, Any]], 
    topic: Optional[str] = None, 
    num_questions: Optional[int] = None, 
    marks: Optional[int] = None
) -> str:
    
    context_block = format_context(retrieved_chunks)
    
    # If no context found, we can fail early or let LLM decide. Failing early is safer for strict grounding.
    if not retrieved_chunks:
        return "The provided material does not contain enough information."

    mode_prompt_template = MODE_PROMPTS.get(mode, "Provide a helpful response based directly on the context.")
    
    # Format specific templates
    if mode == "exam_preparation" or mode == "concept_explanation":
        mode_instruction = mode_prompt_template.format(topic=topic or "General")
    elif mode == "question_generation":
        mode_instruction = mode_prompt_template.format(
            num_questions=num_questions or 5,
            marks=marks or 5,
            topic=topic or "General"
        )
    else:
        mode_instruction = mode_prompt_template

    full_prompt = f"{MASTER_PROMPT}\n\n{context_block}\n\n{mode_instruction}"
    
    payload = {
        "model": DEFAULT_MODEL,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": 0.3
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(OLLAMA_URL, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "No response generated.")
        except Exception as e:
            return f"Error communicating with local LLM (Ollama): {str(e)}"
