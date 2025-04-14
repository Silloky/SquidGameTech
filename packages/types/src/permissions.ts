export class Permissions {
    // Each block must have an `all` property if it has children
    audio = {
        read: false,
        write: {
            output: false,
            volume: false,
            all: false
        },
        all: false
    };
    video = {
        read: false,
        write: false,
        all: false
    };
    all = false;

    constructor(data?: string[]) {
        if (data) {
            this.deserialize(data);
        }
    }

    // Converts all 'true' entries into an array of paths
    serialize(): string[] {
        const paths: string[] = [];
        this.serializeHelper(this, [], paths);
        return paths;
    }

    private serializeHelper(obj: any, path: string[], result: string[]): void {
        if (typeof obj !== 'object' || obj === null) return;
        // If 'all' is true for this block, just push "<path>.all"
        if (obj.hasOwnProperty('all') && obj.all === true) {
            result.push([...path, 'all'].join('.'));
            return; // We can skip individual children if the entire block is 'all'
        }
        for (const key of Object.keys(obj)) {
            const newPath = [...path, key];
            const value = obj[key];
            if (typeof value === 'boolean') {
                if (value && key !== 'all') {
                    result.push(newPath.join('.'));
                }
            } else {
                this.serializeHelper(value, newPath, result);
            }
        }
    }

    // Deserializes from an array of strings that are "granted" paths
    deserialize(paths: string[]): void {
        this.clear();
        paths.forEach(p => this.applyPermission(p, true));
        this.updateAllFlags(this);
    }

    // Clears everything to false
    clear(): void {
        this.audio = {
            read: false,
            write: {
                output: false,
                volume: false,
                all: false
            },
            all: false
        };
        this.video = {
            read: false,
            write: false,
            all: false
        };
        this.all = false;
    }

    // Applies a list of permission paths, either enabling or disabling them
    applyPermissions(paths: string[], enable: boolean): void {
        paths.forEach(p => this.applyPermission(p, enable));
        this.updateAllFlags(this);
    }

    // Applies a single permission path
    applyPermission(path: string, enable: boolean): void {
        const segments = path.split('.');
        let current: any = this;
        for (let i = 0; i < segments.length - 1; i++) {
            if (current[segments[i]] && typeof current[segments[i]] === 'object') {
                current = current[segments[i]];
            } else {
                return;
            }
        }
        const last = segments[segments.length - 1];
        // If it's "all", recursively set everything inside this block
        if (last === 'all') {
            this.recursivelySet(current, enable);
        } else if (last in current) {
            current[last] = enable;
        }
    }

    // Add a helper to recursively set all booleans in an object
    private recursivelySet(obj: any, value: boolean): void {
        for (const key in obj) {
            if (key !== 'all' && typeof obj[key] === 'object') {
                this.recursivelySet(obj[key], value);
            } else if (typeof obj[key] === 'boolean') {
                obj[key] = value;
            }
        }
        obj.all = value; // Mark the entire subtree
    }

    // Recursively sets the 'all' flags
    private updateAllFlags(obj: any): void {
        if (typeof obj !== 'object' || obj === null) return;
        let allTrue = true, hasChildren = false;
        for (const key of Object.keys(obj)) {
            if (key !== 'all' && typeof obj[key] !== 'function') {
                hasChildren = true;
                if (typeof obj[key] === 'object') {
                    this.updateAllFlags(obj[key]);
                    if (obj[key].all !== true) {
                        allTrue = false;
                    }
                } else if (obj[key] !== true) {
                    allTrue = false;
                }
            }
        }
        if (hasChildren) obj.all = allTrue;
    }
}
