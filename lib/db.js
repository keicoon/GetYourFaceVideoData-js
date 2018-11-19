const PATH_ROOT = './db'
const PATH_VIDEO = PATH_ROOT + '/video';
const PATH_SUBTITLE = PATH_ROOT + '/subtitle';
const PATB_DB_LIST = PATH_ROOT + '/list.json';

const fs = require('fs');

if (!fs.existsSync(PATH_ROOT)) { fs.mkdirSync(PATH_ROOT); }
if (!fs.existsSync(PATH_VIDEO)) { fs.mkdirSync(PATH_VIDEO); }
if (!fs.existsSync(PATH_SUBTITLE)) { fs.mkdirSync(PATH_SUBTITLE); }
if (!fs.existsSync(PATB_DB_LIST)) { fs.writeFile(PATB_DB_LIST, JSON.stringify({}, ''), 'utf8'); }

module.exports = {
    add_item, find_item,
    PATH_VIDEO, PATH_SUBTITLE
};

function add_item(id, item) {
    let db = JSON.parse(fs.readFileSync(PATB_DB_LIST, 'utf8'));

    if (!db[id]) {
        db[id] = {
            title: item.title,
            description: item.description,
            path_video: `${PATH_VIDEO}/${id}.mp4`,
            path_subtitle: `${PATH_SUBTITLE}/${id}.json`
        }
        return fs.writeFileSync(PATB_DB_LIST, JSON.stringify(db, null, 4), 'utf8');
    }
}
function find_item(id) {
    let db = require(PATB_DB_LIST);
    return db[id] ? true : false;
}