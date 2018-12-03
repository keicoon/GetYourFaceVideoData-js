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

    if (time_table.length < 1) return Promise.reject('cant use to validate this data: ');

    const paths_mp3 = await utils.generate_splited_audio(time_table, path_mp3, name_audio);

    const word_set = await utils.call_stt_api(options.sst_api, paths_mp3, options.subtitle_lang);

    if (time_table.length != word_set.length) throw new Error("Not equal times and words counts");

    let json = [];
    for (let i = 0, l = time_table.length; i < l; i++) {
        json.push(_.merge({
            "id": i,
            "start": time_table[i].start,
            "end": time_table[i].end
        }, word_set[i]));
    }
    // overwrite
    await fs.writeFileSync(path_subtitle, JSON.stringify(json, null, 4), 'utf8');
}