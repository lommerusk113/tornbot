import { Command } from '../types';
import { ping } from './public/ping';
import { hello } from './public/hello';
import { shutdown } from './owner/shutdown';
import { status } from './owner/status';

export const commands: Command[] = [
    ping,
    hello,
    shutdown,
    status,
];

export { ping, hello, shutdown, status };