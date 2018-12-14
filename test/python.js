

async function main() {
    const scripts = require('../lib/post_process/python');
    await scripts({
        "logger": {
            "info": (...params) => {
                console.log('[suc]', params);
            },
            "error": (...params) => {
                console.error('[err]', params);
            },
        },
        "py_process": [{
            "path_script": "./test/test.py",
            "args": ["--data_path=../db/", "--split_by_sentence"]
        }]
    });
}

main();
