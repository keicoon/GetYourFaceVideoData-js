const GYFVD = require('../');

async function main () {

    const gyfvd = new GYFVD({
        "loud": true,
        // "subtitle_download": false
        "subtitle_validation": true
    });

    const Channel_YTN_News = 'UChlgI3UHCOnwUGzWzbJ3H5w';

    // await gyfvd.crawl(Channel_YTN_News, 1);

    await gyfvd.data_process(1);

    // // gyfvd.clear();
}

main();