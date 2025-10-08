/**
 * Danh sách User IDs của các Supervisor có quyền duyệt đơn
 * Những user này có quyền như admin trong việc duyệt request forms
 */
export const SUPERVISOR_IDS = [
  '19010400',
  '20020700',
  '18010900',
  '19010300',
  '20102800'
] as const;

export type SupervisorId = (typeof SUPERVISOR_IDS)[number];
