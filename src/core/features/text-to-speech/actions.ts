'use server';

// import fs from 'fs';
// import path from 'path';

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

interface TTSOptions {
  rate?: number; // 0.25-4.0, default: 1.0
  pitch?: number; // -20.0-20.0, default: 0.0
  volumeGain?: number; // -96.0-16.0, default: 0.0
}

interface TTSResult {
  success: boolean;
  data?: string; // Base64 encoded audio string
  error?: string;
}

// Parse credentials once at module level
function parseCredentialsFromBase64() {
  const credentialsBase64 = process.env.GOOGLE_TTS_CREDENTIALS;

  if (!credentialsBase64) {
    console.error('GOOGLE_TTS_CREDENTIALS environment variable not found');
    return null;
  }

  try {
    const decodedJson = Buffer.from(credentialsBase64, 'base64').toString(
      'utf-8'
    );
    const credentials = JSON.parse(decodedJson);
    return credentials;
  } catch (error) {
    console.error('Failed to parse Google TTS credentials:', error);
    return null;
  }
}

// Initialize client once at module level
const credentials = parseCredentialsFromBase64();
const client = credentials
  ? new TextToSpeechClient({
      credentials,
      projectId: credentials.project_id,
    })
  : null;

export async function convertTextToSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<TTSResult> {
  try {
    // Early validation - client initialization
    if (!client) {
      return {
        success: false,
        error:
          'TTS client not initialized. Check GOOGLE_TTS_CREDENTIALS environment variable',
      };
    }

    // Validate input
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Text input is required',
      };
    }

    // Set default options
    const { rate = 1.0, pitch = 0.0, volumeGain = 0.0 } = options;

    // Construct the request
    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Standard-F',
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        sampleRateHertz: 22050,
        speakingRate: rate,
        pitch: pitch,
        volumeGainDb: volumeGain,
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    if (!response.audioContent) {
      return {
        success: false,
        error: 'No audio content received from Google Cloud TTS',
      };
    }

    // Convert the audio content to base64 string for serialization
    const audioBuffer = Buffer.from(response.audioContent);
    const base64Audio = audioBuffer.toString('base64');

    // Dev
    // saveAudioBufferToMp3(audioBuffer, 'error');

    return {
      success: true,
      data: base64Audio,
    };
  } catch (error) {
    console.error('Text-to-Speech conversion error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// function saveAudioBufferToMp3(
//   audioBuffer: Buffer<ArrayBuffer>,
//   fileName: string
// ) {
//   // Target directory
//   const outputDir = path.join(process.cwd(), 'public', 'audio');

//   // Build regex from fileName, e.g., /^speech_(\d+)\.mp3$/
//   const pattern = new RegExp(`^${fileName}_(\\d+)\\.mp3$`);

//   // Read existing files matching the pattern
//   const files = fs.readdirSync(outputDir);
//   const matchedFiles = files.filter((file) => pattern.test(file));

//   // Extract numeric indices
//   const indices = matchedFiles.map((file) => {
//     const match = file.match(pattern);
//     return match ? parseInt(match[1], 10) : 0;
//   });

//   // Determine next index
//   const nextIndex = indices.length > 0 ? Math.max(...indices) + 1 : 1;

//   // Construct the new file name
//   const indexedFileName = `${fileName}_${nextIndex}.mp3`;
//   const filePath = path.join(outputDir, indexedFileName);

//   // Save the audio buffer to file
//   fs.writeFileSync(filePath, audioBuffer);

//   // Return the public path
//   return `/audio/greetings/${indexedFileName}`;
// }
