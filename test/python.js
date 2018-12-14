

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
            "path_script": "./test.py",
            "args": ["--data_path=../db/test.txt", "--split_by_sentence"],
            "spawn_option": {
                "cwd": "/Users/jogyuhyeon/Documents/GetYourFaceVideoData-js/test/"
            }
        }]
    });
}

main();
