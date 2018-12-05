const fs = require('fs');
const path = require('path');
const db = require('../lib/db');

let find_paths = [];

const root_path = db.PATH_VIDEO;
const files = fs.readdirSync(root_path);

files.forEach(file_name => {
    var cur_full_path = path.resolve(root_path, file_name)
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
    console.log('remove invalid video data', file_path);
    var basename = path.basename(file_path, 'mp4');
    delete list[basename];
    fs.unlinkSync(file_path);
})

fs.writeFileSync(db.PATB_DB_LIST, JSON.stringify(list, null, 4), 'utf8');