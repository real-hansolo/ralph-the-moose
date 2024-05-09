import {defineWorkspace} from 'vitest/config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineWorkspace([
    'tests/ui',
    'tests/client',
    'tests/server',
    'tests/gateway',
])