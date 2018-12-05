## GetYourFaceVideoData
- This script makes video data automatically that be got from youtube to face and audio for use in deep learning.

### Description
- It is dataSet that base to train LipReading.
- Dataset is consisted of `Video` and `Subtitle`.
- The directory structure is shown below.
    - ./db
        - /result
            - /{youtube_video_id}
                - {idx}.mp4
                - subtitle.json
- capture about file tree  
![](https://github.com/keicoon/GetYourFaceVideoData/blob/master/capture/result.png)

### How to get dataset?
- Get Video from `Youtube`.
- Get Subtitle from `Google STT`. And Validate that by `ETRI STT`.
- And this process has two steps.
    - crawling job
        - Get video list using youtube's channelID.
        - Get video and subtitle(vtt) by `youtube-dl`.
        - Transform `vtt` to `my json format` that splited words.
    - data-processing job
        - Find just one people to face-detection, step by step.
        - Crop image faceRect.
        - Validate subtitle word by `ETRI STT`.
        - Split video along word time in subtitle json.

### How to use lib?
```
const GYFVD = require('GetYourFaceVideoData');

const options = {};
const gyfvd = new GYFVD(options);

const YoutubeChannelID = 'UChlgI3UHCOnwUGzWzbJ3H5w';
const num_crawl_video = 3;
gyfvd.crawl(YoutubeChannelID, num_crawl_video);

const num_sample = 1;
gyfvd.data_process(num_sample);

// gyfvd.clear();
```

### Run by node
```
$ node test -c=youtube_channel_id -n=500
```

### Important
- Need to fill `{}_api_keys` in `./secret/private.json`.
```
// in ./secret/private.json
{
    "api_key": "{your_api_key}",
    "etri_sst_api_keys": [ "{your_api_keys}" ]
}
```
- Dependency
    - opencv
    - ffmpeg
```
sudo .prerequirement/ubuntu.sh
```