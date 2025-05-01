import { config } from '@lesnoypudge/eslint-config';



export default config.createConfig(
    config.configs.base,
    {
        ...config.configs.node,
        files: ['./src/**/*.test.ts'],
    },
    config.configs.disableTypeChecked,
);