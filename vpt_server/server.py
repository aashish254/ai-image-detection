"""
VPT Artifact Sentinel - FastAPI Inference Server
=================================================
Loads the fine-tuned LoRA adapter (Qwen2.5-VL-7B) and exposes an API
for detecting AI artifacts in images with bounding box coordinates.

WINDOWS COMPATIBILITY:
    The VPT model requires `unsloth` which depends on `triton` (Linux-only GPU compiler).
    On Windows, the VPT model will run in DEMO mode but the local classifier
    (Organika/sdxl-detector) will work perfectly on CPU.

Usage:
    python server.py
    # or
    uvicorn server:app --host 0.0.0.0 --port 8100
"""

import os
import re
import sys
import json
import base64
import logging
import platform
from io import BytesIO
from typing import Optional
from contextlib import asynccontextmanager

# ============================================================
# CRITICAL: Disable Triton on Windows BEFORE importing torch
# ============================================================
# The `transformers` library (and PyTorch) try to import triton
# for optimized CUDA kernel compilation. Triton does NOT work
# on Windows, causing:
#   "cannot import name 'AttrsDescriptor' from 'triton.compiler.compiler'"
#
# Setting these environment variables BEFORE importing torch
# prevents this error entirely.
# ============================================================
if platform.system() == "Windows":
    os.environ["TORCH_COMPILE_DISABLE"] = "1"    # Disable torch.compile (uses triton)
    os.environ["TORCHINDUCTOR_DISABLE"] = "1"    # Disable TorchInductor (uses triton)

    def _patch_triton_for_windows():
        """
        Fix the 'cannot import name AttrsDescriptor from triton.compiler.compiler' error.
        
        On Windows, triton is installed but the `triton.compiler.compiler` module
        is missing the `AttrsDescriptor` class (it exists in the Linux version).
        The `transformers` library tries to import it, causing a crash.
        
        Fix: Simply add a dummy AttrsDescriptor to the existing module.
        This preserves all working triton functionality (Config, jit, etc.)
        while fixing the specific missing attribute error.
        """
        try:
            import triton.compiler.compiler as tcc
            if not hasattr(tcc, "AttrsDescriptor"):
                class AttrsDescriptor:
                    """Dummy AttrsDescriptor for Windows compatibility."""
                    divisible_by_16 = ()
                    equal_to_1 = ()
                    ids_of_folded_args = ()
                    divisible_by_8 = ()
                    
                    def __init__(self, divisible_by_16=(), equal_to_1=(),
                                 ids_of_folded_args=(), divisible_by_8=(), *args, **kwargs):
                        self.divisible_by_16 = divisible_by_16
                        self.equal_to_1 = equal_to_1
                        self.ids_of_folded_args = ids_of_folded_args
                        self.divisible_by_8 = divisible_by_8
                
                tcc.AttrsDescriptor = AttrsDescriptor
                logging.basicConfig(level=logging.INFO)
                logging.getLogger("vpt-server").info(
                    "[Windows] Patched triton.compiler.compiler.AttrsDescriptor — "
                    "transformer models can now load with CUDA"
                )
            else:
                logging.basicConfig(level=logging.INFO)
                logging.getLogger("vpt-server").info(
                    "[Windows] triton.compiler.compiler.AttrsDescriptor already exists — no patch needed"
                )
        except ImportError:
            # triton is not installed at all — that's fine,
            # transformers will just not use triton-compiled kernels
            logging.basicConfig(level=logging.INFO)
            logging.getLogger("vpt-server").info(
                "[Windows] triton not installed — no patch needed"
            )
        except Exception as e:
            logging.basicConfig(level=logging.INFO)
            logging.getLogger("vpt-server").warning(
                f"[Windows] Failed to patch triton: {e} — classifier may not load"
            )

    _patch_triton_for_windows()

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import torch
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vpt-server")

# ============================================================
# Platform Detection
# ============================================================
IS_WINDOWS = platform.system() == "Windows"
IS_MACOS = platform.system() == "Darwin"
HAS_CUDA = torch.cuda.is_available()
HAS_MPS = hasattr(torch.backends, 'mps') and torch.backends.mps.is_available() if IS_MACOS else False

if IS_WINDOWS:
    logger.info("=" * 60)
    logger.info("  Running on WINDOWS")
    if HAS_CUDA:
        logger.info("  VPT Model: Loading via transformers + peft (no unsloth needed)")
        logger.info("  Local Classifier (Organika): ENABLED (CUDA)")
    else:
        logger.info("  VPT Model: DISABLED (no CUDA GPU detected)")
        logger.info("  Local Classifier (Organika): ENABLED (CPU)")
    logger.info("=" * 60)
elif IS_MACOS:
    logger.info("=" * 60)
    logger.info("  Running on macOS (Apple Silicon)" if platform.machine() == 'arm64' else "  Running on macOS (Intel)")
    logger.info(f"  MPS (Metal) Available: {HAS_MPS}")
    logger.info("  VPT Model: DEMO MODE (requires NVIDIA CUDA GPU)")
    logger.info("  Local Classifier (Organika): ENABLED (CPU)")
    logger.info("=" * 60)

# ============================================================
# Global model references
# ============================================================
# VPT Model (Qwen2.5-VL + LoRA)
model = None
tokenizer = None
vpt_load_error = None  # Store the error message for diagnostics

# Local Classifier (Organika/sdxl-detector)
classifier_model = None
classifier_processor = None
classifier_device = None


class VPTDetection(BaseModel):
    """Single detection result."""
    label: str
    confidence: float
    bbox: Optional[list] = None  # [ymin, xmin, ymax, xmax] normalized 0-1
    description: str


class VPTResponse(BaseModel):
    """Full VPT analysis response."""
    verdict: str  # "Real" or "AI_GENERATED"
    detections: list[VPTDetection]
    raw_output: str
    model_loaded: bool


def load_model():
    """
    Load the VPT model with LoRA adapter.
    
    Uses standard transformers + peft + bitsandbytes (works on ALL platforms with CUDA).
    Does NOT require unsloth or triton.
    """
    global model, tokenizer, vpt_load_error

    if not HAS_CUDA:
        vpt_load_error = (
            "VPT model requires CUDA GPU. No GPU detected. "
            "Running in DEMO mode."
        )
        logger.warning(f"[VPT] {vpt_load_error}")
        return False

    # Check VRAM
    try:
        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        gpu_name = torch.cuda.get_device_name(0)
        logger.info(f"[VPT] GPU: {gpu_name} ({vram_gb:.1f} GB VRAM)")
        if vram_gb < 3.5:
            vpt_load_error = (
                f"Insufficient VRAM ({vram_gb:.1f} GB). "
                "VPT model requires at least 4 GB VRAM in 4-bit mode."
            )
            logger.warning(f"[VPT] {vpt_load_error}")
            return False
    except Exception:
        pass

    # Determine the adapter path
    adapter_path = os.environ.get(
        "VPT_MODEL_PATH",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "vpt_model_download")
    )

    if not os.path.exists(adapter_path):
        vpt_load_error = f"Model adapter path not found: {adapter_path}"
        logger.error(f"[VPT] {vpt_load_error}")
        return False

    logger.info(f"Loading VPT Sentinel from {adapter_path}...")

    try:
        from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor, BitsAndBytesConfig
        from peft import PeftModel
        import gc

        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        logger.info(f"[VPT] GPU VRAM: {vram_gb:.1f} GB")

        loaded_on_gpu = False

        # ── Strategy 1: Try 4-bit on GPU only ──────────────────────
        # BitsAndBytes 4-bit requires ALL quantized layers on GPU.
        # With 4GB VRAM, the ~4GB 4-bit model is very tight.
        if vram_gb >= 3.5:
            try:
                logger.info("[VPT] Trying: 4-bit quantization on GPU (device_map={'':0})...")
                bnb_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_use_double_quant=True,
                )
                base_model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
                    "Qwen/Qwen2.5-VL-7B-Instruct",
                    quantization_config=bnb_config,
                    device_map={"": 0},  # Force everything on GPU 0
                    torch_dtype=torch.float16,
                    trust_remote_code=True,
                    low_cpu_mem_usage=True,
                )
                loaded_on_gpu = True
                logger.info("[VPT] ✓ Base model loaded on GPU in 4-bit!")
            except (RuntimeError, ValueError, torch.cuda.OutOfMemoryError) as gpu_err:
                logger.warning(f"[VPT] GPU-only loading failed: {gpu_err}")
                logger.info("[VPT] Falling back to CPU mode...")
                # Clean up any partial GPU allocations
                if 'base_model' in dir():
                    del base_model
                gc.collect()
                torch.cuda.empty_cache()

        # ── Strategy 2: Load on CPU with float16 ──────────────────
        if not loaded_on_gpu:
            import psutil
            available_ram_gb = psutil.virtual_memory().available / 1024**3
            logger.info(f"[VPT] Available RAM: {available_ram_gb:.1f} GB")
            
            if available_ram_gb < 10:
                vpt_load_error = (
                    f"Not enough memory for VPT model. "
                    f"GPU has {vram_gb:.1f} GB (need 5+ GB for 4-bit), "
                    f"RAM has {available_ram_gb:.1f} GB (need 14+ GB for CPU mode). "
                    f"Close other applications to free memory."
                )
                logger.error(f"[VPT] {vpt_load_error}")
                return False

            logger.info("[VPT] Loading on CPU in float16 (slower but reliable)...")
            base_model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
                "Qwen/Qwen2.5-VL-7B-Instruct",
                device_map="cpu",
                torch_dtype=torch.float16,
                trust_remote_code=True,
                low_cpu_mem_usage=True,
            )
            logger.info("[VPT] ✓ Base model loaded on CPU!")

        logger.info("[VPT] Applying LoRA adapter...")
        base_model.load_adapter(adapter_path)
        model = base_model
        model.eval()

        # Load the processor/tokenizer
        tokenizer = AutoProcessor.from_pretrained(
            "Qwen/Qwen2.5-VL-7B-Instruct",
            trust_remote_code=True,
        )

        device_label = "GPU (4-bit)" if loaded_on_gpu else "CPU (float16)"
        logger.info(f"VPT Sentinel Loaded & Ready on {device_label}.")
        vpt_load_error = None
        return True

    except ImportError as e:
        vpt_load_error = (
            f"Missing dependency: {e}. "
            "Please install: pip install transformers peft bitsandbytes accelerate"
        )
        logger.warning(f"[VPT] {vpt_load_error}")
        return False

    except torch.cuda.OutOfMemoryError:
        vpt_load_error = (
            "Out of GPU memory loading VPT model. "
            "The 7B model in 4-bit mode needs ~4 GB VRAM. "
            "Try closing other GPU applications."
        )
        logger.error(f"[VPT] {vpt_load_error}")
        # Clean up partial load
        model = None
        tokenizer = None
        torch.cuda.empty_cache()
        return False

    except Exception as e:
        vpt_load_error = f"Failed to load VPT model: {e}"
        logger.error(f"[VPT] {vpt_load_error}")
        logger.info("Server will run in DEMO mode (simulated detections)")
        return False


def load_classifier():
    """
    Load the Organika/sdxl-detector model for local AI image classification.
    
    This model works on both Windows (CPU) and Linux (GPU).
    It does NOT require triton or unsloth.
    """
    global classifier_model, classifier_processor, classifier_device

    # Check for local model first, then fall back to HuggingFace hub
    local_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "local_models", "sdxl_detector"
    )

    model_source = local_path if os.path.exists(local_path) else "Organika/sdxl-detector"
    logger.info(f"Loading classifier from: {model_source}")

    try:
        from transformers import AutoModelForImageClassification, AutoFeatureExtractor

        # Determine device — use CPU to save GPU VRAM for VPT model
        # The classifier is small and fast enough on CPU
        classifier_device = torch.device("cpu")
        logger.info("Classifier will run on CPU (GPU VRAM reserved for VPT model)")

        # Load model and processor (stays in memory)
        classifier_processor = AutoFeatureExtractor.from_pretrained(model_source)
        classifier_model = AutoModelForImageClassification.from_pretrained(model_source)
        classifier_model.to(classifier_device)
        classifier_model.eval()

        logger.info(f"OK - Organika/sdxl-detector loaded successfully on {classifier_device}")
        logger.info(f"  Labels: {classifier_model.config.id2label}")
        return True

    except Exception as e:
        logger.error(f"Failed to load classifier: {e}")
        logger.info("Classifier endpoint will return errors until model is available")
        return False


def parse_vpt_output(raw_text: str, img_width: int, img_height: int) -> list[VPTDetection]:
    """
    Parse the VPT model output text to extract detections.
    
    Expected formats:
    - "Real" → no detections
    - "AI detected at [ymin, xmin, ymax, xmax]" → bounding box detection
    - Could also contain multiple coordinates or descriptive text
    """
    detections = []

    if not raw_text or raw_text.strip().lower() == "real":
        return detections

    # Pattern: "AI detected at [ymin, xmin, ymax, xmax]"
    bbox_pattern = r'\[?\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*\]?'
    matches = re.findall(bbox_pattern, raw_text)

    for match in matches:
        try:
            ymin, xmin, ymax, xmax = [float(v) for v in match]

            # Normalize coordinates to 0-1 range if they are in pixel coordinates
            if ymin > 1 or xmin > 1 or ymax > 1 or xmax > 1:
                ymin /= img_height
                xmin /= img_width
                ymax /= img_height
                xmax /= img_width

            # Clamp to [0, 1]
            ymin = max(0, min(1, ymin))
            xmin = max(0, min(1, xmin))
            ymax = max(0, min(1, ymax))
            xmax = max(0, min(1, xmax))

            detections.append(VPTDetection(
                label="AI Artifact",
                confidence=0.85,
                bbox=[ymin, xmin, ymax, xmax],
                description=f"AI generation artifact detected in region ({xmin:.2f}, {ymin:.2f}) to ({xmax:.2f}, {ymax:.2f})"
            ))
        except (ValueError, IndexError):
            continue

    # If we found "AI detected" but no valid bbox, create a general detection
    if not detections and ("ai" in raw_text.lower() and "detect" in raw_text.lower()):
        detections.append(VPTDetection(
            label="AI Artifact (General)",
            confidence=0.7,
            bbox=None,
            description="AI artifacts detected but specific coordinates could not be extracted"
        ))

    return detections


def analyze_image(image: Image.Image) -> VPTResponse:
    """Run VPT inference on an image."""
    global model, tokenizer

    if model is None or tokenizer is None:
        # DEMO MODE: Return simulated result
        reason = vpt_load_error or "Model not loaded"
        logger.warning(f"Model not loaded — returning demo result ({reason})")
        return VPTResponse(
            verdict="DEMO_MODE",
            detections=[],
            raw_output=f"Model not loaded: {reason}. Running in demo mode.",
            model_loaded=False
        )

    try:
        img_rgb = image.convert("RGB")
        width, height = img_rgb.size

        # Construct message with image
        messages = [
            {"role": "user", "content": [
                {"type": "image", "image": img_rgb},
                {"type": "text", "text": "Locate AI artifacts."}
            ]}
        ]

        # Apply chat template to get the text prompt
        text_prompt = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=False,
        )

        # Process text + image together
        inputs = tokenizer(
            text=[text_prompt],
            images=[img_rgb],
            padding=True,
            return_tensors="pt",
        ).to(model.device)

        # Generate
        with torch.inference_mode():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=128,
            )

        # Decode only the generated tokens (exclude input tokens)
        generated_ids = output_ids[:, inputs["input_ids"].shape[1]:]
        raw_output = tokenizer.batch_decode(
            generated_ids, skip_special_tokens=True
        )[0]
        logger.info(f"VPT raw output: {raw_output}")

        # Parse output
        # Extract only the assistant's response (after the last prompt)
        assistant_response = raw_output
        if "Locate AI artifacts." in raw_output:
            assistant_response = raw_output.split("Locate AI artifacts.")[-1].strip()

        detections = parse_vpt_output(assistant_response, width, height)

        verdict = "Real" if len(detections) == 0 else "AI_GENERATED"

        return VPTResponse(
            verdict=verdict,
            detections=detections,
            raw_output=assistant_response,
            model_loaded=True
        )

    except Exception as e:
        logger.error(f"Inference error: {e}")
        return VPTResponse(
            verdict="ERROR",
            detections=[],
            raw_output=f"Error during inference: {str(e)}",
            model_loaded=True
        )


# ============================================================
# FastAPI App
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    logger.info("=" * 60)
    logger.info(f"  Starting VPT Artifact Sentinel Server")
    logger.info(f"  Platform: {platform.system()} {platform.machine()}")
    logger.info(f"  CUDA Available: {HAS_CUDA}")
    if HAS_CUDA:
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
        logger.info(f"  GPU: {gpu_name} ({vram_gb:.1f} GB)")
    logger.info("=" * 60)

    # Load VPT model FIRST — it's the core feature
    logger.info("Starting VPT + Classifier server on port 8100...")
    vpt_success = load_model()
    if vpt_success:
        logger.info("✓ VPT Model is READY")
    else:
        logger.warning("✗ VPT running in DEMO mode — model not loaded")
        if vpt_load_error:
            logger.info(f"  Reason: {vpt_load_error}")

    # Load Organika classifier
    cls_success = load_classifier()
    if cls_success:
        logger.info("✓ Local Classifier (Organika/sdxl-detector) is READY")
    else:
        logger.warning("✗ Classifier not loaded — /classify-local will be unavailable")

    logger.info("=" * 60)
    logger.info("  Server Status Summary:")
    logger.info(f"    VPT Model:  {'✓ READY' if vpt_success else '✗ DEMO MODE'}")
    logger.info(f"    Classifier: {'✓ READY' if cls_success else '✗ UNAVAILABLE'}")
    logger.info("=" * 60)

    yield
    # Cleanup
    logger.info("Shutting down VPT server")


app = FastAPI(
    title="VPT Artifact Sentinel",
    description="Forensic AI Image Artifact Detection with bounding box localization",
    version="1.1.0",
    lifespan=lifespan
)

# CORS for Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "platform": platform.system(),
        "cuda_available": HAS_CUDA,
        "model_loaded": model is not None,
        "model_error": vpt_load_error,
        "classifier_loaded": classifier_model is not None,
        "classifier_device": str(classifier_device) if classifier_device else "none",
        "models": {
            "vpt": {
                "name": "VPT Artifact Sentinel v1.0 (Qwen2.5-VL-7B + LoRA)",
                "status": "loaded" if model is not None else "demo_mode",
                "reason": vpt_load_error if model is None else None,
            },
            "classifier": {
                "name": "Organika/sdxl-detector (local)",
                "status": "loaded" if classifier_model is not None else "unavailable",
                "device": str(classifier_device) if classifier_device else "none",
            },
        }
    }


@app.post("/analyze", response_model=VPTResponse)
async def analyze_endpoint(file: UploadFile = File(None), image_base64: str = Form(None)):
    """
    Analyze an image for AI artifacts.
    
    Accepts either:
    - file: uploaded image file
    - image_base64: base64-encoded image (with or without data URL prefix)
    """
    image = None

    if file:
        contents = await file.read()
        image = Image.open(BytesIO(contents))
    elif image_base64:
        # Strip data URL prefix if present
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
        img_bytes = base64.b64decode(image_base64)
        image = Image.open(BytesIO(img_bytes))
    else:
        raise HTTPException(status_code=400, detail="No image provided. Send 'file' or 'image_base64'.")

    result = analyze_image(image)
    return result


@app.post("/analyze-json")
async def analyze_json_endpoint(data: dict):
    """
    Analyze image from JSON body with base64 image data.
    This is the primary endpoint called from Next.js API routes.
    """
    image_data = data.get("image", "")

    if not image_data:
        raise HTTPException(status_code=400, detail="No image provided in 'image' field.")

    # Strip data URL prefix
    if "base64," in image_data:
        image_data = image_data.split("base64,")[1]

    try:
        img_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(img_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

    result = analyze_image(image)

    return {
        "verdict": result.verdict,
        "detections": [d.model_dump() for d in result.detections],
        "raw_output": result.raw_output,
        "model_loaded": result.model_loaded
    }


# ============================================================
# NEW: Local Classification Endpoint (Organika/sdxl-detector)
# ============================================================

class ClassifyResponse(BaseModel):
    """Response from the local classifier."""
    ai_score: float          # 0-1 probability of AI generation
    confidence: float        # How confident the model is
    label: str               # Human-readable label
    all_scores: dict         # All class scores
    model_name: str
    device: str


@app.post("/classify-local", response_model=ClassifyResponse)
async def classify_local_endpoint(
    file: UploadFile = File(None),
    image_base64: str = Form(None)
):
    """
    Classify an image as AI-generated or Real using the local Organika/sdxl-detector.
    
    Accepts either:
    - file: uploaded image file (multipart/form-data)
    - image_base64: base64-encoded image string
    
    Returns: AI probability score (0-1)
    """
    global classifier_model, classifier_processor, classifier_device

    if classifier_model is None or classifier_processor is None:
        raise HTTPException(
            status_code=503,
            detail="Classifier model not loaded. Please ensure Organika/sdxl-detector is downloaded."
        )

    # Decode image
    image = None
    if file:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
    elif image_base64:
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
        img_bytes = base64.b64decode(image_base64)
        image = Image.open(BytesIO(img_bytes)).convert("RGB")
    else:
        raise HTTPException(status_code=400, detail="No image provided. Send 'file' or 'image_base64'.")

    try:
        # Preprocess
        inputs = classifier_processor(images=image, return_tensors="pt")
        inputs = {k: v.to(classifier_device) for k, v in inputs.items()}

        # Inference (no gradients needed)
        with torch.inference_mode():
            outputs = classifier_model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]

        # Map label indices to names
        id2label = classifier_model.config.id2label
        all_scores = {id2label[i]: float(probs[i]) for i in range(len(probs))}

        # Find the AI score
        ai_score = 0.5  # Default neutral
        for idx, label_name in id2label.items():
            ln = label_name.lower()
            if "ai" in ln or "fake" in ln or "generated" in ln or "artificial" in ln or "sdxl" in ln:
                ai_score = float(probs[idx])
                break
            elif "real" in ln or "human" in ln or "authentic" in ln or "natural" in ln:
                ai_score = 1.0 - float(probs[idx])
                break

        # Determine label
        top_idx = int(torch.argmax(probs))
        top_label = id2label[top_idx]
        confidence = float(probs[top_idx])

        logger.info(f"[Classifier] Scores: {all_scores}, AI Score: {ai_score:.4f}")

        return ClassifyResponse(
            ai_score=ai_score,
            confidence=confidence,
            label=top_label,
            all_scores=all_scores,
            model_name="Organika/sdxl-detector",
            device=str(classifier_device)
        )

    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@app.post("/classify-json")
async def classify_json_endpoint(data: dict):
    """
    Classify image from JSON body (for Next.js API route integration).
    Accepts: {"image": "data:image/...;base64,..."}
    Returns: {"ai_score": float, "confidence": float, ...}
    """
    global classifier_model, classifier_processor, classifier_device

    if classifier_model is None or classifier_processor is None:
        raise HTTPException(
            status_code=503,
            detail="Classifier model not loaded."
        )

    image_data = data.get("image", "")
    if not image_data:
        raise HTTPException(status_code=400, detail="No image provided in 'image' field.")

    if "base64," in image_data:
        image_data = image_data.split("base64,")[1]

    try:
        img_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

    try:
        inputs = classifier_processor(images=image, return_tensors="pt")
        inputs = {k: v.to(classifier_device) for k, v in inputs.items()}

        with torch.inference_mode():
            outputs = classifier_model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)[0]

        id2label = classifier_model.config.id2label
        all_scores = {id2label[i]: float(probs[i]) for i in range(len(probs))}

        ai_score = 0.5
        for idx, label_name in id2label.items():
            ln = label_name.lower()
            if "ai" in ln or "fake" in ln or "generated" in ln or "artificial" in ln or "sdxl" in ln:
                ai_score = float(probs[idx])
                break
            elif "real" in ln or "human" in ln or "authentic" in ln or "natural" in ln:
                ai_score = 1.0 - float(probs[idx])
                break

        top_idx = int(torch.argmax(probs))
        top_label = id2label[top_idx]
        confidence = float(probs[top_idx])

        logger.info(f"[Classifier/JSON] AI Score: {ai_score:.4f}, Label: {top_label}")

        return {
            "ai_score": ai_score,
            "confidence": confidence,
            "label": top_label,
            "all_scores": all_scores,
            "model_name": "Organika/sdxl-detector",
            "device": str(classifier_device)
        }

    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("VPT_PORT", 8100))
    logger.info(f"Starting VPT + Classifier server on port {port}...")
    if IS_WINDOWS:
        logger.info("NOTE: On Windows, only the classifier will be active (VPT requires Linux GPU)")
    elif IS_MACOS:
        logger.info("NOTE: On macOS, only the classifier will be active (VPT requires NVIDIA CUDA GPU)")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
