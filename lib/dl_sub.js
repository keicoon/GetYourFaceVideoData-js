const fs = require('fs');

const _ = require('lodash');

const youtubedl = require('youtube-dl');
const vttToJson = require("./vtt2json")

module.exports = (url, _file_name, _path = __dirname, options = {}) => {
    if (!_.includes(url, 'http')) url = `http://youtu.be/${url}`;
    if (!_.includes(_file_name, '.json')) _file_name += '.json';
    if (options.loud) {
        console.log('[dl_subs] reqest', url, _file_name, _path);
    }

    return new Promise((resolve) => {
        youtubedl.getSubs(url, _.assign({
            auto: true,
            // Downloads all the available subtitles.
            all: false,
            // Languages of subtitles to download, separated by commas.
            lang: 'ko',
            // The directory to save the downloaded files in.
            cwd: _path,
        }, options), async (err, files) => {
            if (err) throw new Error(err);
            if (options.loud) {
                console.log('subtitle files downloaded:', files);
            }

            const path_final = `${_path}/${_file_name}`;
            await fs.renameSync(`${_path}/${files[0]}`, path_final);

            let txt = await fs.readFileSync(path_final, 'utf8')
            const json = await vttToJson(txt);
            await fs.writeFileSync(path_final, JSON.stringify(json, null, 4), 'utf8');

            resolve(path_final);
        });
    });
}
