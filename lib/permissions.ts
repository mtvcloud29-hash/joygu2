export const permissionModules = ["dashboard","products","orders","customers","inventory","purchases","suppliers","warehouses","reports","blog","cms","media","settings","integrations","security","users","notifications"] as const;
export const permissionActions = ["view","create","edit","delete","export","approve"] as const;
export type PermissionMatrix = Record<string, Record<string, boolean>>;
export function emptyPermissions(): PermissionMatrix { return Object.fromEntries(permissionModules.map((module) => [module, Object.fromEntries(permissionActions.map((action) => [action, false]))])); }
export function fullPermissions(): PermissionMatrix { return Object.fromEntries(permissionModules.map((module) => [module, Object.fromEntries(permissionActions.map((action) => [action, true]))])); }
