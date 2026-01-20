import Dexie, { type Table } from 'dexie'
import type { Recording } from './types'

export class RecorderDatabase extends Dexie {
  recordings!: Table<Recording, number>

  constructor() {
    super('JustRecordingsDB')
    this.version(1).stores({
      recordings: '++id, name, createdAt',
    })
  }
}
