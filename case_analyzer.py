import os
import json
from pathlib import Path

# Ollama (local LLM)
try:
    import ollama
    OLLAMA_AVAILABLE = True
except Exception:
    OLLAMA_AVAILABLE = False

# Force the model to mistral:7b-instruct

OLLAMA_MODEL = "mistral:7b-instruct"


def analyze_case_with_ai(case_number, case_type, description, filed_date):
    """
    Analyze case using local Ollama mistral:7b-instruct.
    Falls back to rule-based if Ollama is unavailable or fails.
    """
    if not description or not description.strip():
        return analyze_case_rule_based(case_type, description)

    prompt = f"""
You are a legal case analyzer for an Indian court system (Nya-Alaya). Analyze the following case and provide assessments.

Case Number: {case_number}
Case Type: {case_type}
Filed Date: {filed_date}
Description: {description}

Based on the description, analyze:

1. Urgency (0.0 to 1.0): How urgently does this case need to be heard?
   - Consider: victim safety, time-sensitive matters, statute of limitations, Indian legal context
   - 0.9-1.0: Extremely urgent (e.g., habeas corpus, domestic violence, bail matters)
   - 0.7-0.8: High urgency (e.g., serious criminal cases, child custody)
   - 0.5-0.6: Moderate urgency (e.g., civil disputes, property matters)
   - 0.2-0.4: Low urgency (e.g., routine civil/property disputes)

2. Estimated Duration (in minutes): How long will the hearing take?
   - Consider: complexity, number of witnesses, evidence volume, arguments needed
   - Simple: 30-60, Standard: 60-120, Complex: 120-240

3. Complexity: "low" | "medium" | "high"

Respond ONLY with strict JSON (no markdown, no extra text):
{{
  "urgency": 0 to 1,
  "estimated_duration": 30 to 240,
  "complexity": "low" | "medium" | "high",
  "reasoning": "Brief explanation of your assessment"
}}
""".strip()

    if OLLAMA_AVAILABLE:
        try:
            resp = ollama.chat(
                model=OLLAMA_MODEL,
                messages=[
                    {"role": "system", "content": "Respond only with valid JSON. No markdown."},
                    {"role": "user", "content": prompt},
                ],
                options={"temperature": 0.2},
            )
            result_text = resp["message"]["content"].strip()
            return _normalize_json(result_text, case_type)
        except Exception as e:
            print(f"Ollama failed: {e}. Falling back to rule-based.")

    # Fallback
    return analyze_case_rule_based(case_type, description)


def _normalize_json(text: str, case_type: str):
    # Remove accidental fences
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
        text = text.replace("```json", "").replace("```", "").strip()

    # Extract JSON substring
    start, end = text.find("{"), text.rfind("}") + 1
    if start != -1 and end > start:
        text = text[start:end]

    data = json.loads(text)
    data["urgency"] = max(0.0, min(1.0, float(data.get("urgency", 0.5))))
    data["estimated_duration"] = max(30, min(300, int(data.get("estimated_duration", 60))))
    if "complexity" not in data:
        data["complexity"] = "medium"
    if "reasoning" not in data:
        data["reasoning"] = f"Model analysis for {case_type} case"
    return data


def analyze_case_rule_based(case_type, description):
    """Rule-based fallback (simple heuristics)."""
    base_urgency = {
        'criminal': 0.8,
        'family': 0.7,
        'civil': 0.5,
        'other': 0.4
    }.get(case_type, 0.5)

    base_duration = {
        'criminal': 90,
        'family': 60,
        'civil': 75,
        'other': 60
    }.get(case_type, 60)

    complexity = 'medium'

    if description:
        desc_lower = description.lower()

        urgent_keywords = ['urgent', 'emergency', 'immediate', 'violence', 'danger',
                           'bail', 'custody', 'domestic violence', 'habeas corpus']
        if any(word in desc_lower for word in urgent_keywords):
            base_urgency = min(1.0, base_urgency + 0.2)
            complexity = 'high'

        complex_keywords = ['complex', 'multiple parties', 'extensive evidence',
                            'witnesses', 'cross-examination', 'expert testimony']
        simple_keywords = ['simple', 'straightforward', 'minor', 'uncontested']

        if any(word in desc_lower for word in complex_keywords):
            base_duration += 30
            complexity = 'high'
        elif any(word in desc_lower for word in simple_keywords):
            base_duration = max(30, base_duration - 15)
            complexity = 'low'

    return {
        'urgency': round(base_urgency, 2),
        'estimated_duration': max(30, base_duration),
        'complexity': complexity,
        'reasoning': f'Rule-based analysis for {case_type} case (local model unavailable)'
    }


def calculate_ai_priority(case, ai_analysis):
    """Priority = 0.7*urgency + 0.15*age + 0.15*type_weight"""
    from datetime import date

    age_days = (date.today() - case.filed_in).days
    age_score = min(age_days / 365, 1.0)

    type_weight = {
        'criminal': 0.9,
        'family': 0.8,
        'civil': 0.7,
        'other': 0.6
    }.get(case.case_type, 0.7)

    urgency = ai_analysis.get('urgency', 0.5)

    # Urgency now has 70% weight instead of 50%
    priority = (0.7 * urgency) + (0.15 * age_score) + (0.15 * type_weight)

    return round(min(priority, 1.0), 3)