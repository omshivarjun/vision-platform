// Temporary shims to reduce TypeScript diagnostics in-editor when node_modules are not installed.
// These are developer convenience shims; install real types via npm and remove this file later.

declare var process: any;
declare var global: any;

// Jest globals
declare function describe(name: string, fn: Function): void;
declare function test(name: string, fn: Function): void;
declare function it(name: string, fn: Function): void;
declare var expect: any;
declare var jest: any;

// Common modules used in the API service — treat as any for now
declare module 'express';
declare module 'express-validator';
declare module 'axios';
declare module 'mongoose';
declare module 'redis';
declare module 'winston';
declare module 'dotenv';
declare module 'nodemailer';
declare module 'swagger-jsdoc';
declare module 'swagger-ui-express';
declare module 'socket.io';
declare module 'uuid';
declare module 'bcryptjs';
declare module 'passport';
declare module 'passport-jwt';
declare module 'passport-local';
declare module 'cors';
declare module 'compression';
declare module 'morgan';
declare module 'joi';
declare module 'form-data';
