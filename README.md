# yare

## FIXME
### super velky problem

- kvadraticky algoritmus pro sight
	- katastrofa a imo likely main bottleneck
	- jde to skoro-linearne

### velky veci

- nepouzivat `X.findIndex`
	- linearni algoritmus, co prochazi cely pole
		- ale delas ho porad dokola (a tim spis players),
			takze dohromady to klidne muze byt
			kvadraticky slowdown
	- to je hrozne drahy, jde to konstantne hash-mapou

- to ze mrtvoly jsou v `living_spirits`
  - ty mergnuty bych dal do nejaky spesl pameti, neco jako `sleeping`
	- tzn, musi se to porad kontrolovat, vsechny smycky trvaji o to dyl
		- tzn algoritmy jsou porad stejne drahy asymptoticky, jen maji mensi konstanty
		- hlavne na konci hry (po bojich, atp) je to blby


### stredni

- predpocitani
	- tzn, pripravit nejaky bezny usecases pro uzivatele,
		a doufat ze je budou pouzivat, misto svy vlastni
		(kvadraticky blby) implementace
	- distances (mozna by slo nejak chytre?)
	- "mnozinu spiritu, ktery jsou v min_beam vzdalenosti"
		- to jde udelat vyrazne rychleji, nez kvadraticky:
			```
			for spirit in my_spirits:
				for enemy in spirit.sight.enemies:
					d = dist(spirit, enemy)
					if d < min_beam:
						spirit.energize(enemy)
			```

### super maly (ale levny) detaily

- `get_distance_fast`
	- `math.sqrt` / `math.hypot` je drahy
	- `get_distance_fast` jde pouzit pro vsechno
		- `get_distance(x,y) < 200` => `get_distance_fast(x,y) < 200*200`

- do `energize_queue` se nemusej strkat ty spirity, co jsou uplne mimo daleko
	tzn, 
	https://github.com/riesvile/yare/blob/502a8da0dd43b40219b0eb710bf334b184125b2b/game.js#L651

	- dat nejaky levny filter typu `math.abs(x1-x2) + math.abs(y1-y2) > 400`
