const fs = require('fs');
const db = require('../lib/db');

let find_paths = [];

const files = fs.readdirSync(db.PATH_VIDEO);

files.forEach(file_name => {
    var cur_full_path = path.resolve(cur_path, file_name)
    var stat = fs.statSync(cur_full_path)
    if (stat.isDirectory()) {
        paths.push(cur_full_path)
    } else if (stat.isFile()) {
        if (stat.size < 100) {
            // @delete
            find_paths.push(cur_full_path)
        }
    }
})

var list = db.get_db();

find_paths.forEach(file_path => {
    options.logger.info('remove invalid video data', file_path);
    var basename = path.basename(file_path, 'mp4');
    delete list[basename];
    fs.unlinkSync(file_path);
})

fs.writeFileSync(db.PATB_DB_LIST, JSON.stringify(list, null, 4), 'utf8');