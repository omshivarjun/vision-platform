// Temporary light shims. Avoid overriding real @types packages.

// Jest globals (when running without Jest types)
declare function describe(name: string, fn: Function): void;
declare function test(name: string, fn: Function): void;
declare function it(name: string, fn: Function): void;
declare var expect: any;
declare var jest: any;

// Node process (minimal)
declare var process: any;
declare var global: any;
