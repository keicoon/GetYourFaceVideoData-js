const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const db = require('../db');
const generate_subtitle = require('./generate_subtitle');
const validation = require('./validation');

module.exports = async (path_video, path_sound, name_video, path_subtitle, options) => {
    try {
        const logger = options.logger;

        function get_video_info(path_video) {
            return new Promise((resolve, reject) => {
                ffmpeg(path_video).ffprobe(function (err, metadata) {
                    if (err) return reject('fail get_video_info', err);
                    resolve(metadata.format);
                });
            });
        }

        async function extract_audio(src, des, start, end) {
            if (await fs.existsSync(des)) return Promise.resolve();

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

        async function inject_audio(src_video, src_audio, des_video) {
            if (await fs.existsSync(des_video)) return Promise.resolve();

            return new Promise(resolve => {
                ffmpeg(src_video)
                    .addOption('-strict', '-2')
                    .addInput(src_audio)
                    .output(des_video)
                    .on('end', resolve)
                    .run();
            })
        }

        const { start_time, duration } = await get_video_info(path_video);

        logger.info(`video info start_time:${start_time} duration:${duration}`);
        const video_end = duration;

        const path_mp3 = `${db.PATH_POSTPROCESS_VIDEO}/${name_video}.mp3`;
        await extract_audio(path_sound, path_mp3, start_time, duration);
        logger.info('extracted mp3', path_mp3);

        if (!options.subtitle_download) {
            logger.info('generate subtitle', name_video);
            // path_subtitle, path_mp3
            await generate_subtitle(path_subtitle,
                path_mp3,
                { start_time, duration, name_video },
                options
            );
            logger.info('End generate_subtitle');
        } else if (options.subtitle_validation) {
            await validation(path_mp3, path_subtitle, name_video, video_end, options);
            logger.info('End validation');
        }

        const path_av = `${db.PATH_POSTPROCESS_VIDEO}/aft_${name_video}.mp4`;
        await inject_audio(path_video, path_mp3, path_av);
        logger.info('inject mp3', path_av);

        const subtitles = JSON.parse(await fs.readFileSync(path_subtitle, 'utf8'));

        return new Promise(async (pp_resolve) => {
            let promises = [];
            for (let i = 0, l = subtitles.length; i < l; i++) {
                const { start, end } = subtitles[i];
                if (end < video_end) {
                    const PATH_OUTPUT_VIDEO = `${db.PATH_POSTPROCESS_VIDEO}/${name_video}_${i}.mp4`;
                    if (await fs.existsSync(PATH_OUTPUT_VIDEO)) {
                        promises.push(Promise.resolve(PATH_OUTPUT_VIDEO));
                    } else {
                        promises.push(new Promise(video_resolve => {
                            ffmpeg(path_av)
                                .addOption('-strict', '-2')
                                .seekInput(start)
                                .duration((end - start))
                                .output(PATH_OUTPUT_VIDEO)
                                .on('end', function () {
                                    logger.debug(`generated video ${PATH_OUTPUT_VIDEO} start:${start} end:${end}`);
                                    video_resolve(PATH_OUTPUT_VIDEO)
                                })
                                .on('error', function (err, stdout, stderr) { throw new Error("err", err.message) })
                                .run();
                        }));
                    }
                } else {
                    break;
                }
            };
            Promise.all(promises).then(pp_resolve);
        });
    } catch (e) {
        logger.error(`error in ${name_video}: ${e}`);
        return Promise.reject();
    }
}