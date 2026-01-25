export const queryKeys = {
  // Recordings
  recordings: ['recordings'] as const,
  recording: (id: string) => ['recordings', id] as const,

  // Media
  video: (id: string) => ['video', id] as const,
  thumbnail: (id: string) => ['thumbnail', id] as const,

  // Shares
  shares: (recordingId: string) => ['shares', recordingId] as const,
  publicRecording: (token: string) => ['publicRecording', token] as const,

  // Health
  health: ['health'] as const,

  // Users
  authUser: ['authUser'] as const,
  currentUser: ['currentUser'] as const,
}
