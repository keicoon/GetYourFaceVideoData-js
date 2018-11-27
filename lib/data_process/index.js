const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const pre_process = require('./pre_process');
const post_process = require('./post_process');
const db = require('../db');
module.exports = async (path_video, path_subtitle, options) => {
    let name_video = path.basename(path_video, '.mp4');

    const path_result = `${db.PATH_RESULT}/${name_video}`;
    if (await fs.existsSync(path_result)) return;

    const loud = options.loud;
    loud && console.log(`data-process info path_video:${path_video} path_subtitle:${path_subtitle}`);

    let path_preprocess_video = await pre_process(path_video, name_video, options);
    loud && console.log('pre_process video path:', path_preprocess_video);

    const path_postprocess_videos = await post_process(path_preprocess_video, path_video, name_video, path_subtitle, options);
    loud && console.log('post_process video paths:', path_postprocess_videos);

    await fs.mkdirSync(path_result);

    let idx = 0;
    for (const path_postprocess_video of path_postprocess_videos) {
        const path_new = `${path_result}/${idx++}.mp4`;
        await fs.renameSync(path_postprocess_video, path_new);
    }

    const path_new_subtitle = `${path_result}/subtitle.json`;
    {   // @regacy : if use validation, we don't need this.
        // const txt = await fs.readFileSync(path_subtitle, 'utf8');
        // const subtitle = JSON.parse(txt);
        // const new_subtitle = _.filter(subtitle, subtitle => subtitle.id <= idx);
        // await fs.writeFileSync(path_new_subtitle, JSON.stringify(new_subtitle, null, 4), 'utf8');
    }
    await fs.copyFileSync(path_subtitle, path_new_subtitle);
    loud && console.log('End data_process');
}