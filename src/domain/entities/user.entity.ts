export class User {
    constructor(
        public readonly id: string,
        public email: string | null,
        public displayName: string,
        public avatarUrl?: string,
        // Future authentication fields
        // public passwordHash?: string,
        // public emailVerified: boolean = false,
        // public roles: string[] = ['user'],
    ) { }

    /**
     * Update display name
     */
    updateDisplayName(newName: string): void {
        this.displayName = newName;
    }

    /**
     * Update avatar
     */
    updateAvatar(url: string): void {
        this.avatarUrl = url;
    }

    /**
     * Check if user is guest (no email)
     */
    isGuest(): boolean {
        return this.email === null;
    }
}
