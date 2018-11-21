const fs = require('fs');
const _ = require('lodash');
const youtubedl = require('youtube-dl');
const vttToJson = require("./vtt2json")

module.exports = (url, _file_name, _path = __dirname, options) => {
    if (!_.includes(url, 'http')) url = `http://youtu.be/${url}`;
    if (!_.includes(_file_name, '.json')) _file_name += '.json';

    const loud = options.loud;
    loud && console.log('[dl_subs] reqest', url, _file_name, _path);

    return new Promise((resolve) => {
        youtubedl.getSubs(url, {
            auto: options.subtitle_auto,
            // Downloads all the available subtitles.
            all: false,
            // Languages of subtitles to download, separated by commas.
            lang: options.subtitle_lang,
            // The directory to save the downloaded files in.
            cwd: _path,
        }, async (err, files) => {
            if (err) throw new Error(err);
            loud && console.log('subtitle files downloaded:', files);

            const path_origin = `${_path}/${files[0]}`;
            const path_final = `${_path}/${_file_name}`;
            await fs.renameSync(path_origin, path_final);

            let txt = await fs.readFileSync(path_final, 'utf8')
            const json = await vttToJson(txt);
            await fs.writeFileSync(path_final, JSON.stringify(json, null, 4), 'utf8');

            resolve(path_final);
        });
    });
}