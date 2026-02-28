import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface JavaCodeSnippet {
    output?: string;
    code: string;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearUserJavaCode(): Promise<void>;
    deleteUserJavaCode(timestamp: Time): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCodeSnippet(timestamp: Time): Promise<JavaCodeSnippet | null>;
    getJavaCodeSnippetsMeta(): Promise<Array<JavaCodeSnippet>>;
    getUserJavaCode(user: Principal): Promise<Array<JavaCodeSnippet>>;
    getUserJavaCodeSnippets(): Promise<Array<JavaCodeSnippet>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchJavaCodeSnippets(searchTerm: string): Promise<Array<JavaCodeSnippet>>;
    submitJavaCode(code: string): Promise<string>;
}
