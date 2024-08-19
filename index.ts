import { Readable } from 'stream';
import { AssemblyAI, RealtimeTranscript } from 'assemblyai';
import { SoxRecording } from './sox.js';

const run = async () => {
  const client = new AssemblyAI({
    apiKey: '43ed169a127a4f9780c35ad6e95795bb', // Replace with your AssemblyAI API key
  });

  const SAMPLE_RATE = 16000;

  const transcriber = client.realtime.transcriber({
    sampleRate: SAMPLE_RATE,
  });

  transcriber.on('open', ({ sessionId }) => {
    console.log(`Session opened with ID: ${sessionId}`);
  });

  transcriber.on('error', (error: Error) => {
    console.error('Error:', error);
  });

  transcriber.on('close', (code: number, reason: string) => {
    console.log('Session closed:', code, reason);
  });

  transcriber.on('transcript', (transcript: RealtimeTranscript) => {
    if (!transcript.text) {
      return;
    }

    if (transcript.message_type === 'PartialTranscript') {
      console.log('Partial:', transcript.text);
    } else {
      console.log('Final:', transcript.text);
    }
  });

  console.log('Connecting to real-time transcript service');
  await transcriber.connect();

  console.log('Starting recording');
  const recording = new SoxRecording({
    channels: 1,
    sampleRate: SAMPLE_RATE,
    audioType: 'wav', // Linear PCM
  });

  const audioStream = recording.stream(); // Get the Readable stream from SoxRecording

  const writer = transcriber.stream().getWriter(); // Get the writer from the WritableStream

  audioStream.on('data', async (chunk) => {
    // Convert the Node.js buffer to ArrayBuffer
    const arrayBuffer = chunk.buffer.slice(
      chunk.byteOffset,
      chunk.byteOffset + chunk.byteLength
    );

    await writer.write(new Uint8Array(arrayBuffer));
  });

  audioStream.on('end', async () => {
    await writer.close();
    console.log('Finished writing to transcriber stream');
  });

  // Stop recording and close connection using Ctrl-C.
  process.on('SIGINT', async function () {
    console.log();
    console.log('Stopping recording');
    recording.stop();

    console.log('Closing real-time transcript connection');
    await transcriber.close();

    process.exit();
  });
};

run();
