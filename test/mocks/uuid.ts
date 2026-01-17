import { randomUUID } from 'crypto';

export const v4 = () => randomUUID();
export const validate = (uuid: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
export const NIL = '00000000-0000-0000-0000-000000000000';
export const version = () => 4;
export const MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
