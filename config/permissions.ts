export const ROLES = ["owner", "admin", "billing", "member"] as const;
export type Role = (typeof ROLES)[number];

export const roleLabels: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  billing: "Billing",
  member: "Member",
};

export const PERMISSIONS = [
  "org:update",
  "members:invite",
  "members:role",
  "members:remove",
  "billing:manage",
  "api_keys:manage",
  "projects:create",
  "projects:delete",
  "audit:read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: [...PERMISSIONS],
  admin: [
    "org:update",
    "members:invite",
    "members:role",
    "members:remove",
    "api_keys:manage",
    "projects:create",
    "projects:delete",
    "audit:read",
  ],
  billing: ["billing:manage", "audit:read"],
  member: ["projects:create"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}