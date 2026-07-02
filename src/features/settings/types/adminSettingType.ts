// ─────────────────────────────────────────────────────────────
//  Local UI types (not API models)
// ─────────────────────────────────────────────────────────────

// grants[roleId][subModuleId] = Set<permissionId>
export type GrantMap = Record<number, Record<number, Set<number>>>;

export interface PendingChange {
  roleId: number;
  subModuleId: number;
  permissionId: number;
  isGranted: boolean;
}

export type PendingMap = Record<string, PendingChange>;