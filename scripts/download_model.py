"""
Download ML model weights for AI Image Detection.
Run this after cloning the repository.

Models are hosted on HuggingFace and downloaded to local directories.
Total download size: ~540MB

Usage:
    python scripts/download_model.py
"""

import os
import sys

def download_classifier():
    """Download the Organika/sdxl-detector model from HuggingFace."""
    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        print("Installing huggingface_hub...")
        os.system(f"{sys.executable} -m pip install huggingface_hub")
        from huggingface_hub import snapshot_download

    model_dir = os.path.join(os.path.dirname(__file__), '..', 'local_models', 'sdxl_detector')
    os.makedirs(model_dir, exist_ok=True)

    print("📥 Downloading Organika/sdxl-detector classifier (~331MB)...")
    print("   Source: https://huggingface.co/Organika/sdxl-detector")
    snapshot_download(
        repo_id="Organika/sdxl-detector",
        local_dir=model_dir,
        local_dir_use_symlinks=False,
        # Only download essential files (skip training checkpoints & ONNX)
        ignore_patterns=["checkpoint-*", "onnx/*", "training_*", ".gitattributes"],
    )
    print(f"✅ Classifier model saved to: {model_dir}")


def download_vpt_adapter():
    """Download the VPT model adapter weights (trained by project author)."""
    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        print("Installing huggingface_hub...")
        os.system(f"{sys.executable} -m pip install huggingface_hub")
        from huggingface_hub import snapshot_download

    model_dir = os.path.join(os.path.dirname(__file__), '..', 'vpt_model_download')
    os.makedirs(model_dir, exist_ok=True)

    print("📥 Downloading VPT Artifact Sentinel adapter (~208MB)...")
    print("   Source: https://huggingface.co/aashish254/vpt-artifact-sentinel-v1")
    print("   NOTE: VPT model requires NVIDIA CUDA GPU. On macOS it runs in demo mode.")
    snapshot_download(
        repo_id="aashish254/vpt-artifact-sentinel-v1",
        local_dir=model_dir,
        local_dir_use_symlinks=False,
    )
    print(f"✅ VPT adapter saved to: {model_dir}")


if __name__ == "__main__":
    print("=" * 60)
    print("  OriginLayer — ML Model Downloader")
    print("=" * 60)
    print()
    print("  Models are hosted on HuggingFace Hub.")
    print("  This script downloads them to the correct local directories.")
    print()

    download_classifier()
    print()
    download_vpt_adapter()

    print()
    print("=" * 60)
    print("  All models downloaded! You can now run the project.")
    print("  Run: npm run dev  (frontend)")
    print("  Run: cd vpt_server && python server.py  (backend)")
    print("=" * 60)
