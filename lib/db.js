const PATH_ROOT = './db'
const PATH_VIDEO = PATH_ROOT + '/video';
const PATH_SUBTITLE = PATH_ROOT + '/subtitle';
const PATH_RESULT = PATH_ROOT + '/result';
const PATB_DB_LIST = PATH_ROOT + '/list.json';
const PATH_PRIVATE = './secret/private.json';
const PATH_PREPROCESS_VIDEO = PATH_ROOT + '/pre_process_video';
const PATH_POSTPROCESS_VIDEO = PATH_ROOT + '/post_process_video';

const fs = require('fs');
const _ = require('lodash');

if (!fs.existsSync(PATH_ROOT)) { fs.mkdirSync(PATH_ROOT); }
if (!fs.existsSync(PATH_VIDEO)) { fs.mkdirSync(PATH_VIDEO); }
if (!fs.existsSync(PATH_SUBTITLE)) { fs.mkdirSync(PATH_SUBTITLE); }
if (!fs.existsSync(PATH_RESULT)) { fs.mkdirSync(PATH_RESULT); }
if (!fs.existsSync(PATH_PREPROCESS_VIDEO)) { fs.mkdirSync(PATH_PREPROCESS_VIDEO); }
if (!fs.existsSync(PATH_POSTPROCESS_VIDEO)) { fs.mkdirSync(PATH_POSTPROCESS_VIDEO); }
if (!fs.existsSync(PATB_DB_LIST)) { fs.writeFileSync(PATB_DB_LIST, '{}', 'utf8'); }

module.exports = {
    add_db_items, find_db_item,
    get_priviate,
    get_sample,
    get_db,
    get_len_db,
    clear_cache_db,
    PATH_VIDEO, PATH_SUBTITLE, PATH_RESULT, PATB_DB_LIST,
    PATH_PREPROCESS_VIDEO, PATH_POSTPROCESS_VIDEO
};

function get_db() {
    return db = JSON.parse(fs.readFileSync(PATB_DB_LIST, 'utf8'));
}

function get_len_db() {
    return _.values(get_db()).length;
}

function get_sample(num) {
    return _.sampleSize(_.values(get_db()), num);
}

 function add_db_items(items) {
    items.forEach(item => {
        db[item.id] = {
            title: item.title,
            description: item.description,
            path_video: `${PATH_VIDEO}/${item.id}.mp4`,
            path_subtitle: `${PATH_SUBTITLE}/${item.id}.json`
        }
    });
     fs.writeFileSync(PATB_DB_LIST, JSON.stringify(db, null, 4), 'utf8');
}

function find_db_item(id) {
    return db[id];
}

 function clear_cache_db() {
     function rmdirall(path) {
        if ( fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
             fs.rmdirSync(path);
        }
    };
     rmdirall(PATH_PREPROCESS_VIDEO);
     rmdirall(PATH_POSTPROCESS_VIDEO);
}

let private = null;
 function get_priviate(key) {
    if (!private) {
        private = JSON.parse( fs.readFileSync(PATH_PRIVATE, 'utf8'));
    }
    return private[key];
}