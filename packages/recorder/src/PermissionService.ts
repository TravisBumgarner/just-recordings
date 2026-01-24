export interface PermissionStatus {
  granted: boolean
  state: 'granted' | 'denied' | 'prompt' | 'unsupported'
  canRequest: boolean
}

export class PermissionService {
  private async checkPermission(
    name: 'microphone' | 'camera',
  ): Promise<PermissionStatus> {
    // Check if Permissions API is available
    if (!navigator.permissions?.query) {
      return { granted: false, state: 'unsupported', canRequest: true }
    }

    try {
      const result = await navigator.permissions.query({
        name: name as PermissionName,
      })
      const state = result.state as 'granted' | 'denied' | 'prompt'

      return {
        granted: state === 'granted',
        state,
        canRequest: state === 'prompt',
      }
    } catch {
      // Permission query not supported for this name
      return { granted: false, state: 'unsupported', canRequest: true }
    }
  }

  async checkMicrophone(): Promise<PermissionStatus> {
    return this.checkPermission('microphone')
  }

  async checkCamera(): Promise<PermissionStatus> {
    return this.checkPermission('camera')
  }

  async checkScreenCapture(): Promise<PermissionStatus> {
    // Screen capture permission cannot be pre-checked via Permissions API
    // The user must attempt to capture to trigger the permission prompt
    return { granted: false, state: 'unsupported', canRequest: true }
  }

  async requestMicrophone(): Promise<PermissionStatus> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately - we just wanted to request permission
      stream.getTracks().forEach((track) => track.stop())
      return { granted: true, state: 'granted', canRequest: false }
    } catch {
      return { granted: false, state: 'denied', canRequest: false }
    }
  }

  async requestCamera(): Promise<PermissionStatus> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Stop the stream immediately - we just wanted to request permission
      stream.getTracks().forEach((track) => track.stop())
      return { granted: true, state: 'granted', canRequest: false }
    } catch {
      return { granted: false, state: 'denied', canRequest: false }
    }
  }
}
