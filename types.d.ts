interface Files {
    files: string;
    to: string;
}
export interface Config {
    directories?: Files[];
    templateDir?: string;
    npmDependencies?: boolean;
    npmScripts?: boolean;
    packageFile: string;
}
export declare type Package = Record<string, any>;
export {};
