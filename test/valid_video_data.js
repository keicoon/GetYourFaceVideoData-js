const fs = require('fs');
const path = require('path');
const db = require('../lib/db');

const { PATH_VIDEO, PATH_SUBTITLE } = db;
const files = fs.readdirSync(PATH_VIDEO);

const mode = process.argv[2];
let list = db.get_db();

console.log('working mode is', mode);
if (mode == 'empty') {
    let find_files = [];
    files.forEach(file_name => {
        const cur_full_path = path.resolve(PATH_VIDEO, file_name)
        const stat = fs.statSync(cur_full_path)
        if (stat.isFile()) {
            find_files.push(file_name)
        }
    })
    let new_list = {};
    for (const key in list) {
        if (find_files.includes(key)) {
            new_list[key] = list[key];
        }
    }
    console.log('prev db length:', Object.keys(list).length);
    console.log('aftr db length:', Object.keys(new_list).length);
    fs.writeFileSync(db.PATB_DB_LIST, JSON.stringify(new_list, null, 4), 'utf8');
} else if (mode == 'generate') {
    let new_list = {};
    files.forEach(file_name => {
        const cur_full_path = path.resolve(PATH_VIDEO, file_name)
        const stat = fs.statSync(cur_full_path)
        if (stat.isFile()) {
            new_list[file_name] = {
                path_video: `${PATH_VIDEO}/${file_name}.mp4`,
                path_subtitle: `${PATH_SUBTITLE}/${file_name}.json`
            }
        }
    })
    console.log('aftr db length:', Object.keys(new_list).length);
    fs.writeFileSync(db.PATB_DB_LIST, JSON.stringify(new_list, null, 4), 'utf8');
} else if (mode == 'size100') {
    let find_paths = [];
    files.forEach(file_name => {
        const cur_full_path = path.resolve(PATH_VIDEO, file_name)
        const stat = fs.statSync(cur_full_path)
        if (stat.isFile()) {
            if (stat.size < 100) {
                find_paths.push(cur_full_path)
            }
        }
    })
    console.log('prev db length:', Object.keys(list).length);
    find_paths.forEach(file_path => {
        console.log('remove invalid video data', file_path);
        const basename = path.basename(file_path, 'mp4');
        delete list[basename];
        fs.unlinkSync(file_path);
    })
    console.log('aftr db length:', Object.keys(list).length);
    fs.writeFileSync(db.PATB_DB_LIST, JSON.stringify(list, null, 4), 'utf8');
}