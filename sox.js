const { spawn } = require('child_process');
const { Readable } = require('stream');

class SoxRecording {
  constructor(options) {
    this.channels = options.channels || 1;
    this.sampleRate = options.sampleRate || 16000;
    this.audioType = options.audioType || 'wav';
    this.process = null;
  }

  stream() {
    // Use the full path to the Sox executable
    const soxPath = 'C:\\Program Files (x86)\\sox-14-4-2\\sox.exe'; // Replace with the actual path to sox on your system
    
    const soxCommand = [
      '-t', 'waveaudio', 
      'default', 
      '-r', `${this.sampleRate}`, 
      '-c', `${this.channels}`, 
      '-b', '16', 
      '-e', 'signed-integer', 
      '-t', `${this.audioType}`, 
      '-'
    ];

    try {
      // Spawn the Sox process with the defined arguments
      this.process = spawn(soxPath, soxCommand);

      // Capture any errors from Sox
      this.process.stderr.on('data', (data) => {
        console.error('sox stderr:', data.toString());
      });

      // Handle Sox process exit event
      this.process.on('close', (code) => {
        if (code !== 0) {
          console.error(`Sox process exited with code ${code}`);
        } else {
          console.log('Sox process exited successfully.');
        }
      });

      // Return the output stream for further processing
      return this.process.stdout;
    } catch (error) {
      console.error('Failed to start sox process:', error);
      throw new Error('Failed to start sox process');
    }
  }

  stop() {
    // Stop the Sox process safely
    if (this.process) {
      this.process.kill('SIGINT'); // Sends an interrupt signal to stop the process
      this.process = null; // Clear the process reference
    }
  }
}

module.exports = { SoxRecording };
