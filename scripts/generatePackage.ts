import path from 'node:path';
import fs from 'node:fs';
import * as v from 'valibot';


const main = () => {
    const pathToFile = path.resolve(process.cwd(), 'src/package.ts');

    const pkg = v.parse(v.object({
        name: v.string(),
        version: v.string(),
    }), JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'),
    ));

    fs.mkdirSync(path.dirname(pathToFile), { recursive: true });

    fs.writeFileSync(
        pathToFile,
        [
            `export const name = '${pkg.name}';`,
            `export const version = '${pkg.version}';`,
        ].join('\n'),
        'utf8',
    );
};

main();