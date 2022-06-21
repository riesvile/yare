/*
render_data3 = {
            't': 0,
            'p1': [],
            'p2': [],
            'b1': [],
            'b2': [],
            'st': [],
            'ou': [],
            'e': [],
            's': [],
            'end': end_winner
        };

        render_data3.p1.push([spt.id, spt.position, spt.size, spt.energy, spt.hp]);
        render_data3.e.push([outpost.id, enemy.id, 2 * beam_strength]);
        render_data3.ou = [outposts[0].energy, outposts[0].control];

        render_data3.s.push(['sh', spirit, commands[spirit].shout]);
        render_data3.s.push(['m', s.id, t.id]);
        render_data3.s.push(['d', orig.id]);
        render_data3.s.push(['j', spirit]);
        render_data3.s.push(['ex', spirit]);
*/

var round = (n) => Math.round(n * 100) / 100;

var compressjs = require("compressjs");

function compress(orig) {
  var namesToIDs = {};
  var IDsToNames = {};

  var mapName = (name) => {
    if (namesToIDs[name] === undefined) {
      namesToIDs[name] = Object.keys(namesToIDs).length;
      IDsToNames[namesToIDs[name]] = name;
    }
    return namesToIDs[name];
  };

  var filter_spirit = (s) => s[4] > 0.5;
  var map_spirit = (s) => [
    mapName(s[0]),
    [round(s[1][0]), round(s[1][1])],
    s[2],
    s[3],
  ];
  var new_frames = [];
  var i = 0;
  for (let frame of orig) {
    let new_frame = {
      t: i++,
      p1: frame.p1.filter(filter_spirit).map(map_spirit),
      p2: frame.p2.filter(filter_spirit).map(map_spirit),
      b1: frame.b1,
      b2: frame.b2,
      st: frame.st,
      ou: [frame.ou[0], mapName(frame.ou[1])],
      py: [frame.py[0], mapName(frame.py[1])],
      ef: frame.ef,
      e: frame.e.map((e) => [mapName(e[0]), mapName(e[1]), e[2]]),
      s: frame.s.map((s) => {
        switch (s[0]) {
          case "sh":
            return ["sh", mapName(s[1]), s[2]];
          case "m":
            return ["m", mapName(s[1]), mapName(s[2])];
          case "d":
          case "j":
          case "ex":
            return ["d", mapName(s[1])];
        }
        throw new Error("Unknown special type: " + s[0]);
      }),
    };
    new_frames.push(new_frame);
  }
  var out = JSON.stringify({
    frames: new_frames,
    IDsToNames: IDsToNames,
  });
  return Buffer.from(compressjs.Bzip2.compressFile(Buffer.from(out)));
}

function decompress(comp) {
  var dec = JSON.parse(
    new TextDecoder().decode(compressjs.Bzip2.decompressFile(comp))
  );

  let IDsToNames = dec.IDsToNames;

  var map_spirit = (s) => [IDsToNames[s[0]], s[1], s[2], s[3], 1];
  var frames = [];
  for (let frame of dec.frames) {
    let new_frame = {
      p1: frame.p1.map(map_spirit),
      p2: frame.p2.map(map_spirit),
      b1: frame.b1,
      b2: frame.b2,
      st: frame.st,
      ou: frame.ou,
      py: [frame.py[0], IDsToNames[frame.py[1]]],
      ef: frame.ef,
      e: frame.e.map((e) => [IDsToNames[e[0]], IDsToNames[e[1]], e[2]]),
      s: frame.s.map((s) => {
        switch (s[0]) {
          case "sh":
            return ["sh", IDsToNames[s[1]], s[2]];
          case "m":
            return ["m", IDsToNames[s[1]], IDsToNames[s[2]]];
          case "d":
          case "j":
          case "ex":
            return ["d", IDsToNames[s[1]]];
        }
        throw new Error("Unknown special type: " + s[0]);
      }),
    };
    frames.push(new_frame);
  }
  return frames;
}

module.exports = {
  compress: compress,
  decompress: decompress,
};
