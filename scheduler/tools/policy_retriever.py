import numpy as np
from sentence_transformers import SentenceTransformer
from scheduler.models import Policy

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text: str):
    return model.encode([text])[0].tolist()

def add_policy(title: str, content: str, source: str = "internal"):
    emb = embed_text(content)
    policy = Policy.objects.create(title=title, content=content, embedding=emb, source=source)
    return policy

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def retrieve_policies(query: str, top_k: int = 3):
    q_emb = embed_text(query)
    results = []
    for p in Policy.objects.all():
        sim = cosine_similarity(p.embedding, q_emb)
        results.append((p, sim))
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]
