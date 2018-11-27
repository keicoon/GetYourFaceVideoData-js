// const fs = require('fs');
const _ = require('lodash');
const YouTube = require('simple-youtube-api');
const my_api = require('./my_youtube_simple_api');
const dl_video = require('./dl_video');
const dl_sub = require('./dl_sub');
const db = require('../db');
module.exports = async (target_channel, step_crawl_video = 1, options) => {
    const loud = options.loud;
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
    loud && console.log(`crawl start to channel: ${target_channel}\nstart: ${step}/${step_crawl_video}`);

    let promises = [], db_items = [];
    do {
        const result = await my_api.getVideos(playlist, NUM_FETCH_VIDEO_STEP, { nextPageToken })
        {
            nextPageToken = result.nextPageToken;
            items = result.items || [];
        }
        if (skip_idx > cur_skip_idx++) {
            loud && console.log('skip:', NUM_FETCH_VIDEO_STEP);
        } else {
            // @INFO : 중복을 피하기 위함
            items = _.filter(items, item => !db.find_db_item(item.id));

            const need_step = (step_crawl_video - step);
            if (items.length > need_step) {
                items = items.slice(0, need_step);
            }
            step += items.length;

            items.forEach(async (item) => {
                promises.push(new Promise(async (resolve) => {
                    try {
                        await dl_video(item.id, item.id, db.PATH_VIDEO, options);
                        if (options.subtitle_download) {
                            await dl_sub(item.id, item.id, db.PATH_SUBTITLE, options);
                        }
                        db_items.push(item);
                        async_step +=1;
                        loud && console.log(`process: ${async_step}/${step_crawl_video}`);
                        resolve();
                    } catch (e) {
                        loud && console.log(`fail : ${item.id}`);
                        resolve();
                    }
                }))
            })
        }
    } while (nextPageToken != null && step < step_crawl_video);

    await Promise.all(promises);

    await db.add_db_items(db_items);

    loud && console.log('end crawl');

    return async_step;
}