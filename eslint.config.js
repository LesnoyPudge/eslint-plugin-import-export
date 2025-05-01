import { config } from '@lesnoypudge/eslint-config';
import customPlugin from './build/plugin.js';


const _ = config.createConfig(
    config.configs.base,
    {
        ...config.configs.node,
        files: ['./src/**/*.test.ts'],
    },
    config.configs.disableTypeChecked,
    customPlugin.configs.recommended,
);

export default _;