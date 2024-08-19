declare module 'mic' {
    import { EventEmitter } from 'events';
    interface MicOptions {
      rate?: string;
      channels?: string;
      debug?: boolean;
      exitOnSilence?: number;
      device?: string;
      fileType?: string;
    }
  
    interface MicInstance {
      getAudioStream(): EventEmitter;
      start(): void;
      stop(): void;
      pause(): void;
      resume(): void;
    }
  
    function mic(options?: MicOptions): MicInstance;
  
    export = mic;
  }
  