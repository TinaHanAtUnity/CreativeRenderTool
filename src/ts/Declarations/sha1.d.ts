declare class Sha1Hasher {
    digest(s: string | null | undefined): string;
}

declare module 'Utilities/sha1' {
    export default Sha1Hasher;
}
