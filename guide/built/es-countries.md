<!-- i18n:countries_page_title -->
# Países
<!-- /i18n:countries_page_title -->

<!-- i18n:countries_intro -->
Todos los países del ecosistema del Mundial 2026 — selecciones clasificadas y el mundo más amplio del fútbol — clasificados por rating Elo y coloreados según sus conexiones nacido-en / juega-para.
<!-- /i18n:countries_intro -->

<!-- i18n:countries_url_params -->
## Parámetros de URL

Las páginas Países y Mapa admiten parámetros de URL para preconfigurar el panel de filtro y ordenación al cargarse. Todos los parámetros son opcionales e independientes; los parámetros omitidos mantienen los valores predeterminados del panel.

### `?explain` — ayuda de depuración

Añade `?explain` a cualquier URL para abrir al cargarse un panel de explicación que traduce cada parámetro activo a lenguaje claro, junto con un recuento de países visibles. El mismo panel puede activarse en cualquier momento mediante el badge `?` que aparece en la esquina del encabezado del filtro cuando hay parámetros no predeterminados activos. Ciérralo volviendo a hacer clic en `?`, en `×`, o pulsando Esc.

Todos los parámetros activos se registran siempre en la consola del navegador, independientemente de `?explain`.

```
?in&show=qual&explain    → abre el panel al cargar, permanece abierto para revisión
```

### `?sort` — criterio de ordenación

```
?sort=elo              clasificación Elo mundial (predeterminado)
?sort=alpha            A–Z nombre de país
?sort=pop              población
?sort=delta            juega-para menos nacido-en
?sort=elo+alpha        primario: Elo, secundario: A–Z
?sort=pop+delta+alpha  hasta 4 claves; solo las dos primeras son efectivas
```

`+` separa las claves (`,` también aceptado). Las claves especificadas van primero en el orden indicado; las claves no especificadas rellenan los espacios restantes en el panel. Se combina con `?dir`.

### `?dir` — dirección de ordenación

```
?dir=desc    descendente (predeterminado)
?dir=asc     ascendente
```

Se aplica solo a la clave de ordenación primaria. `?sort=alpha&dir=desc` produce Z–A.

### `?in` / `?out` — filtro alive & kicking

Indicadores booleanos — solo la presencia es la señal; no se necesita `=valor`. Reflejan el widget de conmutación **in · ● · out** en el panel de filtros.

```
(ninguno)    predeterminado — los 48 países clasificados mostrados
?in          solo alive & kicking — equipos aún en el torneo
?out         solo eliminados — equipos eliminados
?in&out      el equipo de Schrödinger → conjunto vacío (ningún país está simultáneamente in y out)
```

![Gato de Schrödinger](../images/Schrödinger.avif)

Cuando se establece `?in` o `?out`, los países exportadores no clasificados también se filtran:

- `?in` oculta los exportadores cuyos jugadores van todos a equipos eliminados
- `?out` oculta los exportadores cuyos jugadores van todos a equipos alive & kicking

### `?fifa` — filtro de confederaciones FIFA

```
?fifa=uefa       UEFA — Europa
?fifa=afc        AFC — Asia
?fifa=caf        CAF — África
?fifa=conmebol   CONMEBOL — América del Sur
?fifa=concacaf   CONCACAF — América del Norte y Central
?fifa=ofc        OFC — Oceanía
```

Filtra la lista a los miembros FIFA de la confederación indicada únicamente. Los países no-FIFA no se ven afectados — permanecen visibles u ocultos según la configuración de `?show` y `?in`/`?out`. En la página Mapa, también resalta el límite de la confederación y hace zoom sobre ella.

Los valores desconocidos se ignoran silenciosamente y se mantienen los valores predeterminados.

### `?show` — lista blanca de filtro

```
?show=<token>[,<token>...]
```

Códigos de celda y/o alias de grupo separados por comas. Cuando `show` está presente **reemplaza** completamente los valores predeterminados — cada celda no listada queda desmarcada. Cuando está ausente, se aplican los valores predeterminados.

##  Códigos de celda

La matriz de filtro refleja el diseño del panel — dos columnas (exportador / no exportador) cruzadas con cuatro grupos de filas:

|  | **exportador** | **no exportador** |
|---|:---:|:---:|
| **clasificado · importaciones**     | `qie`&nbsp;&nbsp;✓  | `qi`&nbsp;&nbsp;✓ |
| **clasificado · sin importaciones** |  `qe` &nbsp;&nbsp;✓ |  `q` &nbsp;&nbsp;✓ |
| **no clasificado · FIFA**           |  `ef` &nbsp;&nbsp;✓ | `of`&nbsp;&nbsp;○ |
| **no clasificado · no-FIFA**        |  `en` &nbsp;&nbsp;✓ | `on`&nbsp;&nbsp;○ |

✓ activo por defecto · ○ inactivo por defecto

Mnemónicos de letras:

- `q` — clasificado
- `i` — importaciones
- `e` — exportaciones
- `f` — miembro FIFA
- `n` — no-FIFA
- `o` — otro (no clasificado, no exportador)

### Nota sobre terminología

El marco oficial de este proyecto es **Nacido En / Juega Para**: un jugador es *nacido en* un país y *juega para* otro. En la matriz de filtro la misma relación se expresa desde el punto de vista del país como **importaciones / exportaciones**: un país *exporta* un jugador cuando alguien nacido allí juega para una selección diferente; *importa* un jugador cuando alguien nacido en el extranjero juega para su selección. Las dos formulaciones son intercambiables:

- «Francia exporta 17 jugadores» = «17 jugadores nacidos en Francia juegan para la selección de otro país.»
- «Marruecos importa 4 jugadores» = «4 jugadores nacidos fuera de Marruecos juegan para la selección marroquí.»
- «Un país `qie` importa y exporta» = «una selección clasificada que incluye jugadores nacidos en el extranjero *y* tiene jugadores nacidos allí representando otras naciones.»

## Alias de grupo

| Alias  | Se expande en      | Significado                                       |
|--------|--------------------|---------------------------------------------------|
| `qual` | `qie,qi,qe,q`     | Todas las filas clasificadas                      |
| `nq`   | `ef,en,of,on`     | Todas las filas no clasificadas                   |
| `exp`  | `qie,qe,ef,en`    | Columna exportadores                              |
| `nexp` | `qi,q,of,on`      | Columna no exportadores                           |
| `imp`  | `qie,qi`          | Filas importadores (con o sin exportaciones)      |
| `all`  | todos los 8 códigos | Todas las celdas (incluidas `of` y `on`)        |

Los alias y los códigos individuales se pueden mezclar libremente; el resultado es una unión. Los tokens desconocidos se ignoran silenciosamente — si todos los tokens son desconocidos el parámetro se ignora por completo y se mantienen los valores predeterminados.

## Combinar `?in`/`?out` con `?show`

- `?in&show=qual` → solo países clasificados alive & kicking
- `?out&show=qual` → solo países clasificados eliminados
- `?in&show=exp` → exportadores (clasificados o no) vinculados a equipos alive & kicking
- `?in`/`?out` no tienen efecto en las celdas `of`/`on` (no tienen conexión con el torneo)

## Ejemplos

```
?in&show=qual                 Solo países clasificados alive & kicking.
?out&show=qual                Solo países clasificados eliminados.
?show=qual                    Los 48 países clasificados; no clasificados ocultos.
?show=qual&sort=pop&dir=asc   Países clasificados ordenados por población ascendente.
?show=qie                     Solo países que tanto importan como exportan jugadores.
?in&show=exp                  Columna exportadores, filtrada a equipos alive & kicking.
?sort=delta&dir=asc&show=qual Países clasificados con menor diferencia juega-para vs. nacido-en primero.
?show=all                     Las 8 celdas incluidas of y on normalmente ocultas.
?show=qual,ef                 Países clasificados + exportadores FIFA no clasificados.
?fifa=uefa                    Solo miembros UEFA (filtro FIFA; no-FIFA no afectados).
?fifa=caf&show=exp            Solo exportadores africanos.
```
<!-- /i18n:countries_url_params -->
