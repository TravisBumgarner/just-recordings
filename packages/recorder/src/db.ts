import Dexie, { Table } from 'dexie'
import { Recording } from './types'

export class RecorderDatabase extends Dexie {
  recordings!: Table<Recording, number>

  constructor() {
    super('JustRecordingsDB')
    this.version(1).stores({
      recordings: '++id, name, createdAt',
    })
  }
}
