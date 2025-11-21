import os
import json
from pathlib import Path

# Ollama (local LLM)
try:
    import ollama
    OLLAMA_AVAILABLE = True
    print("✓ Ollama module imported successfully")
except Exception as e:
    OLLAMA_AVAILABLE = False
    print(f"✗ Failed to import ollama: {type(e).__name__}: {e}")

# Using TinyLlama for better performance on resource-constrained servers

OLLAMA_MODEL = "tinyllama"


def analyze_case_with_ai(case_number, case_type, description, filed_date, timeout=30):
    """
    Analyze case using local Ollama tinyllama.
    timeout: seconds before falling back (None = unlimited)
    Falls back to enhanced rule-based if Ollama is unavailable, fails, or times out.
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
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError(f"AI analysis timed out after {timeout} seconds")
            
            # Set timeout only if specified
            if timeout:
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(timeout)
            
            try:
                resp = ollama.chat(
                    model=OLLAMA_MODEL,
                    messages=[
                        {"role": "system", "content": "Respond only with valid JSON. No markdown."},
                        {"role": "user", "content": prompt},
                    ],
                    options={"temperature": 0.2},
                )
                if timeout:
                    signal.alarm(0)  # Cancel timeout
                result_text = resp["message"]["content"].strip()
                return _normalize_json(result_text, case_type)
            except TimeoutError as e:
                if timeout:
                    signal.alarm(0)  # Cancel timeout
                print(f"AI analysis timed out for {case_number}. Falling back to enhanced rule-based.")
                return analyze_case_rule_based(case_type, description)
                
        except Exception as e:
            print(f"Ollama failed: {e}. Falling back to enhanced rule-based.")

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
    """Enhanced rule-based fallback with sophisticated heuristics."""
    
    # Base values by case type
    base_urgency = {
        'criminal': 0.75,
        'family': 0.65,
        'civil': 0.45,
        'other': 0.35
    }.get(case_type, 0.5)

    base_duration = {
        'criminal': 90,
        'family': 75,
        'civil': 60,
        'other': 45
    }.get(case_type, 60)

    complexity = 'medium'
    urgency_modifier = 0.0
    duration_modifier = 0
    
    if description:
        desc_lower = description.lower()
        
        # HIGH URGENCY indicators (+0.15 to +0.35)
        critical_keywords = {
            'emergency': 0.35, 'immediate': 0.3, 'urgent': 0.25,
            'bail': 0.3, 'habeas corpus': 0.35, 'life threat': 0.35,
            'domestic violence': 0.3, 'child abuse': 0.35, 'danger': 0.25,
            'custody': 0.2, 'injunction': 0.2, 'restraining': 0.2
        }
        
        for keyword, boost in critical_keywords.items():
            if keyword in desc_lower:
                urgency_modifier = max(urgency_modifier, boost)
        
        # COMPLEXITY indicators
        complex_indicators = [
            'multiple parties', 'witnesses', 'expert testimony', 'forensic',
            'extensive evidence', 'complex', 'cross-examination', 'appeal',
            'precedent', 'constitutional', 'interpretation'
        ]
        
        simple_indicators = [
            'simple', 'straightforward', 'uncontested', 'agreed',
            'minor', 'routine', 'procedural'
        ]
        
        complex_count = sum(1 for ind in complex_indicators if ind in desc_lower)
        simple_count = sum(1 for ind in simple_indicators if ind in desc_lower)
        
        if complex_count >= 2:
            complexity = 'high'
            duration_modifier += 45
        elif complex_count == 1:
            complexity = 'medium'
            duration_modifier += 20
        elif simple_count >= 1:
            complexity = 'low'
            duration_modifier -= 15
        
        # COUNT-BASED adjustments
        # Count witnesses (adds 10 min per witness mentioned)
        if 'witness' in desc_lower:
            import re
            # Look for numbers before "witness"
            witness_match = re.search(r'(\d+)\s+witness', desc_lower)
            if witness_match:
                num_witnesses = int(witness_match.group(1))
                duration_modifier += min(num_witnesses * 10, 60)  # Cap at +60 min
        
        # DURATION-SPECIFIC keywords
        time_keywords = {
            'brief': -15, 'quick': -10, 'lengthy': +30,
            'detailed': +20, 'extensive': +30, 'summary': -20
        }
        
        for keyword, time_mod in time_keywords.items():
            if keyword in desc_lower:
                duration_modifier += time_mod
        
        # SPECIAL CASE TYPES
        special_cases = {
            'murder': (0.3, 60, 'high'),
            'rape': (0.35, 60, 'high'),
            'kidnapping': (0.35, 45, 'high'),
            'fraud': (0.1, 30, 'medium'),
            'divorce': (0.0, -15, 'medium'),
            'property dispute': (-0.1, 15, 'medium'),
            'traffic': (-0.2, -20, 'low'),
        }
        
        for case_term, (urg_mod, dur_mod, comp) in special_cases.items():
            if case_term in desc_lower:
                urgency_modifier = max(urgency_modifier, urg_mod)
                duration_modifier += dur_mod
                complexity = comp
                break
    
    # Calculate final values
    final_urgency = max(0.0, min(1.0, base_urgency + urgency_modifier))
    final_duration = max(30, min(240, base_duration + duration_modifier))
    
    reasoning = f"Enhanced rule-based analysis: {case_type} case"
    if urgency_modifier > 0:
        reasoning += f" with high-priority indicators (urgency +{urgency_modifier:.2f})"
    if complexity != 'medium':
        reasoning += f", {complexity} complexity"
    
    return {
        'urgency': round(final_urgency, 2),
        'estimated_duration': final_duration,
        'complexity': complexity,
        'reasoning': reasoning
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