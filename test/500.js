const GYFVD = require('../');

async function main () {

    const gyfvd = new GYFVD({
        "loud": false,
        "subtitle_download": true,
        "subtitle_validation": true
    });

    const Channel_YTN_News = 'UChlgI3UHCOnwUGzWzbJ3H5w';

    await gyfvd.start(Channel_YTN_News, 500);

    await gyfvd.clear();
}

main();