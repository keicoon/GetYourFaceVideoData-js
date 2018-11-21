const Video = require('simple-youtube-api').Video;

module.exports = {
    "getVideos": (playlist, count, options) => {
        return (function _getVideos(count, options) {
            const pageToken = options.nextPageToken || null;
            const endpoint = "playlistItems";
            const limit = count > 50 ? 50 : count;
            return this.youtube.request.make(endpoint, Object.assign(options, {
                pageToken,
                maxResults: limit,
                playlistId: this.id,
                part: "snippet"
            })).then(result => ({
                items: result.items.map(i => new Video(this.youtube, i)),
                nextPageToken: result.nextPageToken
            }));
        }).call(playlist, count, options);
    }
}