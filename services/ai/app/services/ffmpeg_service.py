import os
import subprocess

def extract_audio_from_media(media_path: str, output_dir: str) -> str:
    base, _ = os.path.splitext(os.path.basename(media_path))
    output_audio = os.path.join(output_dir, base + '.wav')
    cmd = [
        'ffmpeg', '-i', media_path, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', output_audio
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return output_audio
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f'ffmpeg failed: {e.stderr.decode()}')
