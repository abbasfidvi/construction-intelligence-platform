import os
import json
import base64
import re
from typing import Optional, Dict, Any, List
from backend.config import settings

# Attempt to import google-genai
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except Exception:
    GENAI_AVAILABLE = False

class GeminiService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        
        if GENAI_AVAILABLE and self.api_key:
            try:
                # Configure client with reasonable timeout to guarantee rapid fallback
                self.client = genai.Client(
                    api_key=self.api_key,
                    http_options={"timeout": 15000}
                )
            except Exception as e:
                print(f"[GeminiService] Warning initializing client: {e}")
                self.client = None

    def is_configured(self) -> bool:
        return self.client is not None

    def _clean_json_text(self, text: str) -> str:
        """Strip markdown fences and trim whitespace."""
        text = text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
            text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
        return text.strip()

    def generate_json_response(self, prompt: str, image_base64: Optional[str] = None, system_instruction: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Call Gemini multimodal model and parse strictly valid JSON."""
        if not self.is_configured():
            return None

        try:
            contents: List[Any] = []
            
            # If an image is provided, decode and add as part
            if image_base64:
                # Handle data URL prefix
                if "," in image_base64:
                    header, data_part = image_base64.split(",", 1)
                    mime = "image/jpeg"
                    if "image/png" in header:
                        mime = "image/png"
                    elif "image/webp" in header:
                        mime = "image/webp"
                else:
                    data_part = image_base64
                    mime = "image/jpeg"

                image_bytes = base64.b64decode(data_part)
                img_part = types.Part.from_bytes(data=image_bytes, mime_type=mime)
                contents.append(img_part)

            contents.append(prompt)

            config = None
            if system_instruction:
                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json"
                )
            else:
                config = types.GenerateContentConfig(
                    response_mime_type="application/json"
                )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config
            )

            raw_text = response.text or ""
            clean_text = self._clean_json_text(raw_text)
            parsed = json.loads(clean_text)
            return parsed
        except Exception as e:
            print(f"[GeminiService] AI generation error: {e}")
            return None

    def generate_chat_response(self, prompt: str, conversation_history: List[Dict[str, str]], image_base64: Optional[str] = None) -> Optional[str]:
        """Generate conversational response with chat context and optional multimodal attachment."""
        if not self.is_configured():
            return None

        try:
            contents: List[Any] = []
            
            # Format history
            for turn in conversation_history[-6:]:
                role = turn.get("role", "user")
                c = turn.get("content", "")
                contents.append(f"{role.upper()}: {c}")

            if image_base64:
                if "," in image_base64:
                    header, data_part = image_base64.split(",", 1)
                    mime = "image/jpeg"
                    if "image/png" in header:
                        mime = "image/png"
                else:
                    data_part = image_base64
                    mime = "image/jpeg"
                img_bytes = base64.b64decode(data_part)
                contents.append(types.Part.from_bytes(data=img_bytes, mime_type=mime))

            contents.append(f"USER: {prompt}\nASSISTANT:")

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction="You are BuildIntel AI, an elite construction engineering and safety intelligence assistant. You provide precise, code-compliant, and actionable advice citing OSHA, ACI, IBC, and ASTM standards."
                )
            )
            return response.text
        except Exception as e:
            print(f"[GeminiService] Chat generation error: {e}")
            return None

gemini_service = GeminiService()
