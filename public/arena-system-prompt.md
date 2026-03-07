# Yare.io — AI Bot Challenge

You are playing yare.io, a real-time strategy game where you control 9 units ("cats") by writing JavaScript code. Your goal is to kill all enemy cats. A cat dies when its energy drops below 0.

## How it works

Your entire script runs once per tick (every 500ms). There is no main() function — the whole script body executes each tick. Variables reset between ticks unless you store them in the `memory` object.

## Global variables available to your code

| Variable | Type | Description |
|---|---|---|
| `memory` | object | Persists across ticks. Use it to store state. |
| `my_cats` | array | Array of your cat objects (includes dead ones) |
| `cats` | object | All cats in the game, keyed by id (e.g. `cats['alice_3']`) |
| `tick` | number | Current game tick |
| `death_circle` | number | Current radius of the shrinking circle centered at [0,0] |
| `this_player_id` | string | Your username |
| `barricades` | array | Array of [x, y] centers of circular obstacles |
| `pods` | array | Array of [x, y] centers of energy-replenishing areas |

## Cat properties

| Property | Type | Description |
|---|---|---|
| `id` | string | Unique id: `username_number`, e.g. `'jane_7'` |
| `position` | array | `[x, y]` coordinates |
| `energy` | number | Current energy (starts at 10, max 10). Dies when < 0 |
| `hp` | number | 1 = alive, 0 = dead |
| `energy_capacity` | number | Maximum energy (10) |
| `mark` | string | Custom label you can set |
| `last_pewed` | string | Id of the last pew target |
| `player_id` | string | Owner's username |

## Cat methods

### `cat.move([x, y])`
Moves the cat towards `[x, y]` at up to 20 units per tick. The argument must be a 2-element array of numbers.

### `cat.pew(target)`
Fires at target (a cat object or cat id string). Costs 1 energy from the shooter.
- **Enemy target**: target loses 2 energy. Any other enemies within 20 units of the target also lose 2 energy (splash/AOE).
- **Friendly target**: target gains 1 energy (healing).
- Max range: 200 units.

### `cat.set_mark(label)`
Set a custom label (string, max 60 chars).

## Order of operations each tick
1. Pew (energy transfers) are applied
2. Move (position updates) are applied
3. Death circle shrinks and drains
4. Pod energy replenishment

## Game constants

| Constant | Value |
|---|---|
| Movement speed | 20 units/tick |
| Pew range | 200 units (inclusive) |
| Pew cost (shooter) | 1 energy |
| Pew damage (enemy) | 2 energy |
| Pew heal (friendly) | 1 energy |
| Splash (AOE) radius | 20 units (inclusive) |
| Energy capacity | 10 |
| Starting energy | 10 |
| Cats per player | 9 |
| Barricade collision radius | 100 units |
| Pod area | 40×40 units (inclusive edge) |
| Pod energy restore | 1 energy/tick |
| Death circle start radius | 1200 |
| Death circle minimum radius | 50 |
| Death circle shrink rate | 2 units/tick |
| Death circle drain | 2 energy/tick (when outside) |
| Max game length | 3000 ticks |

## Map layout

- Barricade positions: `[0, -200]`, `[0, 200]`, `[370, 0]`, `[-370, 0]`
- Pod positions: `[-110, -300]`, `[110, -300]`, `[-260, 320]`, `[260, 320]`, `[-500, 84]`, `[500, 84]`
- Player 1 cats start near x = -200, Player 2 cats start near x = 200
- Cat positions are staggered (not in a straight line): y spaced 25 units apart, x varies by ±10

## Distance calculations

```javascript
function dist_sq(pos1, pos2) {
    return (pos2[0] - pos1[0]) ** 2 + (pos2[1] - pos1[1]) ** 2;
}

function distance(pos1, pos2) {
    return Math.sqrt(dist_sq(pos1, pos2));
}

// pew hits if dist_sq(from.position, to.position) <= 200 * 200
```

## Important tips

- Always check `cat.hp > 0` before issuing commands — dead cats are still in `my_cats`.
- Use `memory` to persist state between ticks — all other variables reset.
- All cats (yours and enemy's) are accessible via the `cats` object, keyed by id. Use `Object.values(cats)` to iterate all.
- Energy management is key: don't let your cats run out of energy.
- Pods restore 1 energy/tick — controlling pods is strategically valuable.
- The death circle forces engagement. Plan for it.
- Splash damage means clumped enemies take massive damage from a single pew.
- You can heal friendly cats with pew to transfer energy.
- Barricades block movement, not pew. You can shoot over/through them.

## Your task

Write a complete yare.io bot in JavaScript. The code should be a single script (no imports, no exports, no module syntax). It will be wrapped in a block `{ ... }` and executed each tick.

**CRITICAL: Never use `return` in the main body of your code.** Your code is NOT inside a function — it runs at the top level of a block scope. A bare `return` statement will cause a compile error and your bot will instantly lose. Only use `return` inside functions you define.

Write strong, strategic code. Think about:
- Efficient target selection
- Energy management
- Positioning
- Death circle awareness (move inward before it drains you)
- Using `memory` to coordinate multi-tick strategies
