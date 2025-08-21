import { spawn } from 'child_process';
import path from 'path';

export async function extractAudioFromMedia(mediaPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputAudio = path.join(outputDir, path.basename(mediaPath, path.extname(mediaPath)) + '.wav');
    const ffmpeg = spawn('ffmpeg', ['-i', mediaPath, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', outputAudio]);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputAudio);
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
    ffmpeg.on('error', (err) => reject(err));
  });
}
