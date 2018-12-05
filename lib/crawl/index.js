const fs = require('fs');
const _ = require('lodash');
const YouTube = require('simple-youtube-api');
const my_api = require('./my_youtube_simple_api');
const dl_video = require('./dl_video');
const dl_sub = require('./dl_sub');
const db = require('../db');
module.exports = async (target_channel, step_crawl_video = 1, options) => {
    const logger = options.logger;
    const youtube = new YouTube(db.get_priviate('youtube_v3_api_key'));
    const channel_item = await youtube.getChannelByID(target_channel, {
        'part': 'contentDetails'
    })
    if (!channel_item) throw new Error("fail to find channel:", target_channel);

    const playlist_id = channel_item.relatedPlaylists.uploads;
    if (!playlist_id) throw new Error("fail to find playlist:", playlist_id);

    const playlist = await youtube.getPlaylistByID(playlist_id);

    const NUM_FETCH_VIDEO_STEP = 5;
    let cur_skip_idx = 0, skip_idx = 2;
    let step = 0, async_step = 0, nextPageToken = null, items = [];
    logger.info(`crawl start to channel: ${target_channel}\nstart: ${step}/${step_crawl_video}`);

    let db_items = [];
    async function download_content(items) {
        let promises = [];
        items.forEach(async (item) => {
            promises.push(new Promise(async (resolve) => {
                try {
                    const video_path = await dl_video(item.id, item.id, db.PATH_VIDEO, options);
                    if (options.subtitle_download) {
                        await dl_sub(item.id, item.id, db.PATH_SUBTITLE, options);
                    }
                    const stat = fs.statSync(video_path)
                    if (stat.size < 100) {
                        logger.error(`downloaded video size is too small : ${item.id}`);
                        resolve();
                    } else {
                        db_items.push(item);
                        async_step += 1;
                        logger.info(`process: ${async_step}/${step_crawl_video}`);
                        resolve();
                    }
                } catch (e) {
                    logger.error(`fail : ${item.id}`);
                    resolve();
                }
            }))
        })
        await Promise.all(promises);
    }

    do {
        const result = await my_api.getVideos(playlist, NUM_FETCH_VIDEO_STEP, { nextPageToken })
        nextPageToken = result.nextPageToken;
        items = result.items || [];

        if (skip_idx > cur_skip_idx++) {
            logger.debug('skip:', NUM_FETCH_VIDEO_STEP);
        } else {
            // @INFO : 중복을 피하기 위함
            items = _.filter(items, item => !db.find_db_item(item.id));

            await download_content(items);

            const need_step = (step_crawl_video - step);
            if (items.length > need_step) {
                items = items.slice(0, need_step);
            }
            step += items.length;
        }
    } while (nextPageToken != null && step < step_crawl_video);

    await db.add_db_items(db_items);

    logger.info('end crawl total_succ count: ', async_step);

    return async_step;
}