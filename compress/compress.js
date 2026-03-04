const round = n => Math.round(n * 100) / 100;
const compressjs = require('compressjs');

function compress(orig) {
    const namesToIDs = {};
    const IDsToNames = {};

    const mapName = name => {
        if (namesToIDs[name] === undefined) {
            namesToIDs[name] = Object.keys(namesToIDs).length;
            IDsToNames[namesToIDs[name]] = name;
        }
        return namesToIDs[name];
    }

    const filter_cat = s => s[3] > 0.5;
    const map_cat = s => [mapName(s[0]), [round(s[1][0]), round(s[1][1])], s[2], s[3]];
    const new_frames = [];
    let i = 0;
    for(let frame of orig) {
        let new_frame = {
            t: i++,
            pl1: frame.pl1,
            pl2: frame.pl2,
            p1: frame.p1.filter(filter_cat).map(map_cat),
            p2: frame.p2.filter(filter_cat).map(map_cat),
            st: frame.st,
            e: frame.e.map(e => [mapName(e[0]), mapName(e[1]), e[2]]),
            s: frame.s.map(s => {
                switch(s[0]) {   
                    case 'sh':
                        return ['sh', mapName(s[1]), s[2]];
                    case 'm':
                        return ['m', mapName(s[1]), mapName(s[2])];
                    case 'd':
                    case 'j':
                        return [s[0], mapName(s[1])];
                    case 'ex':
                        return ['ex', mapName(s[1])];
                }
                throw new Error('Unknown special type: ' + s[0]);
            }),
            a: (frame.a || []).map(a => [mapName(a[0]), mapName(a[1]), mapName(a[2]), a[3]]),
            cr: frame.cr,
            end: frame.end,
        };
        new_frames.push(new_frame);
    }
    const out = JSON.stringify({
        frames: new_frames,
        IDsToNames: IDsToNames,
    });
    return Buffer.from(compressjs.Bzip2.compressFile(Buffer.from(out)));
}

function decompress(comp) {
    const dec = JSON.parse(new TextDecoder().decode(compressjs.Bzip2.decompressFile(comp)));
    const IDsToNames = dec.IDsToNames;
    const map_cat = s => [IDsToNames[s[0]], s[1], s[2], s[3]];
    const frames = [];
    for(let frame of dec.frames) {
        let new_frame = {
            pl1: frame.pl1,
            pl2: frame.pl2,
            p1: frame.p1.map(map_cat),
            p2: frame.p2.map(map_cat),
            st: frame.st,
            e: frame.e.map(e => [IDsToNames[e[0]], IDsToNames[e[1]], e[2]]),
            s: frame.s.map(s => {
                switch(s[0]) {   
                    case 'sh':
                        return ['sh', IDsToNames[s[1]], s[2]];
                    case 'm':
                        return ['m', IDsToNames[s[1]], IDsToNames[s[2]]];
                    case 'd':
                    case 'j':
                        return [s[0], IDsToNames[s[1]]];
                    case 'ex':
                        return ['ex', IDsToNames[s[1]]];
                }
                throw new Error('Unknown special type: ' + s[0]);
            }),
            a: (frame.a || []).map(a => [IDsToNames[a[0]], IDsToNames[a[1]], IDsToNames[a[2]], a[3]]),
            cr: frame.cr,
            end: frame.end,
        };
        frames.push(new_frame);
    }
    return frames;
}

module.exports = { compress, decompress };