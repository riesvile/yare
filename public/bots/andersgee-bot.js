var CODE_VERSION = '6a5c8d06';/* The contents of this file will be copied unmodified to the top of your build. */

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ability/jump.ts":
/*!*****************************!*\
  !*** ./src/ability/jump.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "jumpCost": () => (/* binding */ jumpCost),
/* harmony export */   "maxJumpDistance": () => (/* binding */ maxJumpDistance),
/* harmony export */   "canJump": () => (/* binding */ canJump),
/* harmony export */   "jumpPoint": () => (/* binding */ jumpPoint)
/* harmony export */ });
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vec */ "./src/vec.ts");

/**
 * all shapes can use jump() . Formula: jump cost = distance/4 + (size^2) / 4
 */

function jumpCost(ship, point) {
  return (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(ship.position, point) / 4 + Math.pow(ship.size, 2) / 4;
}
/**
 * ```raw
 * The maximum distance a ship can jump.
 *
 * energyMargin is how much the ship needs to still have after completed jump. default 0.
 *
 * d/4 + (size^2)/4 = cost
 * d/4 = cost - (size^2)/4
 * d = 4*( cost - (size^2)/4 )
 * d = 4*cost - (size^2)
 *
 * maxDist = 4*shipEnergy - shipSize^2
 *
 * affordableDistance = 4*(shipEnergy-energyMargin) - shipSize^2
 * ```
 */

function maxJumpDistance(ship, energyMargin = 0) {
  return 4 * (ship.energy - energyMargin) - Math.pow(ship.size, 2);
}
/**
 * True if has enough energy to jump to point
 *
 * energyMargin is how much the ship needs to still have after completed jump. default 0.
 */

function canJump(ship, point, energyMargin = 0) {
  return ship.energy - energyMargin >= jumpCost(ship, point);
}
/**
 * return the point ship would land at if it jumped toward target point.
 *
 * energyMargin is how much the ship needs to have (at least) after jumping
 *
 * 1. if CAN reach point: return point
 * 2. if CAN NOT reach point: return the maximum jumpable point in the point direction
 */

function jumpPoint(ship, point, energyMargin = 0) {
  if (canJump(ship, point, energyMargin)) {
    return point;
  } else {
    const d = maxJumpDistance(ship, energyMargin);
    const reachablePoint = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offset)(ship.position, point, d);
    return reachablePoint;
  }
}

/***/ }),

/***/ "./src/collections.ts":
/*!****************************!*\
  !*** ./src/collections.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "collections": () => (/* binding */ collections)
/* harmony export */ });
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec */ "./src/vec.ts");

const collections = getCollections();


function getCollections() {
  const playerids = getPlayerIds();
  const shapes = getShapes();
  const bases = getBases();
  const outposts = getOutposts();
  const stars = getStars();
  const {
    myships,
    enemyships
  } = getShips();
  const pylons = getPylons();
  const info = getInfo(playerids, outposts, pylons);
  return {
    playerids,
    shapes,
    bases,
    outposts,
    stars,
    myships,
    enemyships,
    info,
    pylons
  };
}

function getShapes() {
  const bases = getBases(); //const me = base.shape;
  //const enemy = enemy_base.shape;

  return {
    me: bases.me.shape,
    enemy: bases.enemy.shape
  };
}

function getBases() {
  const playerids = getPlayerIds(); //base_zxq.player_id
  //base_a2c.player_id

  const myBase = base_zxq.player_id === playerids.me ? base_zxq : base_a2c;
  const notMyBase = base_zxq.player_id === playerids.me ? base_a2c : base_zxq; //console.log("base_zxq.player_id", base_zxq.player_id);

  return {
    me: myBase,
    enemy: notMyBase,
    middle: base_p89,
    big: base_nua
  };
}

function getOutposts() {
  return {
    middle: outpost_mdo
  };
}

function getPylons() {
  return {
    middle: pylon_u3p
  };
}

function getPlayerIds() {
  const me = this_player_id;
  const enemy = players.p1 === me ? players.p2 : players.p1;
  return {
    me,
    enemy
  };
}

function getShips() {
  //work with arrays instead of objects
  const playerids = getPlayerIds();
  const ships = Array.from(Object.values(spirits));
  const myships = ships.filter(ship => ship.id.startsWith(playerids.me) && ship.hp > 0);
  const enemyships = ships.filter(ship => ship.id.startsWith(playerids.enemy) && ship.hp > 0); //myships

  for (const [index, ship] of myships.entries()) {
    ship.index = index;
    ship.nearbyfriends_includingself = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 200));
    ship.nearbyfriends = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 200) && index !== s.index);
    ship.nearbyfriends300 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 300) && index !== s.index);
    ship.nearbyfriends20 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 20));
    ship.nearbyfriends40 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 40));
    ship.nearbyfriends60 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 60));
    ship.nearbyenemies = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 200));
    ship.nearbyenemies220 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 220));
    ship.nearbyenemies240 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 240));
    ship.nearbyenemies260 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 260));
    ship.nearbyenemies300 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 300));
    ship.nearbyenemies320 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 320));
    ship.nearbyenemies400 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 400));
    const allfriends = myships.filter(s => s.index !== index); //all myships except self

    ship.nearestfriend = allfriends[(0,_vec__WEBPACK_IMPORTED_MODULE_0__.minimum)(allfriends.map(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(s.position, ship.position))).index];
    ship.nearestenemy = enemyships[(0,_vec__WEBPACK_IMPORTED_MODULE_0__.minimum)(enemyships.map(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(s.position, ship.position))).index];
  } //enemyships


  for (const [index, ship] of enemyships.entries()) {
    ship.index = index;
    ship.nearbyfriends_includingself = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 200));
    ship.nearbyfriends = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 200) && index !== s.index);
    ship.nearbyfriends300 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 300) && index !== s.index);
    ship.nearbyfriends20 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 20));
    ship.nearbyfriends40 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 40));
    ship.nearbyfriends60 = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 60));
    ship.nearbyenemies = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 200));
    ship.nearbyenemies220 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 220));
    ship.nearbyenemies240 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 240));
    ship.nearbyenemies260 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 260));
    ship.nearbyenemies300 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 300));
    ship.nearbyenemies400 = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, s.position, 400));
    const allfriends = enemyships.filter(s => s.index !== index); //all myships except self

    ship.nearestfriend = allfriends[(0,_vec__WEBPACK_IMPORTED_MODULE_0__.minimum)(allfriends.map(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(s.position, ship.position))).index];
    ship.nearestenemy = myships[(0,_vec__WEBPACK_IMPORTED_MODULE_0__.minimum)(myships.map(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(s.position, ship.position))).index];
  }

  return {
    myships,
    enemyships
  };
}

function getStars() {
  const bases = getBases();
  const dist_base2zxq = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(bases.me.position, star_zxq.position);
  const dist_base2a2c = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(bases.me.position, star_a2c.position); //const dist_base2p89 = vec.dist(base.position, star_p89.position)

  const stars = {
    me: star_zxq,
    middle: star_p89,
    enemy: star_a2c,
    big: star_nua
  };

  if (dist_base2a2c < dist_base2zxq) {
    stars.me = star_a2c;
    stars.enemy = star_zxq;
  }

  return stars;
}

function getInfo(playerids, outposts, pylons) {
  const outpostcontrolIsMe = playerids.me === outposts.middle.control;
  const outpostcontrolIsEnemy = playerids.enemy === outposts.middle.control;
  const pyloncontrolIsMe = playerids.me === pylons.middle.control;
  const pyloncontrolIsEnemy = playerids.enemy === pylons.middle.control;
  return {
    outpostcontrolIsMe,
    outpostcontrolIsEnemy,
    pyloncontrolIsMe,
    pyloncontrolIsEnemy
  };
}

/***/ }),

/***/ "./src/combateval.ts":
/*!***************************!*\
  !*** ./src/combateval.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ combateval)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./find */ "./src/find.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vec */ "./src/vec.ts");




/**
 * ```raw
 * Evaluate (to the end) what happens if ships attack each other.
 *
 * return some metrics. Most importantly "myAdvantage"
 * ```
 */
function combateval(myships, enemyships) {
  let [myships_m, enemyships_m] = evalBattle1tick(myships, enemyships);
  let someoneCanAttack = (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(myships_m.map(s => s.energy)) + (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(enemyships_m.map(s => s.energy)) > 0;

  while (someoneCanAttack && myships_m.length > 0 && enemyships_m.length > 0) {
    [myships_m, enemyships_m] = evalBattle1tick(myships_m, enemyships_m);
    someoneCanAttack = (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(myships_m.map(s => s.energy)) + (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(enemyships_m.map(s => s.energy)) > 0;
  }

  const meIsLastStanding = myships_m.length > enemyships_m.length;
  const myEnergycost = (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(myships.map(s => s.energy)) - (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(myships_m.map(s => s.energy));
  const enemyEnergycost = (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(enemyships.map(s => s.energy)) - (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(enemyships_m.map(s => s.energy));
  const myAliveIndexes = myships_m.map(s => s.index);
  const myDeadShips = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, myAliveIndexes);
  const myDeadShipsCost = (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(myDeadShips.map(s => shipcost(s, "me")));
  const enemyAliveIndexes = enemyships_m.map(s => s.index);
  const enemyDeadShips = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(enemyships, enemyAliveIndexes);
  const enemyDeadShipsCost = (0,_vec__WEBPACK_IMPORTED_MODULE_2__.sum)(enemyDeadShips.map(s => shipcost(s, "enemy")));
  const myValueLoss = myEnergycost + myDeadShipsCost;
  const enemyValueLoss = enemyEnergycost + enemyDeadShipsCost;
  const myAdvantage = enemyValueLoss - myValueLoss;
  return {
    myAdvantage,
    meIsLastStanding,
    myEnergycost,
    enemyEnergycost,
    myDeadShipsCost,
    enemyDeadShipsCost,
    myValueLoss,
    enemyValueLoss
  };
}
/**
 * Lowest energy first
 */

function sortByShipenergy(ships) {
  return ships.slice().sort((a, b) => a.energy - b.energy);
}
/**
 * Biggest energy first
 */


function sortByShipenergyReverse(ships) {
  return ships.slice().sort((a, b) => b.energy - a.energy);
}
/*
function shipcost(ship: Ship | Ship_m, player = "enemy"): number {
  const { bases, shapes } = collections;
  const cost = bases[player].current_spirit_cost;
  if (shapes[player] === "squares") {
    return cost - 100;
  } else if (shapes[player] === "circles") {
    return cost * ship.size - 10 * ship.size;
  } else if (shapes[player] === "triangles") {
    return cost - 30;
  }
  return cost;
}
*/


function shipcost(ship, player = "enemy") {
  const {
    bases,
    shapes
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections; //const cost = bases[player].current_spirit_cost;

  if (shapes[player] === "squares") {
    return 360 - 100;
  } else if (shapes[player] === "circles") {
    return (25 - 10) * ship.size; //for circles, ship.size effectively is NUMBER of ships (single ship has size 1)
  } else {
    //if (shapes[player] === "triangles") {
    return 90 - 30;
  }
}

function lossFromAttacking(ship) {
  //ship.size, but only as much energy as it has.
  return Math.min(ship.size, ship.energy);
}

function attackdmg(ship) {
  //2*ship.size, but only as much energy as it has.
  return 2 * Math.min(ship.size, ship.energy);
}

function evalBattle1tick(ships1, ships2) {
  //first make ships1 (order by LARGEST first) attack ships2 (order by LOWEST first)
  const attackers = sortByShipenergyReverse(ships1); //biggest first

  const defenders = sortByShipenergy(ships2); //lowest first

  const energy_attackers = attackers.map(s => s.energy);
  const energy_defenders = defenders.map(s => s.energy);
  const attackers_alreadyattacked = new Array(energy_attackers.length).fill(false);

  for (const [i, defender] of defenders.entries()) {
    const defloss = lossFromAttacking(defender);

    for (const [j, attacker] of attackers.entries()) {
      if (energy_defenders[i] - defloss >= 0 && !attackers_alreadyattacked[j]) {
        energy_defenders[i] -= attackdmg(attacker);
        energy_attackers[j] -= lossFromAttacking(attacker);
        attackers_alreadyattacked[j] = true;
      }
    }
  }

  const energy_attackers_change = attackers.map((s, i) => energy_attackers[i] - s.energy);
  const energy_defenders_change = defenders.map((s, i) => energy_defenders[i] - s.energy); /////

  const attackers2 = sortByShipenergyReverse(ships2); //biggest first

  const defenders2 = sortByShipenergy(ships1); //lowest first

  const energy_attackers2 = attackers2.map(s => s.energy);
  const energy_defenders2 = defenders2.map(s => s.energy);
  const attackers_alreadyattacked2 = new Array(energy_attackers2.length).fill(false);

  for (const [i, defender] of defenders2.entries()) {
    const defloss = lossFromAttacking(defender);

    for (const [j, attacker] of attackers2.entries()) {
      if (energy_defenders2[i] - defloss >= 0 && !attackers_alreadyattacked2[j]) {
        energy_defenders2[i] -= attackdmg(attacker);
        energy_attackers2[j] -= lossFromAttacking(attacker);
        attackers_alreadyattacked2[j] = true;
      }
    }
  }

  const energy_attackers2_change = attackers2.map((s, i) => energy_attackers2[i] - s.energy).reverse();
  const energy_defenders2_change = defenders2.map((s, i) => energy_defenders2[i] - s.energy).reverse(); ////
  //energy_attackers_change now corresponds to energy_defenders2_change and same order
  //energy_defenders now corresponds to energy_attackers2_change and same order

  const consolidated_attackerchange = energy_attackers_change.map((x, i) => x + energy_defenders2_change[i]);
  const consolidated_defenderchange = energy_defenders_change.map((x, i) => x + energy_attackers2_change[i]);
  const resulting_energy_attackers = attackers.map((s, i) => s.energy + consolidated_attackerchange[i]);
  const resulting_energy_defenders = defenders.map((s, i) => s.energy + consolidated_defenderchange[i]);
  const resulting_attackers = attackers.map((s, i) => ({
    index: s.index,
    size: s.size,
    energy: resulting_energy_attackers[i]
  })).filter(s => s.energy >= 0);
  const resulting_defenders = defenders.map((s, i) => ({
    index: s.index,
    size: s.size,
    energy: resulting_energy_defenders[i]
  })).filter(s => s.energy >= 0);
  return [resulting_attackers, resulting_defenders];
}

/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "D": () => (/* binding */ D),
/* harmony export */   "D_LONG": () => (/* binding */ D_LONG),
/* harmony export */   "BLOCK_RANGE": () => (/* binding */ BLOCK_RANGE),
/* harmony export */   "EXPLODE_RANGE": () => (/* binding */ EXPLODE_RANGE)
/* harmony export */ });
const D = 199.9999; //the value to use when offsetting points

const D_LONG = 299.9999;
/** disables spawning if enemy within this distance of base */

const BLOCK_RANGE = 400;
/** killing itself and dealing 10 damage to all enemy spirits */

const EXPLODE_RANGE = 160;

/***/ }),

/***/ "./src/energize/energize.ts":
/*!**********************************!*\
  !*** ./src/energize/energize.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ energize)
/* harmony export */ });
/* harmony import */ var _energize_enemy_ships__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./energize_enemy_ships */ "./src/energize/energize_enemy_ships.ts");
/* harmony import */ var _energize_self__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./energize_self */ "./src/energize/energize_self.ts");
/* harmony import */ var _energize_enemy_structures__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./energize_enemy_structures */ "./src/energize/energize_enemy_structures.ts");
/* harmony import */ var _energize_neutral_structures__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./energize_neutral_structures */ "./src/energize/energize_neutral_structures.ts");
/* harmony import */ var _energize_bases_from_starships__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./energize_bases_from_starships */ "./src/energize/energize_bases_from_starships.ts");
/* harmony import */ var _energize_friends_in_need__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./energize_friends_in_need */ "./src/energize/energize_friends_in_need.ts");
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");







/**
 * ```raw
 * The general idea is:
 *
 * 1. energize enemy ships (2:1)
 * 2. energize self
 *
 * 3. energize friends in need
 *  3.1. from starships (chain)
 *  3.2. from nearbyfriend (but as close to a star as possible)
 *
 * 4. energize enemy structures
 *  4.1. bases
 *  4.2. outpost
 *  4.3. pylon
 * 5. energize neutral structures
 *  5.1. bases
 *  5.2. outpost
 *  5.3. pylon
 * 6. energize bases from from starships (chain)
 * ```
 */

function energize(orders) {
  const energizing = [];
  const attacking = [];

  if (tick < 27) {
    special_earlygame(orders);
    return;
  }

  (0,_energize_self__WEBPACK_IMPORTED_MODULE_1__.default)(orders.targets, energizing);
  (0,_energize_enemy_ships__WEBPACK_IMPORTED_MODULE_0__.default)(orders.targets, energizing, attacking);
  (0,_energize_friends_in_need__WEBPACK_IMPORTED_MODULE_5__.default)(orders.targets, energizing, attacking);
  (0,_energize_enemy_structures__WEBPACK_IMPORTED_MODULE_2__.default)(orders.targets, energizing);
  (0,_energize_neutral_structures__WEBPACK_IMPORTED_MODULE_3__.default)(orders.targets, energizing);
  (0,_energize_bases_from_starships__WEBPACK_IMPORTED_MODULE_4__.default)(orders.targets, energizing);
}

function special_earlygame(orders) {
  const {
    myships,
    stars
  } = _collections__WEBPACK_IMPORTED_MODULE_6__.collections;

  for (const ship of myships) {
    orders.targets[ship.index] = stars.me;
  }
}

/***/ }),

/***/ "./src/energize/energize_bases_from_starships.ts":
/*!*******************************************************!*\
  !*** ./src/energize/energize_bases_from_starships.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ energize_bases_from_starships)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _pointsLong__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../pointsLong */ "./src/pointsLong.ts");




function energize_bases_from_starships(targets, energizing) {
  const {
    stars,
    bases,
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  energize_base_when_in_both_base_and_star_range(targets, energizing, bases.me, stars.me);
  energize_base_when_in_both_base_and_star_range(targets, energizing, bases.enemy, stars.enemy);
  energize_base_when_in_both_base_and_star_range(targets, energizing, bases.middle, stars.middle); //"star.big -> ship -> fragment -> ship -> base.me" chain

  energize_fragment_when_in_both_fragment_and_star_range(targets, energizing, stars.big, _pointsLong__WEBPACK_IMPORTED_MODULE_3__.pointsLong.b2 //fragment point
  );
  energize_base_when_in_both_base_and_fragment_range(targets, energizing, bases.me, _pointsLong__WEBPACK_IMPORTED_MODULE_3__.pointsLong.b2 //fragment point
  );
}

function energize_base_when_in_both_base_and_fragment_range(targets, energizing, base, fragmentPoint) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsInRange = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, fragmentPoint) && (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, base));

  for (const ship of myshipsInRange) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.isFull)(ship)) {
      targets[ship.index] = base;
      energizing.push(ship.index);
    }
  }

  return;
}

function energize_fragment_when_in_both_fragment_and_star_range(targets, energizing, star, fragmentPoint) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsInRange = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, fragmentPoint) && (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, star));

  for (const ship of myshipsInRange) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.isFull)(ship)) {
      //energize position on "ground", will "merge" with any existing fragment around this general area
      //TODO: find out what size this "area" is where it auto merges with existing fragment
      targets[ship.index] = fragmentPoint;
      energizing.push(ship.index);
    }
  }

  return;
}

function energize_base_when_in_both_base_and_star_range(targets, energizing, base, star) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsMe)(base.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsInRange = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, base) && (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, star));

  for (const ship of myshipsInRange) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.isFull)(ship)) {
      targets[ship.index] = base; //energize base

      energizing.push(ship.index);
    }
  }

  return;
}
/*

function energize_base_from_star_chain(
  targets: Target[],
  energizing: Vec,
  star: Star,
  base: Base
): void {
  const { myships } = collections;
  if (!controlIsMe(base.control)) return;

  const sourceShips = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(star.position, s.position)
  );
  const sourceShipsIndexes = sourceShips.map((s) => s.index);

  const destinationShips = ships_not_in(myships, energizing).filter((s) =>
    isWithinDist(base.position, s.position)
  );
  if (destinationShips.length < 1) return;
  const destinationShipsIndexes = destinationShips.map((s) => s.index);

  const graphShips = ships_not_in(myships, energizing);

  const sending: Vec = [];
  const recieving: Vec = [];
  sources: for (const sourceShip of sourceShips) {
    // destination ships that can recieve at least one more transfer
    const availableDestinationShips = ships_not_in(destinationShips, recieving);
    if (availableDestinationShips.length < 1) return;

    // prune away sources, desinations and those already sending or recieving
    const ignoreIndexes = sourceShipsIndexes
      .concat(destinationShipsIndexes)
      .concat(sending)
      .concat(recieving);
    let availableGraphShips = ships_not_in(graphShips, ignoreIndexes);
    availableGraphShips.push(sourceShip); //add back current sourceShip
    availableGraphShips = availableGraphShips.concat(availableDestinationShips); //add back available desinationships

    const G = constructGraph(availableGraphShips);
    const chainShips = path_firstavailable(
      graphShips,
      G,
      sourceShip,
      availableDestinationShips
    );

    //console.log(`chain: ${chainShips.map((s) => s.index + 1)}`);

    if (chainShips.length < 2) return;

    //we now know there is a chain from star to base.
    //but a ship in between might be empty

    for (let i = 0; i < chainShips.length - 1; i++) {
      if (isEmpty(chainShips[i])) continue sources;

      const sender = chainShips[i];
      const reciever = chainShips[i + 1]; //next in chain
      targets[sender.index] = reciever;
      energizing.push(sender.index);

      sending.push(sender.index);
      recieving.push(reciever.index);

      //sender.shout("s");
    }

    const destinationShip = chainShips[chainShips.length - 1];
    if (notEmpty(destinationShip)) {
      targets[destinationShip.index] = base; //energize base
      recieving.push(destinationShip.index); //might not actually want to make this "busy" in case I want to send more to it...

      //destinationShip.shout("d");
    }
  }

  return;
}
*/

/***/ }),

/***/ "./src/energize/energize_enemy_ships.ts":
/*!**********************************************!*\
  !*** ./src/energize/energize_enemy_ships.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ energize_enemy_ships)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");



/**
 * Attack enemies in range, in a way that does not overkill an enemy.
 */

function energize_enemy_ships(targets, energizing, attacking) {
  const {
    enemyships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const assumeNheals = 0;

  for (const enemyship of (0,_find__WEBPACK_IMPORTED_MODULE_1__.sortByShipenergy)(enemyships)) {
    const myshipsInRange300 = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(enemyship.nearbyenemies300, energizing);
    const myshipsInRange = myshipsInRange300.filter(myship => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(myship, enemyship)); //const potentialHeal = sum(enemyship.nearbyfriends.map(transferamount));

    const enemyHealth = enemyship.energy - (0,_utils__WEBPACK_IMPORTED_MODULE_2__.lossFromAttacking)(enemyship);
    const enemyshipEnergy = enemyHealth + assumeNheals * enemyship.size;
    let dmgdealt = 0;

    for (const myship of myshipsInRange) {
      if (dmgdealt <= enemyshipEnergy) {
        if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notEmpty)(myship)) {
          targets[myship.index] = enemyship;
          dmgdealt += (0,_utils__WEBPACK_IMPORTED_MODULE_2__.attackdmg)(myship);
          energizing.push(myship.index);
          attacking.push(myship.index);
        }
      }
    }
  }
}

/***/ }),

/***/ "./src/energize/energize_enemy_structures.ts":
/*!***************************************************!*\
  !*** ./src/energize/energize_enemy_structures.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ energize_enemy_structures)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");



function energize_enemy_structures(targets, energizing) {
  const {
    bases,
    outposts,
    pylons
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;

  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    energize_enemy_base(targets, energizing, base);
  }

  for (const outpost of [outposts.middle]) {
    energize_enemy_outpost(targets, energizing, outpost);
  }

  for (const pylon of [pylons.middle]) {
    energize_enemy_pylon(targets, energizing, pylon);
  }
}

function energize_enemy_base(targets, energizing, base) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(base.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsNearBase = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, base));

  for (const ship of myshipsNearBase) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notEmpty)(ship)) {
      targets[ship.index] = base;
      energizing.push(ship.index);
    }
  }
}

function energize_enemy_outpost(targets, energizing, outpost) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(outpost.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsNearOutpost = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, outpost));

  for (const ship of myshipsNearOutpost) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notEmpty)(ship)) {
      targets[ship.index] = outpost;
      energizing.push(ship.index);
    }
  }
}

function energize_enemy_pylon(targets, energizing, pylon) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(pylon.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsNearOutpost = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, pylon));

  for (const ship of myshipsNearOutpost) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notEmpty)(ship)) {
      targets[ship.index] = pylon;
      energizing.push(ship.index);
    }
  }
}

/***/ }),

/***/ "./src/energize/energize_friends_in_need.ts":
/*!**************************************************!*\
  !*** ./src/energize/energize_friends_in_need.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ energize_friends_in_need)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");



function energize_friends_in_need(targets, energizing, attacking) {
  //heal_attackers_from_star_ships(targets, energizing, attacking);
  heal_attackers_from_nearby_friends(targets, energizing, attacking);
}

function heal_attackers_from_nearby_friends(targets, energizing, attacking) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myAttackingShips = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_in)(myships, attacking);

  for (const myAttacker of myAttackingShips) {
    const shipFriends300 = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myAttacker.nearbyfriends300, energizing);
    const shipFriends = shipFriends300.filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, myAttacker));
    let requiredHeal = myAttacker.energy_capacity - myAttacker.energy + (0,_utils__WEBPACK_IMPORTED_MODULE_2__.transferamount)(myAttacker);

    for (const myHealer of shipFriends) {
      const healAmount = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.transferamount)(myHealer);
      if (requiredHeal < healAmount) break;
      targets[myHealer.index] = myAttacker;
      energizing.push(myHealer.index);
      requiredHeal -= healAmount;
    }
  }
}

/***/ }),

/***/ "./src/energize/energize_neutral_structures.ts":
/*!*****************************************************!*\
  !*** ./src/energize/energize_neutral_structures.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ energize_neutral_structures)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");



function energize_neutral_structures(targets, energizing) {
  const {
    bases,
    outposts,
    pylons
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;

  for (const base of [bases.big, bases.enemy, bases.me, bases.middle]) {
    energize_neutral_base(targets, energizing, base);
  }

  for (const outpost of [outposts.middle]) {
    energize_neutral_outpost(targets, energizing, outpost);
  }
  /*
  for (const pylon of [pylons.middle]) {
    energize_neutral_pylon(targets, energizing, pylon);
  }
  */

}

function energize_neutral_base(targets, energizing, base) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsNeutral)(base.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsNearBase = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, base));

  for (const ship of myshipsNearBase) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notEmpty)(ship)) {
      targets[ship.index] = base;
      energizing.push(ship.index);
    }
  }
}

function energize_neutral_outpost(targets, energizing, outpost) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsNeutral)(outpost.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsNearOutpost = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, outpost));

  for (const ship of myshipsNearOutpost) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notEmpty)(ship)) {
      targets[ship.index] = outpost;
      energizing.push(ship.index);
    }
  }
}

function energize_neutral_pylon(targets, energizing, pylon) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsNeutral)(pylon.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsNearPylon = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, pylon));

  for (const ship of myshipsNearPylon) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notEmpty)(ship)) {
      targets[ship.index] = pylon;
      energizing.push(ship.index);
    }
  }
}

/***/ }),

/***/ "./src/energize/energize_self.ts":
/*!***************************************!*\
  !*** ./src/energize/energize_self.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ energize_self)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../vec */ "./src/vec.ts");




/**
 * note: If a spirit can harvest from a star or from a fragment, it will prioritize the fragment.
 */

function energize_self(targets, energizing) {
  const {
    stars,
    bases
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  /*
  if (tick < 100) {
    maybeBoostInstead(targets, energizing, stars.me);
  }
  */

  const ignoreSustBigstar = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.big.control);
  const ignoreSustMeStar = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.me.control);
  const ignoreSustMiddleStar = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.middle.control);
  const ignoreSustEnemyStar = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.enemy.control);
  energize_self_star(targets, energizing, stars.big, ignoreSustBigstar);
  energize_self_star(targets, energizing, stars.middle, ignoreSustMiddleStar);
  energize_self_star(targets, energizing, stars.me, ignoreSustMeStar);
  energize_self_star(targets, energizing, stars.enemy, ignoreSustEnemyStar);

  for (const fragment of fragments) {
    energize_self_fragment(targets, energizing, fragment);
  }
}

function energize_self_fragment(targets, energizing, fragment) {
  const {
    myships,
    bases
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsnearfragment = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, fragment.position) && (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, bases.me));
  let currentFragmentEnergy = fragment.energy * 1;

  for (const ship of myshipsnearfragment) {
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notFull)(ship) && currentFragmentEnergy > 0) {
      targets[ship.index] = ship; //energize self

      energizing.push(ship.index);
      currentFragmentEnergy -= (0,_utils__WEBPACK_IMPORTED_MODULE_2__.gainFromSelfing)(ship);
    }
  }
}

function energize_self_star(targets, energizing, star, ignoreSust = false) {
  const {
    myships,
    bases
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsInRangeOfStar = (0,_find__WEBPACK_IMPORTED_MODULE_1__.sortByIsMovingToHeal)((0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, star)));
  let currentExtraStarEnergy = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.sustainableStarSelfingAmount)(star); //I can actually take more because it will sustain 2 constant farmers at 900 aswell
  //or in the case of big star: 9 constant farmers at 2900 energy
  //however, we still want it to grow.
  //so only 50 for normal stars and 66 for big stars to make sure it grows.

  if (star.energy_capacity === 1000 && star.energy > star.energy_capacity - 50) {
    const additionalFarmable = star.energy - (star.energy_capacity - 50);
    currentExtraStarEnergy += additionalFarmable;
  } else if (star.energy_capacity === 3000 && star.energy > star.energy_capacity - 66) {
    const additionalFarmable = star.energy - (star.energy_capacity - 66);
    currentExtraStarEnergy += additionalFarmable;
  } //some conditions here. in particular early game mid star farming


  const ignoreSustainable = ignoreSust || myshipsInRangeOfStar.length === 1;

  for (const ship of myshipsInRangeOfStar) {
    const transferedEnergy = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.gainFromSelfing)(ship);

    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.notFull)(ship) && (ignoreSustainable || currentExtraStarEnergy - transferedEnergy > 0)) {
      targets[ship.index] = ship; //energize self

      energizing.push(ship.index);
      currentExtraStarEnergy -= transferedEnergy;
    }
  }
}

function maybeBoostInstead(targets, energizing, star) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myshipsInRangeOfStar = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, energizing).filter(s => (0,_utils__WEBPACK_IMPORTED_MODULE_2__.canEnergize)(s, star)); //half the time the ship would not take from the star

  const sumEnergyTakenPerTick = 0.5 * (0,_vec__WEBPACK_IMPORTED_MODULE_3__.sum)(myshipsInRangeOfStar.map(_utils__WEBPACK_IMPORTED_MODULE_2__.gainFromSelfing));
  const currentExtraStarEnergy = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.sustainableStarSelfingAmount)(star);
  if (sumEnergyTakenPerTick <= currentExtraStarEnergy) return; //no need

  for (const ship of myshipsInRangeOfStar) {
    targets[ship.index] = star; //boost star

    energizing.push(ship.index);
  }
}

/***/ }),

/***/ "./src/find.ts":
/*!*********************!*\
  !*** ./src/find.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ship_closest": () => (/* binding */ ship_closest),
/* harmony export */   "ship_closest_to_point": () => (/* binding */ ship_closest_to_point),
/* harmony export */   "ships_closestN": () => (/* binding */ ships_closestN),
/* harmony export */   "sortByNearestenemyDistance": () => (/* binding */ sortByNearestenemyDistance),
/* harmony export */   "sortByNearestenemyDistanceReverse": () => (/* binding */ sortByNearestenemyDistanceReverse),
/* harmony export */   "sortByNearestDistance": () => (/* binding */ sortByNearestDistance),
/* harmony export */   "sortByIsMovingToHeal": () => (/* binding */ sortByIsMovingToHeal),
/* harmony export */   "sortByNearestDistanceReverse": () => (/* binding */ sortByNearestDistanceReverse),
/* harmony export */   "sortByShipenergy": () => (/* binding */ sortByShipenergy),
/* harmony export */   "sortByShipenergyReverse": () => (/* binding */ sortByShipenergyReverse),
/* harmony export */   "ships_in": () => (/* binding */ ships_in),
/* harmony export */   "ships_not_in": () => (/* binding */ ships_not_in),
/* harmony export */   "is_in": () => (/* binding */ is_in),
/* harmony export */   "not_in": () => (/* binding */ not_in),
/* harmony export */   "shipFromIndex": () => (/* binding */ shipFromIndex),
/* harmony export */   "shipFromId": () => (/* binding */ shipFromId),
/* harmony export */   "ship_is_in_ships": () => (/* binding */ ship_is_in_ships),
/* harmony export */   "ship_is_not_in_ships": () => (/* binding */ ship_is_not_in_ships)
/* harmony export */ });
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec */ "./src/vec.ts");

/**
 * ```raw
 * Return the ship (not in busy) that is closest to point p.
 *
 * Note: Will return undefined if the passed ships array is empty or none not busy ships.
 * ```
 */

function ship_closest(ships, p, busy = []) {
  const freeships = ships_not_in(ships, busy);
  const distances = freeships.map(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(s.position, p));
  const ship = freeships[(0,_vec__WEBPACK_IMPORTED_MODULE_0__.minimum)(distances).index];
  return ship;
}
function ship_closest_to_point(ships, p) {
  const distances = ships.map(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(s.position, p));
  const ship = ships[(0,_vec__WEBPACK_IMPORTED_MODULE_0__.minimum)(distances).index];
  return ship;
}
/**
 * Return the N ships that is closest to point p.
 */

function ships_closestN(ships, p, N) {
  const sortedships = ships.slice().sort((a, b) => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(a.position, p) - (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(b.position, p));
  return sortedships.slice(0, N);
}
/**
 * Smallest distance first, as compared to ship.position to ship.nearestenemy.position (which is different for each ship)
 */

function sortByNearestenemyDistance(ships) {
  return ships.slice().sort((a, b) => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(a.position, a.nearestenemy.position) - (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(b.position, b.nearestenemy.position));
}
/**
 * Biggest distance first, as compared to ship.position to ship.nearestenemy.position (which is different for each ship)
 */

function sortByNearestenemyDistanceReverse(ships) {
  return ships.slice().sort((a, b) => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(b.position, b.nearestenemy.position) - (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(a.position, a.nearestenemy.position));
}
/**
 * Smallest distance first, as compared to ship.position to targetpoint
 */

function sortByNearestDistance(ships, targetpoint) {
  return ships.slice().sort((a, b) => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(a.position, targetpoint) - (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(b.position, targetpoint));
}

function isMovingToHealComparator(a, b) {
  const A = memory.movingToHealIds.includes(a.id);
  const B = memory.movingToHealIds.includes(b.id);

  if (A && !B) {
    return -1;
  }

  if (!A && B) {
    return 1;
  }

  return 0;
}
/**
 * Moving to heal first. uses memory.isMovingToHealComparator
 */


function sortByIsMovingToHeal(ships) {
  return ships.slice().sort(isMovingToHealComparator);
}
/**
 * Biggest distance first, as compared to ship.position to targetpoint
 */

function sortByNearestDistanceReverse(ships, targetpoint) {
  return ships.slice().sort((a, b) => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(b.position, targetpoint) - (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(a.position, targetpoint));
}
/**
 * Lowest energy first
 */

function sortByShipenergy(ships) {
  return ships.slice().sort((a, b) => a.energy - b.energy);
}
/**
 * Biggest energy first
 */

function sortByShipenergyReverse(ships) {
  return ships.slice().sort((a, b) => b.energy - a.energy);
}
/**
 * Return all ships that DOES have a ship.index listed in the vector indexes.
 */

function ships_in(ships, indexes) {
  return ships.filter(ship => indexes.includes(ship.index));
}
/**
 * Return all ships that does NOT have a ship.index listed in the vector indexes.
 */

function ships_not_in(ships, indexes) {
  return ships.filter(ship => !indexes.includes(ship.index));
}
/**
 * Return true if ship.index is in indexes
 */

function is_in(ship, indexes) {
  return indexes.includes(ship.index);
}
/**
 * Return true if ship.index is NOT in indexes
 */

function not_in(ship, indexes) {
  return !indexes.includes(ship.index);
}
/**
 * Return the ship with index i (if it exists)
 */

function shipFromIndex(ships, i) {
  return ships.find(s => s.index === i);
}
/**
 * Return the ship with index i (if it exists)
 */

function shipFromId(ships, id) {
  return ships.find(s => s.id === id);
}
/**
 * Return true if ship exist in array ships
 */

function ship_is_in_ships(ship, ships) {
  const foundShip = ships.find(s => s.index === ship.index);

  if (foundShip === undefined) {
    return false;
  } else {
    return true;
  }
}
/**
 * Return true if ship.index is NOT in any of ships indexes
 */

function ship_is_not_in_ships(ship, ships) {
  return !ship_is_in_ships(ship, ships);
}

/***/ }),

/***/ "./src/move/move.ts":
/*!**************************!*\
  !*** ./src/move/move.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ move)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _move_defend_against_harassers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./move_defend_against_harassers */ "./src/move/move_defend_against_harassers.ts");
/* harmony import */ var _move_farm__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./move_farm */ "./src/move/move_farm.ts");
/* harmony import */ var _move_avoid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./move_avoid */ "./src/move/move_avoid.ts");
/* harmony import */ var _move_heal__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./move_heal */ "./src/move/move_heal.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../vec */ "./src/vec.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _move_strategic__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./move_strategic */ "./src/move/move_strategic.ts");










/**
 * ```raw
 * The general idea is:
 * - Farm and prevent spawn blocking
 * - Strategic orders
 * - Avoid bad movements (combat eval)
 * - go and heal - some sort of "go heal before you can be useful again"
 * ```
 */

function move(orders) {
  (0,_move_defend_against_harassers__WEBPACK_IMPORTED_MODULE_2__.default)(orders);
  (0,_move_farm__WEBPACK_IMPORTED_MODULE_3__.default)(orders);
  (0,_move_strategic__WEBPACK_IMPORTED_MODULE_9__.default)(orders);
  (0,_move_avoid__WEBPACK_IMPORTED_MODULE_4__.default)(orders);
  (0,_move_heal__WEBPACK_IMPORTED_MODULE_5__.default)(orders);
}

function move_poststrat(orders) {
  const {
    stars,
    bases,
    outposts,
    pylons
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  /*
  for (const star of [stars.big]) {
    goToStar(orders, star);
  }
  */
  //for (const structure of [bases.big]) {

  for (const structure of [bases.middle, bases.me, bases.enemy, bases.big, outposts.middle, pylons.middle]) {
    goToStructureIfUncontrolled(orders, structure);
  }
}

function goToStructureIfUncontrolled(orders, base) {
  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_8__.controlIsEnemy)(base.control)) return;
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;

  for (const ship of (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, orders.moving)) {
    orders.targetps[ship.index] = base.position;
    orders.moving.push(ship.index);

    if ((0,_vec__WEBPACK_IMPORTED_MODULE_7__.isWithinDist)(ship.position, base.position, _constants__WEBPACK_IMPORTED_MODULE_6__.D_LONG)) {
      //ship.lock();
      ship.unlock();
    }
  }
}

function goToStar(orders, star) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;

  for (const ship of (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_not_in)(myships, orders.moving)) {
    orders.targetps[ship.index] = star.position;
    orders.moving.push(ship.index);

    if ((0,_vec__WEBPACK_IMPORTED_MODULE_7__.isWithinDist)(ship.position, star.position, _constants__WEBPACK_IMPORTED_MODULE_6__.D_LONG)) {
      //ship.lock();
      ship.unlock();
    }
  }
}

/***/ }),

/***/ "./src/move/move_avoid.ts":
/*!********************************!*\
  !*** ./src/move/move_avoid.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ move_void)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _combateval__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../combateval */ "./src/combateval.ts");
/* harmony import */ var _positioning__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../positioning */ "./src/positioning.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../vec */ "./src/vec.ts");




function move_void(orders) {
  //clamp_movement(orders.targetps);
  const COMMON_PLACE_MAX_RANGE = 60; //how far to look for a common avoid place

  const {
    myships,
    shapes
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myMovingShips = myships.filter(s => !s.locked);
  const pickedAvoidPoints = [];

  for (const ship of myMovingShips) {
    const desiredPoint = orders.targetps[ship.index];
    const desiredAvoidPoint = (0,_positioning__WEBPACK_IMPORTED_MODULE_2__.avoidEnemy)(ship, desiredPoint, ship.nearestenemy);
    const {
      myAdvantage
    } = (0,_combateval__WEBPACK_IMPORTED_MODULE_1__.default)(ship.nearbyfriends20, ship.nearbyenemies240);

    if (myAdvantage > -1) {
      //can continue as planned
      //TODO: what about triangles exploding? might not be safe to continue maxstep forward.
      orders.targetps[ship.index] = desiredPoint;

      if (shapes.enemy === "triangles" && ship.nearbyenemies240.length > 1) {
        const desired_moved_p = (0,_vec__WEBPACK_IMPORTED_MODULE_3__.offsetmax20)(ship.position, desiredPoint);
        orders.targetps[ship.index] = (0,_positioning__WEBPACK_IMPORTED_MODULE_2__.avoidCircle)(ship.position, desired_moved_p, ship.nearestenemy.position, 160.00001);
      }
    } else {
      orders.avoiding.push(ship.index); //in danger

      const reachableAvoidPoints2steps = pickedAvoidPoints.filter(p => (0,_vec__WEBPACK_IMPORTED_MODULE_3__.isWithinDist)(p.point, ship.position, COMMON_PLACE_MAX_RANGE));

      if (reachableAvoidPoints2steps.length === 0) {
        //no common place in range, pick your own avoid point.
        const pickedAvoidPoint = desiredAvoidPoint;
        orders.targetps[ship.index] = pickedAvoidPoint;
        pickedAvoidPoints.push({
          point: pickedAvoidPoint,
          count: 1
        });
      } else if (reachableAvoidPoints2steps.length === 1) {
        //only one common place in range, pick it.
        const {
          point: pickedAvoidPoint
        } = reachableAvoidPoints2steps[0];
        orders.targetps[ship.index] = pickedAvoidPoint;
        pickedAvoidPoints.push({
          point: pickedAvoidPoint,
          count: 1
        });
      } else {
        //pick one of the common places in range.
        //IDEA1: pick the closest one
        //const { index: closestIndex } = minimum(reachableAvoidPoints2steps.map((p) => dist(p.point, ship.position)));
        //const {point: pickedAvoidPoint} = pickedAvoidPoints[closestIndex];
        //pickedAvoidPoints[closestIndex].count += 1
        //orders.targetps[ship.index] = pickedAvoidPoint;
        //IDEA2: pick the most popular one
        const {
          index: popularIndex
        } = (0,_vec__WEBPACK_IMPORTED_MODULE_3__.maximum)(reachableAvoidPoints2steps.map(p => p.count));
        const {
          point: pickedAvoidPoint
        } = pickedAvoidPoints[popularIndex];
        pickedAvoidPoints[popularIndex].count += 1;
        orders.targetps[ship.index] = pickedAvoidPoint;
      }
    }
  }
}
/**
 * A Ship can only move 20 units. make targetps reflect that.
 */

function clamp_movement(targetps) {
  const {
    myships,
    stars,
    outposts,
    bases,
    pylons
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;

  for (const ship of myships) {
    if (targetps[ship.index]) {
      targetps[ship.index] = (0,_vec__WEBPACK_IMPORTED_MODULE_3__.offsetmax20)(ship.position, targetps[ship.index]);
    } else {
      //its possible ship was never assigned at targetp but unlikely
      targetps[ship.index] = ship.position;
    }
  } //avoid structures


  for (const ship of myships) {
    for (const structure of [stars.big, stars.enemy, stars.me, stars.middle, bases.big, bases.enemy, bases.me, bases.middle, outposts.middle, pylons.middle]) {
      targetps[ship.index] = (0,_positioning__WEBPACK_IMPORTED_MODULE_2__.avoidCircle)(ship.position, targetps[ship.index], structure.position, structure.collision_radius);
    }
  }
}

/***/ }),

/***/ "./src/move/move_defend_against_harassers.ts":
/*!***************************************************!*\
  !*** ./src/move/move_defend_against_harassers.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ move_defend_against_harassers)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _pointsLong__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../pointsLong */ "./src/pointsLong.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _positioning__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./positioning */ "./src/move/positioning.ts");




function move_defend_against_harassers(orders) {
  const {
    bases,
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const shouldDefMeOverride = false;
  const shouldDefMiddleOverride = false;
  const shouldDefEnemyOverride = false; //me

  const shouldDefMe = shouldDefMeOverride || (0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsMe)(bases.me.control) && couldSpawnNships(bases.me, 2); //middle

  const shouldDefMiddle = shouldDefMiddleOverride || (0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsMe)(bases.middle.control) && couldSpawnNships(bases.middle, 2); //enemy

  const shouldDefEnemy = shouldDefEnemyOverride || (0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsMe)(bases.enemy.control) && couldSpawnNships(bases.enemy, 2);

  if (shouldDefMe) {
    const points = [_pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.h_def_front, _pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.h_def_side, _pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.h_def_back];
    (0,_positioning__WEBPACK_IMPORTED_MODULE_3__.position_at_points)(orders, points);
  }

  if (shouldDefMiddle) {
    const points = [_pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.m_def_front, _pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.m_def_side, _pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.m_def_back];
    (0,_positioning__WEBPACK_IMPORTED_MODULE_3__.position_at_points)(orders, points);
  }

  if (shouldDefEnemy) {
    const points = [_pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.e_def_front, _pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.e_def_side, _pointsLong__WEBPACK_IMPORTED_MODULE_1__.pointsLong.e_def_back];
    (0,_positioning__WEBPACK_IMPORTED_MODULE_3__.position_at_points)(orders, points);
  }
}
/**
 * True if base is full or could make N ships
 *
 * note: Will actually only return true if it is currently blocked because ships are auto spawned if could make 1 ship.
 */

function couldSpawnNships(base, N) {
  return base.energy >= Math.min(base.energy_capacity, N * base.current_spirit_cost);
}

/***/ }),

/***/ "./src/move/move_farm.ts":
/*!*******************************!*\
  !*** ./src/move/move_farm.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ move_farm)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _pointsLong__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../pointsLong */ "./src/pointsLong.ts");
/* harmony import */ var _positioning__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./positioning */ "./src/move/positioning.ts");
/* harmony import */ var _move_strategic__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./move_strategic */ "./src/move/move_strategic.ts");





function move_farm(orders) {
  const {
    bases
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections; //how much of maxfarm should be allocated

  let ff_home = 1;

  if (tick < 85) {
    ff_home = 0.5;
  } else if (tick < 120) {
    ff_home = 0.75;
  } else {
    ff_home = 1;
  }

  const ff_mid = 1;
  const ff_big = 1;
  const ff_enemy = 1;
  const {
    stars
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections; //me

  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_1__.controlIsEnemy)(bases.me.control) || !(0,_move_strategic__WEBPACK_IMPORTED_MODULE_4__.enemyHasAnyWithinCircle)(stars.me.position, 220)) {
    move_farm_longrange_single_point(orders, stars.me, _pointsLong__WEBPACK_IMPORTED_MODULE_2__.pointsLong.h1, ff_home);
  } //mid


  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_1__.controlIsEnemy)(bases.middle.control) || !(0,_move_strategic__WEBPACK_IMPORTED_MODULE_4__.enemyHasAnyWithinCircle)(stars.middle.position, 220)) {
    move_farm_longrange_single_point(orders, stars.middle, _pointsLong__WEBPACK_IMPORTED_MODULE_2__.pointsLong.m1);
  } //enemy


  if (!(0,_utils__WEBPACK_IMPORTED_MODULE_1__.controlIsEnemy)(bases.enemy.control) || !(0,_move_strategic__WEBPACK_IMPORTED_MODULE_4__.enemyHasAnyWithinCircle)(stars.enemy.position, 220)) {
    move_farm_longrange_single_point(orders, stars.enemy, _pointsLong__WEBPACK_IMPORTED_MODULE_2__.pointsLong.e1);
  } //big

  /*
  move_farm_longrange_two_points(
    orders,
    stars.big,
    pointsLong.b1,
    pointsLong.b3
  );
  */

}

function move_farm_longrange_single_point(orders, star, point, maxfarmfraction = 1 //how much of maxfarm should be allocated,
) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const shipsize = myships[0].size;
  const selfers_max = maxfarmfraction * (0,_utils__WEBPACK_IMPORTED_MODULE_1__.maxStarSelfers)(star, shipsize); //const selfers_sustainable = sustainableStarSelfers(stars.middle, shipsize);

  let nselfers = 0;

  while (nselfers < selfers_max) {
    const addedSelfersPerTick = (0,_positioning__WEBPACK_IMPORTED_MODULE_3__.positionClosestShipAtPoint)(orders, point);

    if (addedSelfersPerTick === 0) {
      //couldnt find any free ship
      break;
    }

    nselfers += addedSelfersPerTick;
  }
}

function move_farm_longrange_two_points(orders, star, point1, point2, maxfarmfraction = 1 //how much of maxfarm should be allocated,
) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const shipsize = myships[0].size;
  const selfers_max = maxfarmfraction * (0,_utils__WEBPACK_IMPORTED_MODULE_1__.maxStarSelfers)(star, shipsize); //const selfers_sustainable = sustainableStarSelfers(stars.middle, shipsize);

  let nselfers = 0;

  while (nselfers < selfers_max) {
    const addedSelfersPerTick = (0,_positioning__WEBPACK_IMPORTED_MODULE_3__.positionClosestShipAtPoint)(orders, point1);
    if (addedSelfersPerTick === 0) break;
    nselfers += addedSelfersPerTick;
    const addedSelfersPerTick2 = (0,_positioning__WEBPACK_IMPORTED_MODULE_3__.positionClosestShipAtPoint)(orders, point2);
    if (addedSelfersPerTick2 === 0) break;
  }
}

/***/ }),

/***/ "./src/move/move_heal.ts":
/*!*******************************!*\
  !*** ./src/move/move_heal.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ move_heal)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../vec */ "./src/vec.ts");
/* harmony import */ var _move_strategic__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./move_strategic */ "./src/move/move_strategic.ts");
/* harmony import */ var _positioning__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./positioning */ "./src/move/positioning.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _positioning__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../positioning */ "./src/positioning.ts");








function move_heal(orders) {
  const {
    myships,
    stars
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const avoidingShouldHeal = (0,_find__WEBPACK_IMPORTED_MODULE_1__.ships_in)(myships, orders.avoiding).filter(s => s.energy <= 0.3 * s.energy_capacity);
  const emptyShouldHeal = myships.filter(s => s.energy === 0 && !(0,_utils__WEBPACK_IMPORTED_MODULE_6__.canReachAnyStar)(s));
  const mightAswellHealMid = myships.filter(s => s.energy <= 0.6 * s.energy_capacity && !s.locked && (0,_vec__WEBPACK_IMPORTED_MODULE_2__.isWithinDist)(s.position, stars.middle.position, 300) && !(0,_vec__WEBPACK_IMPORTED_MODULE_2__.isWithinDist)(s.position, stars.middle.position, 200));
  const currentTickShouldHealShips = avoidingShouldHeal.concat(mightAswellHealMid, emptyShouldHeal);
  const shouldHealShips = updateMemoryMovingToHealIds(currentTickShouldHealShips);

  for (const ship of shouldHealShips) {
    const closestSafeStarPoint = getBestHealPoint(ship);
    const desired_p = (0,_positioning__WEBPACK_IMPORTED_MODULE_7__.avoidCircle)(ship.position, closestSafeStarPoint, ship.nearestenemy.position, 240);
    (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionShipAtPoint)(orders, ship, desired_p);
  }

  return;
}
/**
 * ```raw
 * combine currentTickShouldHealShips with memory.movingToHealIds
 *  - remove full/undefined/duplicate ships
 *  - update memory.movingToHealIds
 *  - return the actual ships (instead of the ids) that still needs to heal.
 * ```
 */

function updateMemoryMovingToHealIds(currentTickShouldHealShips) {
  const currentTickShouldHealIds = currentTickShouldHealShips.map(s => s.id);
  const movingToHealIds = [...new Set(memory.movingToHealIds.concat(currentTickShouldHealIds))]; //concat and unique

  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const shoulMoveToStar = movingToHealIds.map(id => (0,_find__WEBPACK_IMPORTED_MODULE_1__.shipFromId)(myships, id)).filter(s => s !== undefined && s.energy < s.energy_capacity // && !anyStarIsWithinDist(s.position, 200)
  );
  memory.movingToHealIds = shoulMoveToStar.map(s => s.id);
  return shoulMoveToStar;
}
/**
 * find a point near a star without an enemy near it. fallback to mid star.
 */


function getBestHealPoint(ship) {
  const {
    stars
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const allStars = [stars.big, stars.enemy, stars.me, stars.middle];
  const starPoints = allStars.map(star => (0,_vec__WEBPACK_IMPORTED_MODULE_2__.offset)(star.position, ship.position, _constants__WEBPACK_IMPORTED_MODULE_5__.D));
  const safeStarPoints = starPoints.filter(p => !(0,_move_strategic__WEBPACK_IMPORTED_MODULE_3__.enemyHasAnyWithinCircle)(p, 220));

  if (safeStarPoints.length < 1) {
    const healpointMid = (0,_vec__WEBPACK_IMPORTED_MODULE_2__.offset)(stars.middle.position, ship.position, _constants__WEBPACK_IMPORTED_MODULE_5__.D);
    return healpointMid;
  }

  return (0,_vec__WEBPACK_IMPORTED_MODULE_2__.nearestPointOfPoints)(safeStarPoints, ship.position);
}

/***/ }),

/***/ "./src/move/move_strategic.ts":
/*!************************************!*\
  !*** ./src/move/move_strategic.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ move_strategic),
/* harmony export */   "enemyHasAnyWithinCircle": () => (/* binding */ enemyHasAnyWithinCircle)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _combateval__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../combateval */ "./src/combateval.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../vec */ "./src/vec.ts");
/* harmony import */ var _positioning__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./positioning */ "./src/move/positioning.ts");





function move_strategic(orders) {
  const {
    bases,
    myships,
    stars
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const goFrontMid = shouldPositionInFrontOfStar(stars.middle, bases.middle);
  const goFrontMe = shouldPositionInFrontOfStar(stars.me, bases.me);
  const goFrontEnemy = shouldPositionInFrontOfStar(stars.enemy, bases.enemy);

  for (let i = 0; i < 10; i++) {
    //middle
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.middle.control)) {
      if (goFrontMid) {
        put4infrontofstar(orders, bases.middle, stars.middle);
      } else {
        put4behindstar(orders, bases.middle, stars.middle);
      }
    } //me


    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.me.control)) {
      if (goFrontMe) {
        put4infrontofstar(orders, bases.me, stars.me);
      } else {
        put4behindstar(orders, bases.me, stars.me);
      }
    } //enemy


    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.enemy.control)) {
      if (goFrontEnemy) {
        put4infrontofstar(orders, bases.enemy, stars.enemy);
      } else {
        put4behindstar(orders, bases.enemy, stars.enemy);
      }
    }
  }

  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, bases.big.position); //positionClosestShipAtPoint(orders, bases.big.position);

  for (let i = 0; i < 10; i++) {
    //big
    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.controlIsEnemy)(bases.big.control)) {
      put4behindstar(orders, bases.big, stars.big);
      put4infrontofstar(orders, bases.big, stars.big);
      /*
      if (enemyHasAnyWithinCircle(stars.big.position, 200)) {
        
      } else {
        
      }
      */
    }
  }
}

function shouldPositionInFrontOfStar(star, base) {
  const frontPosition = (0,_vec__WEBPACK_IMPORTED_MODULE_3__.offset)(star.position, base.position, star.collision_radius + 0.0000001);
  const {
    myships,
    enemyships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  const myShipsAtStar = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_3__.isWithinDist)(s.position, frontPosition, 300));
  const enemyShipsNearby = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_3__.isWithinDist)(s.position, frontPosition, 300));

  if (enemyShipsNearby.length < 1) {
    return true;
  }

  const {
    myAdvantage
  } = (0,_combateval__WEBPACK_IMPORTED_MODULE_1__.default)(myShipsAtStar, enemyShipsNearby);
  return myAdvantage > 0;
}
/**
 * true if any enemy ship is within this circle
 */


function enemyHasAnyWithinCircle(c, r) {
  return enemiesWithinCircle(c, r).length > 0;
}

function enemiesWithinCircle(c, r) {
  const {
    enemyships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;
  return enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_3__.isWithinDist)(c, s.position, r));
}

function put4behindstar(orders, base, star) {
  const p = (0,_vec__WEBPACK_IMPORTED_MODULE_3__.offset)(star.position, base.position, -(star.collision_radius + 0.0000001)); //negative

  const c = star.position;
  const r = 200;
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
}

function put4infrontofstar(orders, base, star) {
  const p = (0,_vec__WEBPACK_IMPORTED_MODULE_3__.offset)(star.position, base.position, star.collision_radius + 0.0000001); //positive

  const c = star.position;
  const r = 200;
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
  (0,_positioning__WEBPACK_IMPORTED_MODULE_4__.positionClosestShipAtPoint)(orders, p);
}

/***/ }),

/***/ "./src/move/positioning.ts":
/*!*********************************!*\
  !*** ./src/move/positioning.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "position_at_points": () => (/* binding */ position_at_points),
/* harmony export */   "positionClosestShipAtPoint": () => (/* binding */ positionClosestShipAtPoint),
/* harmony export */   "positionShipAtPoint": () => (/* binding */ positionShipAtPoint),
/* harmony export */   "jumpTowardPointIfGood": () => (/* binding */ jumpTowardPointIfGood),
/* harmony export */   "interceptPoint": () => (/* binding */ interceptPoint),
/* harmony export */   "positionClosestShipAtPoint_stayInCircle": () => (/* binding */ positionClosestShipAtPoint_stayInCircle)
/* harmony export */ });
/* harmony import */ var _ability_jump__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ability/jump */ "./src/ability/jump.ts");
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collections */ "./src/collections.ts");
/* harmony import */ var _combateval__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../combateval */ "./src/combateval.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _find__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../find */ "./src/find.ts");
/* harmony import */ var _positioning__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../positioning */ "./src/positioning.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../vec */ "./src/vec.ts");









function uniqueIds(v) {
  return [...new Set(v)];
}
/**
 * positionClosestShipAtPoint() for multiple points
 */


function position_at_points(orders, points) {
  let allocated = 0;

  for (const point of points) {
    allocated += positionClosestShipAtPoint(orders, point);
  }

  return allocated;
}
/**
 * return `0.5` or `0` which is the number of "selfers per tick" that was just added:
 *
 * note: Half the time an allocated ship will not be selfing. Thats where 0.5 comes from.
 *
 * Will return 0 if no ship was available.
 *
 * also: Lock the ship if the picked ship is at the point.
 * */

function positionClosestShipAtPoint(orders, point) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  const freeships = (0,_find__WEBPACK_IMPORTED_MODULE_4__.ships_not_in)(myships, orders.moving);

  if (freeships.length < 1) {
    return 0;
  } else {
    const ship = (0,_find__WEBPACK_IMPORTED_MODULE_4__.ship_closest_to_point)(freeships, point);
    return positionShipAtPoint(orders, ship, point);
  }
}
/**
 * position this ship at point, return 0.5 always
 */

function positionShipAtPoint(orders, ship, point) {
  orders.targetps[ship.index] = point;
  orders.moving.push(ship.index);
  const isLocked = ship.locked; //const isAtPoint = isWithinDist(s2.position, point, Number.EPSILON) //too small

  const isAtCorrectPlace = (0,_vec__WEBPACK_IMPORTED_MODULE_7__.isWithinDist)(ship.position, point, 0.00001);

  if (!isAtCorrectPlace && isLocked) {
    ship.unlock();
  }

  if (!isAtCorrectPlace && !isLocked) {
    jumpTowardPointIfGood(orders, ship, point);
  }

  if (isAtCorrectPlace && !isLocked) {
    ship.lock();
  }

  return 0.5;
}
/**
 * return true if we decided to jump and called ship.jump()
 * "if good" refers to some conditions, which I havn't completely decided yet.
 *
 * experiment...
 */

function jumpTowardPointIfGood(orders, ship, point) {
  const {
    myships,
    enemyships
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  const energyMargin = ship.size * 2;
  const landingPoint = (0,_ability_jump__WEBPACK_IMPORTED_MODULE_0__.jumpPoint)(ship, point, energyMargin);
  /*
  if (!canJump(ship, point, energyMargin)) {
    //cant afford
    return false;
  }
  */

  if ((0,_vec__WEBPACK_IMPORTED_MODULE_7__.isWithinDist)(ship.position, landingPoint, 40)) {
    //could just walk (2 ticks)
    return false;
  }

  if ((0,_utils__WEBPACK_IMPORTED_MODULE_6__.anyStarIsWithinDist)(ship.position, 200)) {
    //never jump if already inside a star
    return false;
  }

  const relevantStars = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.starsWithinDist)(landingPoint, 200);

  if (relevantStars.length === 0) {
    //dont ever jump to a point that is not near a star
    return false;
  }

  if (relevantStars[0].energy < 400) {
    //dont deplete energy without quick way to get it back..
    return false;
  }

  const enemyShipsNearLandingpoint = enemyships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_7__.isWithinDist)(s.position, landingPoint, 220));
  const myShipsAlreadyAtLandingpoint = myships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_7__.isWithinDist)(s.position, landingPoint, 20));
  const myShipsAtLandingpointNextTick = myShipsAlreadyAtLandingpoint.concat([ship]); //remember energy

  const prevEnergy = ship.energy * 1; //modify energy before combateval

  const spentEnergy = (0,_ability_jump__WEBPACK_IMPORTED_MODULE_0__.jumpCost)(ship, landingPoint);
  ship.energy -= spentEnergy;
  const {
    myAdvantage
  } = (0,_combateval__WEBPACK_IMPORTED_MODULE_2__.default)(myShipsAtLandingpointNextTick, enemyShipsNearLandingpoint); //restore energy

  ship.energy = prevEnergy;

  if (myAdvantage > -1) {
    ship.jump(landingPoint);
    return true;
  }

  return false;
}
/** an appropriate point for defending base from a blocking enemy ship */

function interceptPoint(base, enemy) {
  const enemyDistFromBaseRadius = (0,_vec__WEBPACK_IMPORTED_MODULE_7__.dist)(base.position, enemy.position) - base.collision_radius;

  if (enemyDistFromBaseRadius > _constants__WEBPACK_IMPORTED_MODULE_3__.D) {
    return (0,_vec__WEBPACK_IMPORTED_MODULE_7__.offset)(enemy.position, base.position, _constants__WEBPACK_IMPORTED_MODULE_3__.D);
  } else {
    return (0,_vec__WEBPACK_IMPORTED_MODULE_7__.offset)(base.position, enemy.position, base.collision_radius + 1);
  }
}
/**
 * same as positionClosestShipAtPoint stay in circle with center c and radius r
 */

function positionClosestShipAtPoint_stayInCircle(orders, point, c, r) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  const freeships = (0,_find__WEBPACK_IMPORTED_MODULE_4__.ships_not_in)(myships, orders.moving);

  if (freeships.length < 1) {
    return 0;
  }

  const ship = (0,_find__WEBPACK_IMPORTED_MODULE_4__.ship_closest_to_point)(freeships, point);
  orders.targetps[ship.index] = (0,_positioning__WEBPACK_IMPORTED_MODULE_5__.stayinCircle)(ship.position, point, c, r);
  orders.moving.push(ship.index);
  const isLocked = ship.locked; //const isAtPoint = isWithinDist(s2.position, point, Number.EPSILON) //too small

  const isAtCorrectPlace = (0,_vec__WEBPACK_IMPORTED_MODULE_7__.isWithinDist)(ship.position, point, 0.00001);

  if (!isAtCorrectPlace && isLocked) {
    ship.unlock();
  }

  if (isAtCorrectPlace && !isLocked) {
    ship.lock();
  }

  return 0.5;
}

/***/ }),

/***/ "./src/pointsLong.ts":
/*!***************************!*\
  !*** ./src/pointsLong.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pointsLong": () => (/* binding */ pointsLong)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./collections */ "./src/collections.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vec */ "./src/vec.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");



const pointsLong = pointsOfInterest();


function pointsOfInterest() {
  const {
    bases,
    stars,
    outposts,
    pylons
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections; //home star and base

  const {
    farm: h1,
    front: h_def_front,
    side: h_def_side,
    back: h_def_back
  } = defpoints(bases.me, stars.me, stars.enemy.position); //enemy star and base

  const {
    farm: e1,
    front: e_def_front,
    side: e_def_side,
    back: e_def_back
  } = defpoints(bases.enemy, stars.enemy, stars.me.position); //mid star and base

  const {
    farm: m1,
    front: m_def_front,
    side: m_def_side,
    back: m_def_back
  } = defpoints_mid(bases.middle, stars.middle, stars.enemy.position); //big star

  const b1 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(stars.big.position, bases.me.position, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG);
  const b2 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(b1, bases.me.position, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG); //between point, put fragment here

  const b3 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(bases.me.position, stars.big.position, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG); //outpost

  const o1 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(stars.middle.position, outposts.middle.position, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG);
  /** 199 from big base */

  const a_b = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(bases.big.position, stars.big.position, 199); //outpost

  const a_p = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(pylons.middle.position, outposts.middle.position, 199);
  return {
    h1,
    h_def_front,
    h_def_side,
    h_def_back,
    e1,
    e_def_front,
    e_def_side,
    e_def_back,
    m1,
    m_def_front,
    m_def_side,
    m_def_back,
    b1,
    b2,
    b3,
    o1,
    a_b,
    a_p
  };
}
/**
 * 4 well spaces points around base such that a chain can go from
 * star -> h1 -> front -> side -> back
 *
 * AND
 *
 * if they are locked (range 300) covers the bases spawn block radius (400)
 */


function defpoints(base, star, fronttarget) {
  const BASE2DEF = 202;
  const farm = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(star.position, base.position, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG);
  const corner1 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPointFarthest)(base.position, 400, farm, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, fronttarget);
  const back = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPointFarthest)(corner1, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, base.position, BASE2DEF, fronttarget);
  const corner2 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPoint)(base.position, 400, back, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, fronttarget);
  const side = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPoint)(corner2, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, base.position, BASE2DEF, fronttarget);
  const corner3 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPoint)(base.position, 400, side, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, fronttarget);
  const front = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPoint)(corner3, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, base.position, BASE2DEF, fronttarget);
  return {
    farm,
    back,
    side,
    front
  };
}

function defpoints_mid(base, star, fronttarget) {
  const BASE2DEF = 202;
  const farm = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(star.position, base.position, 100);
  const corner1 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPointFarthest)(base.position, 400, farm, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, fronttarget);
  const back = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPointFarthest)(corner1, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, base.position, BASE2DEF, fronttarget);
  const corner2 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPointFarthest)(base.position, 400, back, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, fronttarget);
  const side = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPoint)(corner2, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, base.position, BASE2DEF, fronttarget);
  const corner3 = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPoint)(base.position, 400, side, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, fronttarget);
  const front = (0,_vec__WEBPACK_IMPORTED_MODULE_1__.intersectPoint)(corner3, _constants__WEBPACK_IMPORTED_MODULE_2__.D_LONG, base.position, BASE2DEF, fronttarget);
  return {
    farm,
    back,
    side,
    front
  };
}

/***/ }),

/***/ "./src/positioning.ts":
/*!****************************!*\
  !*** ./src/positioning.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "avoidEnemy": () => (/* binding */ avoidEnemy),
/* harmony export */   "avoidCircle": () => (/* binding */ avoidCircle),
/* harmony export */   "stayinCircle": () => (/* binding */ stayinCircle),
/* harmony export */   "staynearstructure": () => (/* binding */ staynearstructure),
/* harmony export */   "stayinTwoCircles": () => (/* binding */ stayinTwoCircles)
/* harmony export */ });
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec */ "./src/vec.ts");

/**
 * essentially avoidCircle() but call it with myShip and enemyShip instead.
 *
 * Will properly avoid locked ship (with increased range) aswell.
 */

function avoidEnemy(myShip, myShip_desired_p, enemyShip) {
  if (enemyShip.locked) {
    return avoidCircle(myShip.position, myShip_desired_p, enemyShip.position, Math.min(300, enemyShip.range + 25) //locked ones will grow next turn (instead of moving)
    );
  } else {
    return avoidCircle(myShip.position, myShip_desired_p, enemyShip.position, enemyShip.range + 20);
  }
}
/**
 * ```raw
 * Return a point the ship can move to that avoids the circle c with radius r
 * argument position is the current position
 *
 * 1. If moving will NOT put ship inside: just move
 * 2. IF INSIDE:
 *  2.1 if near edge: go diagonal (land on circumference) in the direction most similar to desired_p
 *  2.2 if further in: go straight outward from circle center
 * 3. IF OUTSIDE:
 *  3.1 (if step1 wasnt triggered) go along tangent direction most similar to desired_p
 *```
 */

function avoidCircle(position, desired_p, c, r) {
  const p_moved = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offsetmax20)(position, desired_p);

  if ((0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(c, p_moved) > r) {
    //moving wont put ship inside.. just move.
    return p_moved;
  }

  const dir_desired = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.unitvecFromPositions)(position, desired_p); //const dir_center = unitvecFromPositions(position, c);

  const tps = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.tangentPoints)(position, c, r);

  if (tps.length === 0) {
    //inside.
    if ((0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(c, position) > r - 20) {
      //Ship is pretty close to circumference, there exists 2 "diagonal" moves to get outside
      //choose the one most similar to dir_desired
      const [a, b] = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.intersectTwoCircles)(c, r, position, 20);
      const dir_diag0 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.unitvecFromPositions)(position, a);
      const dir_diag1 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.unitvecFromPositions)(position, b);
      const s0 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.directionSimilarity)(dir_diag0, dir_desired);
      const s1 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.directionSimilarity)(dir_diag1, dir_desired);
      const p_diag = s0 > s1 ? a : b;
      return p_diag;
    } else {
      //otherwise straight out
      return (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offset)(c, position, r);
    }
  } else {
    //outside, there exists 2 tangent points
    //choose the one most similar to dir_desired
    const dir_tangent0 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.unitvecFromPositions)(position, tps[0]);
    const dir_tangent1 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.unitvecFromPositions)(position, tps[1]);
    const s0 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.directionSimilarity)(dir_tangent0, dir_desired);
    const s1 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.directionSimilarity)(dir_tangent1, dir_desired);
    const p_tangent = s0 > s1 ? tps[0] : tps[1]; //const p_tangent_moved = offset(position, p_tangent, Math.min(20, dist(position, p_tangent)));

    const p_tangent_moved = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offset)(position, p_tangent, 20);
    return p_tangent_moved;
  }
}
/**
 * If outside, go inside
 * If inside go to the point inside closest to desired_p
 */

function stayinCircle(position, desired_p, c, r) {
  //the actual point Im going towards: the point closest desired_p BUT ALSO INSIDE
  const inside_p = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offset)(c, desired_p, Math.min(r, (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(c, desired_p)));
  const p_moved = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offsetmax20)(position, inside_p);

  if ((0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(c, p_moved) <= r) {
    //moving wont put ship outside.. just move.
    return p_moved;
  } else if ((0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(c, position) < r + 20) {
    //is outside but pretty close to circumference...
    const p = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offset)(c, position, r); //at border

    return p;
  } else {
    //is simply far outside, go toward center
    return (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offset)(position, c, 20);
  }
}
/**
 * stay within range of star but toward desired_p, but avoid its collision radius when moving towar the inside point
 */

function staynearstructure(position, desired_p, structure) {
  const D = 199.99999;
  const adjusted_p = stayinCircle(position, desired_p, structure.position, D);
  return avoidCircle(position, adjusted_p, structure.position, structure.collision_radius);
}
/**
 * ```raw
 * Try to stay in both circles, prioritize staying in c1.
 *
 * 1. Always stay inside c1
 * 2. If not possible to stay in both, stay in c1 but position toward c2
 * 3. If possible to stay in both, stay in both but position toward desired_p
 * ```
 */

function stayinTwoCircles(position, desired_p, c1, r1, c2, r2) {
  //const [a, b] = intersectTwoCircles(c1, r1, c2, r2);
  //const p_inside = dist(a, desired_p) < dist(b, desired_p) ? a : b;
  if ((0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(c1, c2) > r1 + r2) {
    //impossible, stay in c1, but toward c2
    return stayinCircle(position, c2, c1, r1);
  } else {
    //possible, go from betweenpoint toward desired_p but still inside both
    const between_p = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.mix)(c1, c2);
    const p1 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.nearestPointOfPoints)((0,_vec__WEBPACK_IMPORTED_MODULE_0__.intersectLineCircle)(between_p, desired_p, c1, r1), desired_p);
    const p2 = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.nearestPointOfPoints)((0,_vec__WEBPACK_IMPORTED_MODULE_0__.intersectLineCircle)(between_p, desired_p, c2, r2), desired_p);
    const p = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(position, p1) < (0,_vec__WEBPACK_IMPORTED_MODULE_0__.dist)(position, p2) ? p1 : p2;
    const p_moved = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.offsetmax20)(position, p);
    return p_moved;
  }
}

/***/ }),

/***/ "./src/sendcommands.ts":
/*!*****************************!*\
  !*** ./src/sendcommands.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sendcommands)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./collections */ "./src/collections.ts");

function sendcommands(targetps, targets) {
  const {
    myships
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;

  for (const [i, ship] of myships.entries()) {
    targetps[i] && ship.move(targetps[i]); //maybe jump if targetps is out of range?

    targets[i] && ship.energize(targets[i]);
  }
}

/***/ }),

/***/ "./src/sendendgamecommands.ts":
/*!************************************!*\
  !*** ./src/sendendgamecommands.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sendendgamecommands)
/* harmony export */ });
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./collections */ "./src/collections.ts");
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vec */ "./src/vec.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");



function sendendgamecommands() {
  const {
    myships,
    enemyships,
    bases,
    stars,
    playerids,
    outposts,
    pylons
  } = _collections__WEBPACK_IMPORTED_MODULE_0__.collections;

  if (enemyships.length === 0 || myships.length === 0) {
    for (const ship of myships) {
      if (ship.energy > 0) {
        for (const base of [bases.me, bases.middle, bases.enemy, bases.big, outposts.middle]) {
          if (base.control === playerids.enemy) {
            ship.move(base.position);
            ship.energize(base);
          } else {
            continue;
          }
        }
      } else {
        ship.move((0,_vec__WEBPACK_IMPORTED_MODULE_1__.offset)(stars.middle.position, outposts.middle.position, _constants__WEBPACK_IMPORTED_MODULE_2__.D));
        ship.energize(ship);
      }
    }

    return true;
  } else {
    return false;
  }
}

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "myOutpostEnergy": () => (/* binding */ myOutpostEnergy),
/* harmony export */   "enemyOutpostEnergy": () => (/* binding */ enemyOutpostEnergy),
/* harmony export */   "isFull": () => (/* binding */ isFull),
/* harmony export */   "almostFull": () => (/* binding */ almostFull),
/* harmony export */   "almostEmpty": () => (/* binding */ almostEmpty),
/* harmony export */   "canTransfer": () => (/* binding */ canTransfer),
/* harmony export */   "hasRoomLess": () => (/* binding */ hasRoomLess),
/* harmony export */   "hasRoom": () => (/* binding */ hasRoom),
/* harmony export */   "notEmpty": () => (/* binding */ notEmpty),
/* harmony export */   "notFull": () => (/* binding */ notFull),
/* harmony export */   "isEmpty": () => (/* binding */ isEmpty),
/* harmony export */   "maxStarSelfers": () => (/* binding */ maxStarSelfers),
/* harmony export */   "sustainableStarSelfers": () => (/* binding */ sustainableStarSelfers),
/* harmony export */   "sustainableStarSelfingAmount": () => (/* binding */ sustainableStarSelfingAmount),
/* harmony export */   "maxStarSelfingAmount": () => (/* binding */ maxStarSelfingAmount),
/* harmony export */   "outpostdmg": () => (/* binding */ outpostdmg),
/* harmony export */   "outpostlossFromAttacking": () => (/* binding */ outpostlossFromAttacking),
/* harmony export */   "attackdmg": () => (/* binding */ attackdmg),
/* harmony export */   "lossFromAttacking": () => (/* binding */ lossFromAttacking),
/* harmony export */   "gainFromSelfing": () => (/* binding */ gainFromSelfing),
/* harmony export */   "transferamount": () => (/* binding */ transferamount),
/* harmony export */   "weightedmeanposition": () => (/* binding */ weightedmeanposition),
/* harmony export */   "meanposition": () => (/* binding */ meanposition),
/* harmony export */   "distanceWeightedMeanPosition": () => (/* binding */ distanceWeightedMeanPosition),
/* harmony export */   "anyShipIsWithinDist": () => (/* binding */ anyShipIsWithinDist),
/* harmony export */   "canReachAnyStar": () => (/* binding */ canReachAnyStar),
/* harmony export */   "anyStarIsWithinDist": () => (/* binding */ anyStarIsWithinDist),
/* harmony export */   "starsWithinDist": () => (/* binding */ starsWithinDist),
/* harmony export */   "enemyShipCost": () => (/* binding */ enemyShipCost),
/* harmony export */   "myShipCost": () => (/* binding */ myShipCost),
/* harmony export */   "isNearStar": () => (/* binding */ isNearStar),
/* harmony export */   "notNearStar": () => (/* binding */ notNearStar),
/* harmony export */   "controlIsMe": () => (/* binding */ controlIsMe),
/* harmony export */   "controlIsEnemy": () => (/* binding */ controlIsEnemy),
/* harmony export */   "controlIsNeutral": () => (/* binding */ controlIsNeutral),
/* harmony export */   "canEnergize": () => (/* binding */ canEnergize)
/* harmony export */ });
/* harmony import */ var _vec__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vec */ "./src/vec.ts");
/* harmony import */ var _collections__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collections */ "./src/collections.ts");


/**
 * Return 0 If I dont have outpost, else return the outpost energy
 */

function myOutpostEnergy() {
  const {
    outposts,
    info
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  return info.outpostcontrolIsMe ? outposts.middle.energy : 0;
}
/**
 * Return 0 If ENEMY dont have outpost, else return the outpost energy
 */

function enemyOutpostEnergy() {
  const {
    outposts,
    info
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  return info.outpostcontrolIsEnemy ? outposts.middle.energy : 0;
}
/**
 * s.energy === s.energy_capacity
 */

function isFull(s) {
  return s.energy === s.energy_capacity;
}
/**
 * s.energy >= s.energy_capacity - s.size * n
 */

function almostFull(s, n = 1) {
  return s.energy >= s.energy_capacity - s.size * n;
}
/**
 * s.energy <= s.size * n
 */

function almostEmpty(s, n = 1) {
  return s.energy <= s.size * n;
}
/**
 * ```raw
 * True if ship has energy to (fully) transfer n times. default n=1
 *
 * ship.energy >= ship.size * n
 * ```
 */

function canTransfer(ship, n = 1) {
  return ship.energy >= ship.size * n;
}
/**
 * ```raw
 * Has room for n heals and still not be completely full, default n=1
 *
 * ship.energy < ship.energy_capacity - ship.size * n;
 * ```
 */

function hasRoomLess(ship, n = 1) {
  return ship.energy < ship.energy_capacity - ship.size * n;
}
/**
 * ```raw
 * Has room for n heals, default n=1
 *
 * ship.energy <= ship.energy_capacity - ship.size * n;
 * ```
 */

function hasRoom(ship, n = 1) {
  return ship.energy <= ship.energy_capacity - ship.size * n;
}
/**
 * ship.energy > 0
 */

function notEmpty(ship) {
  return ship.energy > 0;
}
/**
 * ship.energy < ship.energy_capacity
 */

function notFull(ship) {
  return ship.energy < ship.energy_capacity;
}
/**
 * ship.energy === 0
 */

function isEmpty(ship) {
  return ship.energy === 0;
}

function star_gain(star) {
  if (star.energy_capacity == 3000) {
    return 3 + 0.03 * star.energy;
  } else {
    return 2 + 0.02 * star.energy;
  }
}

function star_gain_max(star) {
  if (star.energy_capacity == 3000) {
    return 3 + 0.03 * star.energy_capacity;
  } else {
    return 2 + 0.02 * star.energy_capacity;
  }
}
/**
 * ```raw
 * The maximum number of farmers (farming each tick) possible at star max energy. ignoring sustainable.
 * ```
 */


function maxStarSelfers(star, shipsize) {
  return Math.floor(star_gain_max(star) / shipsize);
}
/**
 * The maximum number of farmers (farming each tick) to still have star grow by atleast 1 each tick.
 */

function sustainableStarSelfers(star, shipsize) {
  if (star.energy === star.energy_capacity) {
    return Math.floor(star_gain(star) / shipsize);
  } else {
    return Math.floor((star_gain(star) - 1) / shipsize);
  }
}
/**
 * The amount of energy that ships can take from star and still have it grow.
 */

function sustainableStarSelfingAmount(star) {
  if (star.energy === star.energy_capacity) {
    return star_gain(star);
  } else {
    return star_gain(star) - 1;
  }
}
/**
 * simply `star.energy`
 */

function maxStarSelfingAmount(star) {
  return star.energy;
}
function outpostdmg(outpost) {
  return outpost.energy < 500 ? Math.min(2, outpost.energy) : Math.min(8, outpost.energy);
}
function outpostlossFromAttacking(outpost) {
  return outpost.energy < 500 ? Math.min(1, outpost.energy) : Math.min(4, outpost.energy);
}
/**
 * ```raw
 * How much damage a ship does to another ship.
 *
 * 2 * Math.min(ship.size, ship.energy)
 * ```
 */

function attackdmg(ship) {
  //2*ship.size, but only as much energy as it has.
  return 2 * Math.min(ship.size, ship.energy);
}
/**
 * ```raw
 * How much energy a ship loses (by energizing)
 *
 * Math.min(ship.size, ship.energy);
 * ```
 */

function lossFromAttacking(ship) {
  //ship.size, but only as much energy as it has.
  return Math.min(ship.size, ship.energy);
}
/**
 * essentially ship.size, except when its almost full in which case its less.
 *
 */

function gainFromSelfing(ship) {
  //ship.size, but only as much energy as it has.
  return Math.min(ship.size, ship.energy_capacity - ship.energy);
}
/**
 * ```raw
 * How much energy a ship transfers (by energizing)
 *
 * note: actually same as lossFromAttacking() but use this for clarity when appropriate.
 *
 * Math.min(ship.size, ship.energy);
 * ```
 */

function transferamount(ship) {
  return Math.min(ship.size, ship.energy);
}
/**
 * Average position of ships, but weighted toward ships with more energy.
 * Also add 1 to each ship to avoid potential zero division.
 */

function weightedmeanposition(ships) {
  const x = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.sum)(ships.map(s => (s.energy + 1) * s.position[0]));
  const y = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.sum)(ships.map(s => (s.energy + 1) * s.position[1]));
  const energysum = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.sum)(ships.map(s => s.energy + 1));
  return [x / energysum, y / energysum];
}
/**
 * Average position of ships.
 */

function meanposition(ships) {
  const x = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.sum)(ships.map(s => s.position[0]));
  const y = (0,_vec__WEBPACK_IMPORTED_MODULE_0__.sum)(ships.map(s => s.position[1]));
  return [x / ships.length, y / ships.length];
}
function distanceWeightedMeanPosition(ships) {
  const points = ships.map(s => s.position);
  return (0,_vec__WEBPACK_IMPORTED_MODULE_0__.distanceWeightedMean)(points);
}
/**
 * True if any in ships isWithinDist d, default d=200
 */

function anyShipIsWithinDist(ships, p, d = 200) {
  return ships.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(s.position, p, d)).length > 0;
}
/**
 * true if ship can reach any star.
 *
 * assuming range 300 if locked (even if not fully at 300 yet)
 * and 200 if not locked
 */

function canReachAnyStar(ship) {
  return ship.locked ? anyStarIsWithinDist(ship.position, 300) : anyStarIsWithinDist(ship.position, 200);
}
/**
 * true if any star is within r of point
 */

function anyStarIsWithinDist(point, r) {
  return starsWithinDist(point, r).length > 0;
}
function starsWithinDist(point, r) {
  const {
    stars
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  const structures = [stars.big, stars.enemy, stars.me, stars.middle];
  return structures.filter(s => (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(point, s.position, r));
}
/**
 * ```raw
 * What a ship would cost to replace for enemy.
 *
 * note: the cost of the ship itself is NOT simply current_spirit_cost becuase the ship starts with some energy.
 * Examples:
 * 1. squares in early game cost 360 but get 100 so the ship itself only costs 260.
 * 2. triangles in early game cost 90 but get 30 so the ship itself only costs 60.
 * 3. circles in early game cost 25 but get 10 so the ship itself only costs 15.
 *
 * ```
 */

function enemyShipCost() {
  const {
    bases,
    shapes
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  let cost = bases.enemy.current_spirit_cost;

  if (shapes.enemy === "squares") {
    cost -= 100;
  } else if (shapes.enemy === "circles") {
    cost -= 10;
  } else if (shapes.enemy === "triangles") {
    cost -= 30;
  }

  return cost;
}
/**
 * ```raw
 * What a ship would cost to replace for me.
 *
 * note: the cost of the ship itself is NOT simply current_spirit_cost becuase the ship starts with some energy.
 * For example squares in early game cost 360 but get 100 so the ship itself only cost 260.
 * ```
 */

function myShipCost() {
  const {
    bases,
    shapes
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  let cost = bases.me.current_spirit_cost;

  if (shapes.me === "squares") {
    cost -= 100;
  } else if (shapes.me === "circles") {
    cost -= 10;
  } else if (shapes.me === "triangles") {
    cost -= 30;
  }

  return cost;
}
function isNearStar(s) {
  const {
    stars
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  return (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(s.position, stars.me.position) || (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(s.position, stars.middle.position) || (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(s.position, stars.enemy.position);
}
function notNearStar(s) {
  return !isNearStar(s);
}
function controlIsMe(controlId) {
  const {
    playerids
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  return controlId === playerids.me;
}
function controlIsEnemy(controlId) {
  const {
    playerids
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  return controlId === playerids.enemy;
}
function controlIsNeutral(controlId) {
  const {
    playerids
  } = _collections__WEBPACK_IMPORTED_MODULE_1__.collections;
  return controlId !== playerids.enemy && controlId != playerids.me;
}
/**
 * check if ship can reach target
 *
 * `isWithinDist(ship.position, target.position, ship.range)` but allows target to be a Vec2 aswell.
 */

function canEnergize(ship, target) {
  const shipRange = ship.range;

  if (Array.isArray(target)) {
    //is just a Vec2 (without position property)
    return (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, target, shipRange);
  } else {
    return (0,_vec__WEBPACK_IMPORTED_MODULE_0__.isWithinDist)(ship.position, target.position, shipRange);
  }
}

/***/ }),

/***/ "./src/vec.ts":
/*!********************!*\
  !*** ./src/vec.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add": () => (/* binding */ add),
/* harmony export */   "mul": () => (/* binding */ mul),
/* harmony export */   "div": () => (/* binding */ div),
/* harmony export */   "len": () => (/* binding */ len),
/* harmony export */   "sum": () => (/* binding */ sum),
/* harmony export */   "dot": () => (/* binding */ dot),
/* harmony export */   "normalize": () => (/* binding */ normalize),
/* harmony export */   "minimum": () => (/* binding */ minimum),
/* harmony export */   "maximum": () => (/* binding */ maximum),
/* harmony export */   "offsetmax20": () => (/* binding */ offsetmax20),
/* harmony export */   "unique": () => (/* binding */ unique),
/* harmony export */   "vecFromPositions": () => (/* binding */ vecFromPositions),
/* harmony export */   "unitvecFromPositions": () => (/* binding */ unitvecFromPositions),
/* harmony export */   "dist": () => (/* binding */ dist),
/* harmony export */   "isWithinDist": () => (/* binding */ isWithinDist),
/* harmony export */   "directionSimilarity": () => (/* binding */ directionSimilarity),
/* harmony export */   "clamp": () => (/* binding */ clamp),
/* harmony export */   "mix": () => (/* binding */ mix),
/* harmony export */   "offset": () => (/* binding */ offset),
/* harmony export */   "tangentPoints": () => (/* binding */ tangentPoints),
/* harmony export */   "mostSimilarVec": () => (/* binding */ mostSimilarVec),
/* harmony export */   "intersectTwoCircles": () => (/* binding */ intersectTwoCircles),
/* harmony export */   "intersectPoint": () => (/* binding */ intersectPoint),
/* harmony export */   "intersectPointFarthest": () => (/* binding */ intersectPointFarthest),
/* harmony export */   "perpendicularCW": () => (/* binding */ perpendicularCW),
/* harmony export */   "perpendicularCCW": () => (/* binding */ perpendicularCCW),
/* harmony export */   "falses": () => (/* binding */ falses),
/* harmony export */   "trues": () => (/* binding */ trues),
/* harmony export */   "all": () => (/* binding */ all),
/* harmony export */   "any": () => (/* binding */ any),
/* harmony export */   "none": () => (/* binding */ none),
/* harmony export */   "newVec": () => (/* binding */ newVec),
/* harmony export */   "indexVec": () => (/* binding */ indexVec),
/* harmony export */   "popfirst": () => (/* binding */ popfirst),
/* harmony export */   "pushfirst": () => (/* binding */ pushfirst),
/* harmony export */   "circleFrom3points": () => (/* binding */ circleFrom3points),
/* harmony export */   "distanceWeightedMean": () => (/* binding */ distanceWeightedMean),
/* harmony export */   "weightedmean": () => (/* binding */ weightedmean),
/* harmony export */   "nearestPointOfPoints": () => (/* binding */ nearestPointOfPoints),
/* harmony export */   "farthestPointOfPoints": () => (/* binding */ farthestPointOfPoints),
/* harmony export */   "intersectLineCircle": () => (/* binding */ intersectLineCircle),
/* harmony export */   "sortAscending": () => (/* binding */ sortAscending),
/* harmony export */   "sortDescending": () => (/* binding */ sortDescending)
/* harmony export */ });
/** [v1[0] + v2[0], v1[1] + v2[1]] */
function add(v1, v2) {
  return [v1[0] + v2[0], v1[1] + v2[1]];
}
/** [v[0] * k, v[1] * k] */

function mul(v, k) {
  return [v[0] * k, v[1] * k];
}
/** [v[0] / k, v[1] / k]*/

function div(v, k) {
  return [v[0] / k, v[1] / k];
}
/** Length of a Vec2 */

function len(v) {
  return Math.hypot(v[0], v[1]);
}
/** Sum values of v */

function sum(v) {
  let sum = 0;

  for (const x of v) {
    sum += x;
  }

  return sum;
}
function dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1];
}
function normalize(v) {
  const l = len(v);
  return [v[0] / l, v[1] / l];
}
/**
 * Return the minimum value and its index in vector vec
 * (return value: Infinity if vec=[])
 */

function minimum(vec) {
  let index = -1;
  let value = Infinity;

  for (const [i, v] of vec.entries()) {
    if (v < value) {
      value = v;
      index = i;
    }
  }

  return {
    value,
    index
  };
}
/**
 * Return the maximum value and its index in vector vec
 * * (return value: -Infinity if vec=[])
 */

function maximum(vec) {
  let index = -1;
  let value = -Infinity;

  for (const [i, v] of vec.entries()) {
    if (v > value) {
      value = v;
      index = i;
    }
  }

  return {
    value,
    index
  };
}
/**
 * offset p1 a maximum of 20 units toward p2 (stop at p2)
 */

function offsetmax20(p1, p2) {
  const d = Math.min(20, dist(p1, p2));
  return offset(p1, p2, d);
}
/**
 * Return a vector without duplicate values.
 */

function unique(v) {
  return [...new Set(v)];
}
/**
 * Return a vector that points from p1 to p2.
 */

function vecFromPositions(p1, p2) {
  return [p2[0] - p1[0], p2[1] - p1[1]];
}
/**
 * Return a unitvector that points from p1 to p2.
 */

function unitvecFromPositions(p1, p2) {
  return normalize(vecFromPositions(p1, p2));
}
function dist(p1, p2) {
  const v = vecFromPositions(p1, p2);
  return len(v);
}
/**
 * ```raw
 * True if distance between p1 and p2 is leq than d.
 *
 * default d=200 which is ship range
 * ```
 */

function isWithinDist(p1, p2, d = 200) {
  return dist(p1, p2) <= d;
}
/**
 * normalization followed by dot product gives a measure of direction similarity -1..1 zero means perpendicular
 */

function directionSimilarity(v1, v2) {
  return dot(normalize(v1), normalize(v2));
}
/**
 * clamp x to lie in a..b range
 */

function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

function clamp01(x) {
  return clamp(x, 0, 1);
}
/**
 * ```raw
 * Return a point that lies fraction t from p1 toward p2, default t=0.5
 * ```
 */


function mix(p1, p2, t = 0.5) {
  const v = vecFromPositions(p1, p2);
  const v_scaled = mul(v, clamp01(t)); //might not want to clamp t?

  const p = add(p1, v_scaled);
  return p;
}
/**
 * ```raw
 * Return a point that lies distance d away from p1, in the direction of p2.
 * note: d can be negative
 * ```
 */

function offset(p1, p2, d) {
  if (Math.abs(d) < 0.000000001) {
    return p1;
  }

  if (dist(p1, p2) < 0.00000001) {
    return p2;
  }

  const unitvec = unitvecFromPositions(p1, p2);
  const v = mul(unitvec, d);
  const p = add(p1, v);
  return p;
}
/**
 *```raw
 * The points where a line from p1 would tangent a circle at center p2 with radius r
 *
 * Returns 2 points as list [p1, p2] or
 * returns empty list [] if no tangentpoint exist. (it means p is inside the circle)
 * ```
 */

function tangentPoints(p, c, r) {
  //https://math.stackexchange.com/questions/543496/how-to-find-the-equation-of-a-line-tangent-to-a-circle-that-passes-through-a-g
  //r is radius of circle with center c
  const Cx = c[0];
  const Cy = c[1];
  const Px = p[0];
  const Py = p[1];
  const dx = Px - Cx;
  const dy = Py - Cy;
  const dxr = -dy;
  const dyr = dx;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d < r) {
    return []; //no tangentpoints (p is inside circle c)
  }

  const rho = r / d;
  const ad = rho * rho;
  const bd = rho * Math.sqrt(1 - rho * rho);
  const T1x = Cx + ad * dx + bd * dxr;
  const T1y = Cy + ad * dy + bd * dyr;
  const T2x = Cx + ad * dx - bd * dxr;
  const T2y = Cy + ad * dy - bd * dyr; //tangentpoints

  const tp1 = [T1x, T1y];
  const tp2 = [T2x, T2y];
  return [tp1, tp2];
}
/**
 * Return either vector v1 or v2
 *
 * whichever points in the direction most similar to the direciton of vector v
 */

function mostSimilarVec(v1, v2, v) {
  const s1 = directionSimilarity(v, v1);
  const s2 = directionSimilarity(v, v2);
  const v_mostsimilar = s1 > s2 ? v1 : v2;
  return v_mostsimilar;
}
/**
 * ```raw
 * Where a circle at p1 with radius r1 intersects a circle at p2 with radius r2.
 *
 * Returns 2 points as list [p1, p2] or
 * returns empty list [] if no intersection exist.
 * ```
 */

function intersectTwoCircles(p1, r1, p2, r2) {
  //https://gist.github.com/jupdike/bfe5eb23d1c395d8a0a1a4ddd94882ac
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];
  const centerdx = x1 - x2;
  const centerdy = y1 - y2;
  const R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);

  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) {
    return []; // no intersections
  } // intersection(s) should exist


  const R2 = R * R;
  const R4 = R2 * R2;
  const a = (r1 * r1 - r2 * r2) / (2 * R2);
  const r2r2 = r1 * r1 - r2 * r2;
  const c = Math.sqrt(2 * (r1 * r1 + r2 * r2) / R2 - r2r2 * r2r2 / R4 - 1);
  const fx = (x1 + x2) / 2 + a * (x2 - x1);
  const gx = c * (y2 - y1) / 2;
  const ix1 = fx + gx;
  const ix2 = fx - gx;
  const fy = (y1 + y2) / 2 + a * (y2 - y1);
  const gy = c * (x1 - x2) / 2;
  const iy1 = fy + gy;
  const iy2 = fy - gy; // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
  // but that one solution will just be duplicated as the code is currently written

  return [[ix1, iy1], [ix2, iy2]];
}
/**
 * intersectTwoCircles but pick the point (of the two points) nearest to targetpoint
 */

function intersectPoint(p1, r1, p2, r2, targetpoint) {
  const ps = intersectTwoCircles(p1, r1, p2, r2);
  return nearestPointOfPoints(ps, targetpoint);
}
/**
 * intersectTwoCircles but pick the point (of the two points) farthest away from targetpoint
 */

function intersectPointFarthest(p1, r1, p2, r2, targetpoint) {
  const ps = intersectTwoCircles(p1, r1, p2, r2);
  return farthestPointOfPoints(ps, targetpoint);
}
/**
 * perpendicular Clockwise
 */

function perpendicularCW(v) {
  return [v[1], -v[0]];
}
/**
 * perpendicular Counter Clockwise
 */

function perpendicularCCW(v) {
  return [-v[1], v[0]];
}
/**
 * Return a boolean vector filled with false
 */

function falses(n) {
  return new Array(n).fill(false);
}
/**
 * Return a boolean vector filled with true
 */

function trues(n) {
  return new Array(n).fill(true);
}
/**
 * Return true if all elements in v are true
 */

function all(v) {
  return v.every(x => x === true);
}
/**
 * Return true if any element in v is true
 */

function any(v) {
  return v.some(x => x === true);
}
/**
 * Return true if all elements in v are false
 */

function none(v) {
  return !any(v);
}
/**
 * Return a new vector of length n, filled with x (default x=0)
 */

function newVec(n, x = 0) {
  return new Array(n).fill(x);
}
/**
 * Returns a new vector [0,1,2,...,n-1]
 * starting from x default 0
 */

function indexVec(n, x = 0) {
  const v = new Array(n).fill(0);
  return v.map((v, i) => i + x);
}
/**
 * modifies v.
 *
 * Remove first item from and return it.
 * (v.pop() removes last item and returns it)
 */

function popfirst(v) {
  const x = v.shift();

  if (x === undefined) {
    return -1; //make typescript happy
  } else {
    return x;
  }
}
/**
 * modifies v.
 *
 * Put x at the begining of v and return v
 *  * (v.push(x) puts x at end)
 */

function pushfirst(v, x) {
  //const len = v.unshift(x);
  v.unshift(x);
  return v;
}
/**
 * Construct a circle from 3 points on its circumference.
 *
 * Return [centerpoint, radius]
 */

function circleFrom3points(p1, p2, p3) {
  //https://math.stackexchange.com/questions/213658/get-the-equation-of-a-circle-when-given-3-points
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];
  const x3 = p3[0];
  const y3 = p3[1];
  const A = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
  const B = (x1 * x1 + y1 * y1) * (y3 - y2) + (x2 * x2 + y2 * y2) * (y1 - y3) + (x3 * x3 + y3 * y3) * (y2 - y1);
  const C = (x1 * x1 + y1 * y1) * (x2 - x3) + (x2 * x2 + y2 * y2) * (x3 - x1) + (x3 * x3 + y3 * y3) * (x1 - x2);
  const D = (x1 * x1 + y1 * y1) * (x3 * y2 - x2 * y3) + (x2 * x2 + y2 * y2) * (x1 * y3 - x3 * y1) + (x3 * x3 + y3 * y3) * (x2 * y1 - x1 * y2);
  const center = [-B / (2 * A), -C / (2 * A)];
  const radius = Math.sqrt((B * B + C * C - 4 * A * D) / (4 * A * A));
  return [center, radius];
}
/**
 * ```raw
 * Weighted mean, where weighting coefficient for each data point is
 * the inverse sum of distances between this data point and the other data points
 * ```
 */

function distanceWeightedMean(points) {
  //https://encyclopediaofmath.org/wiki/Distance-weighted_mean
  if (points.length === 1) {
    return points[0];
  } //const k = points.length;


  const k = 1;
  const w = [];

  for (const point of points) {
    const sumdistances = sum(points.map(p => dist(p, point)));
    w.push(k / sumdistances);
  }

  const sumw = sum(w);
  const wx = sum(points.map((p, i) => w[i] * p[0]));
  const wy = sum(points.map((p, i) => w[i] * p[1]));
  const x = wx / sumw;
  const y = wy / sumw; //if all points are the same (or there is only a single point) this produces [NaN,NaN]

  if (isNaN(x) || isNaN(y)) {
    return points[0];
  } else {
    return [x, y];
  }
}
function weightedmean(points, weights) {
  const x = sum(points.map((p, i) => weights[i] * p[0]));
  const y = sum(points.map((p, i) => weights[i] * p[1]));
  const weightsum = sum(weights);
  return [x / weightsum, y / weightsum];
}
/**
 * Return the point in the vector ps=[p1,p2,p2] that is closest to target point targetpoint
 */

function nearestPointOfPoints(ps, targetpoint) {
  const d = ps.map(p => dist(p, targetpoint));
  const i = minimum(d).index;
  return ps[i];
}
/**
 * Return the point in the vector ps=[p1,p2,p2] that is farthest away from point targetpoint
 */

function farthestPointOfPoints(ps, targetpoint) {
  const d = ps.map(p => dist(p, targetpoint));
  const i = maximum(d).index;
  return ps[i];
}
/**
 * A*x^2 + B*x + C = 0
 * return [x1,x2]
 */

function quadraticroots(A, B, C) {
  const r = Math.sqrt(B * B - 4 * A * C);
  const x1 = (-B + r) / (2 * A);
  const x2 = (-B - r) / (2 * A);
  return [x1, x2];
}
/**
 * ```raw
 * return two points [a, b] where (infinite) line created by p1->p2 intersects circle with center center and radius r.
 *
 * note: return empty list [] if no intersection exist.
 * ```
 */


function intersectLineCircle(p1, p2, center, r) {
  //https://math.stackexchange.com/questions/228841/how-do-i-calculate-the-intersections-of-a-straight-line-and-a-circle
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];
  const p = center[0];
  const q = center[1];

  if (x1 === x2) {
    //vertical line
    const k = x1;
    const A = 1;
    const B = -2 * q;
    const C = p * p + q * q - r * r - 2 * k * p + k * k;

    if (B * B - 4 * A * C < 0) {
      //no intersection
      return [];
    }

    const [y_1, y_2] = quadraticroots(A, B, C);
    return [[k, y_1], [k, y_2]];
  }

  const m = (y2 - y1) / (x2 - x1);
  const c = y1 - m * x1;
  const A = m * m + 1;
  const B = 2 * (m * c - m * q - p);
  const C = q * q - r * r + p * p - 2 * c * q + c * c;

  if (B * B - 4 * A * C < 0) {
    //no intersection
    return [];
  }

  const [x_1, x_2] = quadraticroots(A, B, C); //y = m*x + c

  const y_1 = m * x_1 + c;
  const y_2 = m * x_2 + c;
  return [[x_1, y_1], [x_2, y_2]];
}
/**
 * smallest first
 */

function sortAscending(v) {
  return v.slice().sort((a, b) => a - b);
}
/**
 * biggest first
 */

function sortDescending(v) {
  return v.slice().sort((a, b) => b - a);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _move_move__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./move/move */ "./src/move/move.ts");
/* harmony import */ var _energize_energize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./energize/energize */ "./src/energize/energize.ts");
/* harmony import */ var _sendcommands__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sendcommands */ "./src/sendcommands.ts");
/* harmony import */ var _sendendgamecommands__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sendendgamecommands */ "./src/sendendgamecommands.ts");





function main() {
  memory.Npathcalls = 0;
  memory.movingToHealIds = memory.movingToHealIds ? memory.movingToHealIds : [];
  const orders = {
    targets: [],
    targetps: [],
    moving: [],
    farmPositioned: [],
    defPositioned: [],
    attackPositioned: [],
    avoiding: []
  };
  (0,_move_move__WEBPACK_IMPORTED_MODULE_0__.default)(orders);
  (0,_energize_energize__WEBPACK_IMPORTED_MODULE_1__.default)(orders);
  (0,_sendcommands__WEBPACK_IMPORTED_MODULE_2__.default)(orders.targetps, orders.targets); //console.log(`tick ${tick}, Npathcalls: ${memory.Npathcalls}`);
} //console.log(Object.keys(globalThis));


(0,_sendendgamecommands__WEBPACK_IMPORTED_MODULE_3__.default)() || main();
})();

/******/ })()
;