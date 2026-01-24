export interface PermissionStatus {
  granted: boolean
  state: 'granted' | 'denied' | 'prompt' | 'unsupported'
  canRequest: boolean
}

export class PermissionService {
  async checkMicrophone(): Promise<PermissionStatus> {
    // Stub
    return { granted: false, state: 'unsupported', canRequest: false }
  }

  async checkCamera(): Promise<PermissionStatus> {
    // Stub
    return { granted: false, state: 'unsupported', canRequest: false }
  }

  async checkScreenCapture(): Promise<PermissionStatus> {
    // Stub - screen capture can't be pre-checked
    return { granted: false, state: 'unsupported', canRequest: false }
  }

  async requestMicrophone(): Promise<PermissionStatus> {
    // Stub
    return { granted: false, state: 'unsupported', canRequest: false }
  }

  async requestCamera(): Promise<PermissionStatus> {
    // Stub
    return { granted: false, state: 'unsupported', canRequest: false }
  }
}
