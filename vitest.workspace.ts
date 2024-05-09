import {defineWorkspace} from 'vitest/config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineWorkspace([
    'tests/component',
    'tests/client',
    'tests/server',
    'tests/gateway',
])