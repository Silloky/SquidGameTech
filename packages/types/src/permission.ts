export class Permissions {
    audio = {
        read: false,
        write: {
            output: false,
            volume: false
        }
    };
    video = {
        read: false,
        write: false
    };

    constructor(permissions?: string[]) {
        if (permissions) {
            permissions.forEach(permission => {
                this.setPermission(permission);
            });
        }
    }

    private setPermission(permissionPath: string) {
        const path = permissionPath.split('.');
        let current: any = this;

        for (let i = 0; i < path.length - 1; i++) {
            const segment = path[i];
            if (current && typeof current === 'object' && segment in current) {
                current = current[segment];
            } else {
                return; // Invalid path
            }
        }

        const lastSegment = path[path.length - 1];
        if (current && typeof current === 'object' && lastSegment in current) {
            current[lastSegment] = true;
        }
    }
}