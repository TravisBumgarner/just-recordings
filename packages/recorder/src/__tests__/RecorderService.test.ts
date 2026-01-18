import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RecorderService } from '../RecorderService';

// Mock MediaRecorder
class MockMediaRecorder {
  state: string = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onstart: (() => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;

  private stream: MediaStream;

  constructor(stream: MediaStream, _options?: MediaRecorderOptions) {
    this.stream = stream;
  }

  start(timeslice?: number) {
    this.state = 'recording';
    this.onstart?.();
    // Simulate data available after a tick
    if (timeslice) {
      setTimeout(() => {
        this.ondataavailable?.({ data: new Blob(['chunk'], { type: 'video/webm' }) });
      }, 10);
    }
  }

  stop() {
    this.state = 'inactive';
    // Simulate final data chunk
    this.ondataavailable?.({ data: new Blob(['final'], { type: 'video/webm' }) });
    this.onstop?.();
  }

  pause() {
    this.state = 'paused';
    this.onpause?.();
  }

  resume() {
    this.state = 'recording';
    this.onresume?.();
  }

  static isTypeSupported(mimeType: string): boolean {
    return mimeType === 'video/webm';
  }
}

// Mock MediaStream
class MockMediaStream {
  getTracks() {
    return [{ stop: vi.fn() }];
  }
}

describe('RecorderService', () => {
  let service: RecorderService;
  let mockGetDisplayMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new RecorderService();

    // Mock getDisplayMedia
    mockGetDisplayMedia = vi.fn().mockResolvedValue(new MockMediaStream());

    // @ts-ignore - mocking navigator
    global.navigator = {
      mediaDevices: {
        getDisplayMedia: mockGetDisplayMedia,
      },
    };

    // @ts-ignore - mocking MediaRecorder
    global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getState', () => {
    it('returns idle initially', () => {
      expect(service.getState()).toBe('idle');
    });
  });

  describe('onStateChange', () => {
    it('returns an unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = service.onStateChange(callback);
      expect(typeof unsubscribe).toBe('function');
    });

    it('calls callback when state changes', async () => {
      const callback = vi.fn();
      service.onStateChange(callback);

      await service.startScreenRecording();

      expect(callback).toHaveBeenCalledWith('recording');
    });

    it('does not call callback after unsubscribe', async () => {
      const callback = vi.fn();
      const unsubscribe = service.onStateChange(callback);
      unsubscribe();

      await service.startScreenRecording();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('startScreenRecording', () => {
    it('calls getDisplayMedia', async () => {
      await service.startScreenRecording();
      expect(mockGetDisplayMedia).toHaveBeenCalled();
    });

    it('changes state to recording', async () => {
      await service.startScreenRecording();
      expect(service.getState()).toBe('recording');
    });

    it('passes video constraints to getDisplayMedia', async () => {
      await service.startScreenRecording();
      expect(mockGetDisplayMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: true,
        })
      );
    });
  });

  describe('stopRecording', () => {
    it('returns a Recording object', async () => {
      await service.startScreenRecording();
      const recording = await service.stopRecording();

      expect(recording).toHaveProperty('name');
      expect(recording).toHaveProperty('blob');
      expect(recording).toHaveProperty('mimeType');
      expect(recording).toHaveProperty('duration');
      expect(recording).toHaveProperty('createdAt');
      expect(recording).toHaveProperty('fileSize');
    });

    it('changes state to idle', async () => {
      await service.startScreenRecording();
      await service.stopRecording();
      expect(service.getState()).toBe('idle');
    });

    it('returns a blob with content', async () => {
      await service.startScreenRecording();
      const recording = await service.stopRecording();
      expect(recording.blob.size).toBeGreaterThan(0);
    });

    it('returns the correct mimeType', async () => {
      await service.startScreenRecording();
      const recording = await service.stopRecording();
      expect(recording.mimeType).toBe('video/webm');
    });
  });

  describe('pauseRecording', () => {
    it('changes state to paused', async () => {
      await service.startScreenRecording();
      service.pauseRecording();
      expect(service.getState()).toBe('paused');
    });
  });

  describe('resumeRecording', () => {
    it('changes state back to recording', async () => {
      await service.startScreenRecording();
      service.pauseRecording();
      service.resumeRecording();
      expect(service.getState()).toBe('recording');
    });
  });
});
