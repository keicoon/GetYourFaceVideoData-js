const fs = require('fs');
const _ = require('lodash');
const utils = require('./utils');
module.exports = async (path_mp3, path_subtitle, name_audio, video_end, options) => {
    const subtitles = JSON.parse(await fs.readFileSync(path_subtitle, 'utf8'));

    const time_table = _(subtitles)
        .filter(subtitle => subtitle.end <= video_end)
        .map(subtitle => ({
            start: subtitle.start,
            end: subtitle.end
        }))
        .value();

    if (time_table.length < 1) return Promise.reject('cant use to validate this data');

    const paths_mp3 = await utils.generate_splited_audio(time_table, path_mp3, name_audio);

    const words = await utils.get_sst_api(options.sst_api)(paths_mp3);

    if (words.length != time_table.length) throw new Error();

    let json = [];
    for (let i = 0, l = time_table.length; i < l; i++) {
        if (words[i] == 'FAIL') console.warn('Fail to validation : ', subtitles[i].part);

        json.push({
            "id": i,
            "part": words[i] == 'FAIL' ? subtitles[i].part : words[i],
            "start": time_table[i].start,
            "end": time_table[i].end
        });
    }
    // overwrite
    await fs.writeFileSync(path_subtitle, JSON.stringify(json, null, 4), 'utf8');
}