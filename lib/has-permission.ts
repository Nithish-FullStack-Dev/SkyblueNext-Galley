import { permissions } from "./permissions";

type Role =
    keyof typeof permissions;

export function hasPermission(
    role: string,
    permission: string
) {
    const rolePermissions =
        permissions[
        role as Role
        ];

    if (!rolePermissions) {
        return false;
    }

    return rolePermissions.includes(
        permission as never
    );
}