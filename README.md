# yare

## TODO
- `get_sight_fast`:
	- kontroly spravnosti
- `energize`: simplify, uz tam ted jsou jen ty co jsou dost blizko

## FIXME
### velky veci

- nepouzivat `X.findIndex`
	- linearni algoritmus, co prochazi cely pole
		- ale delas ho porad dokola,
			takze dohromady to klidne muze byt
			kvadraticky slowdown
	- to je hrozne drahy, jde to konstantne hash-mapou

- to ze mrtvoly jsou v `living_spirits`
  - ty mergnuty bych dal do nejaky spesl pameti, neco jako `sleeping`
	- tzn, musi se to porad kontrolovat, vsechny smycky trvaji o to dyl
		- tzn algoritmy jsou porad stejne drahy asymptoticky, jen maji zbytecne velky konstanty
		- hlavne na konci hry (po bojich, atp) je to blby


### stredni

- predpocitani
	- tzn, pripravit nejaky bezny usecases pro uzivatele,
		a doufat ze je budou pouzivat, misto svy vlastni
		(kvadraticky blby) implementace
	- distances (mozna by slo nejak chytre?)
