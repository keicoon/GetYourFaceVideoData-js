const fs = require('fs');
const path = require('path');
const db = require('../lib/db');

const { PATH_VIDEO, PATH_SUBTITLE } = db;
const files = fs.readdirSync(PATH_VIDEO);

const mode = process.argv[2] || 'empty';
const min_video_size = process.argv[3] || 100;
let list = db.get_db();

console.log('working mode is', mode, 'size is', min_video_size);
if (mode == 'empty') {
    let find_files = [];
    files.forEach(file_name => {
        const cur_full_path = path.resolve(PATH_VIDEO, file_name)
        const stat = fs.statSync(cur_full_path)
        if (stat.isFile()) {
            const basename = path.basename(file_name, '.mp4');
            find_files.push(basename)
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
            const basename = path.basename(file_name, '.mp4');
            new_list[basename] = {
                path_video: `${PATH_VIDEO}/${basename}.mp4`,
                path_subtitle: `${PATH_SUBTITLE}/${basename}.json`
            }
        }
    })
    console.log('aftr db length:', Object.keys(new_list).length);
    fs.writeFileSync(db.PATB_DB_LIST, JSON.stringify(new_list, null, 4), 'utf8');
} else if (mode == 'size') {
    let find_paths = [];
    files.forEach(file_name => {
        const cur_full_path = path.resolve(PATH_VIDEO, file_name)
        const stat = fs.statSync(cur_full_path)
        if (stat.isFile()) {
            if (stat.size < min_video_size) {
                find_paths.push(cur_full_path)
            }
        }
    })
    
    if(find_paths.length < 1) return console.log('cant find satisfy target videos');
    
    console.log('prev db length:', Object.keys(list).length);
    find_paths.forEach(file_path => {
        console.log('remove invalid video data', file_path);
        const basename = path.basename(file_path, '.mp4');
        delete list[basename];
        fs.unlinkSync(file_path);
    })
    console.log('aftr db length:', Object.keys(list).length);
    fs.writeFileSync(db.PATB_DB_LIST, JSON.stringify(list, null, 4), 'utf8');
}