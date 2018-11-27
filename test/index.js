const GYFVD = require('../');

async function main () {

    const gyfvd = new GYFVD({
        "loud": false,
        "subtitle_download": true,
        "subtitle_validation": true
    });

    const Channel_YTN_News = 'UChlgI3UHCOnwUGzWzbJ3H5w';

    await gyfvd.crawl(Channel_YTN_News, 1);

    await gyfvd.data_process(1);

    await gyfvd.clear();
}

main();