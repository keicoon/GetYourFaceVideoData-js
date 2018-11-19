const private = require('../secret/private.json');

const YouTube = require('simple-youtube-api');
const youtube = new YouTube(private.api_key || '');

const my_api = require('./my_youtube_simple_api');
const dl_video = require('./dl_video');
const dl_sub = require('./dl_sub');
const db = require('./db');

module.exports = async (target_channel, step_crawl_video = 1, loud = true) => {
    const channel_item = await youtube.getChannelByID(target_channel, {
        'part': 'contentDetails'
    })
    if (!channel_item) throw new Warn("fail to find channel:", target_channel);

    const playlist_id = channel_item.relatedPlaylists.uploads;
    if (!playlist_id) throw new Warn("fail to find playlist:", playlist_id);

    const playlist = await youtube.getPlaylistByID(playlist_id);

    const NUM_FETCH_VIDEO_STEP = 5;
    let cur_skip_idx = 0, skip_idx = 2;
    let step = 0, nextPageToken = null, items = [];
    console.log(`crawl start to channel: ${target_channel}\nstart: ${step}/${step_crawl_video}`);
    do {
        const result = await my_api.getVideos(playlist, NUM_FETCH_VIDEO_STEP, { nextPageToken })
        {
            nextPageToken = result.nextPageToken;
            items = result.items || [];
        }
        if (skip_idx > cur_skip_idx++) {
            console.log('skip:', NUM_FETCH_VIDEO_STEP);
        } else {
            const need_step = (step_crawl_video - step);
            if (items.length > need_step) {
                items = items.slice(0, need_step);
            }
            step += items.length;

            await items.forEach(async (item) => {
                try {
                    await dl_video(item.id, item.id, db.PATH_VIDEO, { loud });
                    await dl_sub(item.id, item.id, db.PATH_SUBTITLE, { loud });
                    await db.add_item(item.id, item);
                    console.log(`process: ${step}/${step_crawl_video}`);
                } catch (e) {
                    console.error(e);
                }
            })
        }
    } while (nextPageToken != null && step < step_crawl_video);
}