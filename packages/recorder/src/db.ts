import Dexie, { Table } from 'dexie';
import { Recording } from './types';

// Stub: Database class for TDD red phase
export class RecorderDatabase extends Dexie {
  recordings!: Table<Recording, number>;

  constructor() {
    super('JustRecordingsDB');
    // Stub: Empty schema - tests will fail
  }
}
