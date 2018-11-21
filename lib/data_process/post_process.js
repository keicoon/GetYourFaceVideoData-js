const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const db = require('../db');

module.exports = async (path_video, path_sound, name_video, path_subtitle, options) => {
    const loud = options.loud;
    // const sec_last_trim = options.sec_last_trim;

    function get_video_info(path_video) {
        return new Promise(resolve => {
            ffmpeg(path_video).ffprobe(function (err, metadata) {
                resolve(metadata.format)
            });
        });
    }

    function extract_audio(src, des, start, end) {
        if (fs.existsSync(des)) return Promise.resolve();

        return new Promise(resolve => {
            ffmpeg(src)
                .seekInput(start)
                .duration((end - start))
                .format('mp3')
                .output(des)
                .on('end', resolve)
                .run();
        })
    }

    function inject_audio(src_video, src_audio, des_video) {
        if (fs.existsSync(des_video)) return Promise.resolve();
        
        return new Promise(resolve => {
            ffmpeg(src_video)
                .addInput(src_audio)
                .output(des_video)
                .on('end', resolve)
                .run();
        })
    }

    const format = await get_video_info(path_video);
    const { start_time, duration } = format;
    loud && console.log(`video info start_time:${start_time} duration:${duration}`);
    const video_end = duration * 1000;

    const path_mp3 = `${db.PATH_POSTPROCESS_VIDEO}/${name_video}.mp3`;
    await extract_audio(path_sound, path_mp3, start_time, duration);
    loud && console.log('extracted mp3', path_mp3);

    const path_av = `${db.PATH_POSTPROCESS_VIDEO}/aft_${name_video}.mp4`;
    await inject_audio(path_video, path_mp3, path_av);
    loud && console.log('inject mp3', path_av);

    const subtitles = JSON.parse(fs.readFileSync(path_subtitle, 'utf8'));

    return new Promise(pp_resolve => {
        let promises = [];
        for (let i = 0, l = subtitles.length; i < l; i++) {
            const { start, end } = subtitles[i];
            if (end < video_end) {
                const PATH_OUTPUT_VIDEO = `${db.PATH_POSTPROCESS_VIDEO}/${name_video}_${i}.mp4`;
                if (!fs.existsSync(PATH_OUTPUT_VIDEO)) {
                    promises.push(new Promise(video_resolve => {
                        ffmpeg(path_av)
                            .seekInput(start * 0.001)
                            .duration((end - start) * 0.001)
                            .output(PATH_OUTPUT_VIDEO)
                            .on('end', function () {
                                loud && console.log(`generated video ${PATH_OUTPUT_VIDEO} start:${start} end:${end}`);
                                video_resolve(PATH_OUTPUT_VIDEO)
                            })
                            .run();
                    }));
                }
            } else {
                break;
            }
        };
        Promise.all(promises).then(pp_resolve);
    });
}