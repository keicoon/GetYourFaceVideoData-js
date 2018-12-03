var fs = require('fs')
var path = require('path');
var hangul_asm = require('hangul-asm-tmp');
var _ = require('lodash');

function get_subtitle_in_list(root_path) {
    var paths = [root_path], find_paths = [];
    while (true) {
        var cur_path = paths.shift();
        if (cur_path) {
            var files = fs.readdirSync(cur_path)
            files.forEach(file_name => {
                var cur_full_path = path.resolve(cur_path, file_name)
                var stat = fs.statSync(cur_full_path)
                if (stat.isDirectory()) {
                    paths.push(cur_full_path)
                } else if (stat.isFile()) {
                    if (file_name == 'subtitle.json') {
                        find_paths.push(cur_full_path)
                    }
                }
            })
        } else { break; }
    }
    return find_paths;
}
var root_path = process.argv[2];
if (!root_path) throw new Error('invalid args(root_path)');

var path_lists = get_subtitle_in_list(root_path);
if (path_lists.length < 1) throw new Error('cant find subtitle file in path');

async function convert(paths) {
    let idx = 0, total_num = paths.length;
    console.log('convert start');
    for (const path of paths) {
        var subtitles = JSON.parse(await fs.readFileSync(path, 'utf8'));

        subtitles = subtitles.map(ws => (_.assign(ws, {
            "part": hangul_asm.encode(ws.part),
            "origin": ws.part
        })));

        await fs.writeFileSync(path, JSON.stringify(subtitles, null, 4), 'utf8');
        console.log(`${++idx}/${total_num} : ${path}`);
    }
    console.log('convert end');
}

convert(path_lists);