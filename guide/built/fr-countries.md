<!-- i18n:countries_page_title -->
# Pays
<!-- /i18n:countries_page_title -->

<!-- i18n:countries_intro -->
Tous les pays de l'écosystème de la Coupe du Monde 2026 — équipes qualifiées et monde plus large du football — classés par classement Elo et colorés selon leurs connexions né-dans / joue-pour.
<!-- /i18n:countries_intro -->

<!-- i18n:countries_url_params -->
## Paramètres d'URL

Les pages Pays et Carte acceptent des paramètres d'URL pour préconfigurer le panneau de filtre et de tri au chargement. Tous les paramètres sont optionnels et indépendants ; les paramètres omis conservent les valeurs par défaut du panneau.

### `?explain` — aide au débogage

Ajoutez `?explain` à n'importe quelle URL pour ouvrir au chargement un panneau d'explication qui traduit chaque paramètre actif en langage clair, avec un décompte des pays visibles. Le même panneau peut être basculé à tout moment via le badge `?` qui apparaît dans le coin de l'en-tête de filtre dès que des paramètres non par défaut sont actifs. Fermez-le en cliquant à nouveau sur `?`, sur `×`, ou en appuyant sur Échap.

Tous les paramètres actifs sont toujours journalisés dans la console du navigateur, indépendamment de `?explain`.

```
?in&show=qual&explain    → ouvre le panneau au chargement, reste ouvert pour consultation
```

### `?sort` — critère de tri

```
?sort=elo              classement Elo mondial (par défaut)
?sort=alpha            A–Z par nom de pays
?sort=pop              population
?sort=delta            joue-pour moins né-dans
?sort=elo+alpha        primaire : Elo, secondaire : A–Z
?sort=pop+delta+alpha  jusqu'à 4 clés ; seules les deux premières sont actives
```

`+` sépare les clés (`,` également accepté). Les clés spécifiées viennent en premier dans l'ordre donné ; les clés restantes remplissent les emplacements suivants dans le panneau. Se combine avec `?dir`.

### `?dir` — sens du tri

```
?dir=desc    décroissant (par défaut)
?dir=asc     croissant
```

S'applique uniquement à la clé de tri principale. `?sort=alpha&dir=desc` donne Z–A.

### `?in` / `?out` — filtre alive & kicking

Indicateurs booléens — la présence seule est le signal ; aucun `=valeur` nécessaire. Ils reflètent le widget de bascule **in · ● · out** dans le panneau de filtre.

```
(aucun)      par défaut — les 48 pays qualifiés sont affichés
?in          alive & kicking uniquement — équipes encore en lice
?out         éliminés uniquement — équipes éliminées
?in&out      l'équipe de Schrödinger → ensemble vide (aucun pays n'est simultanément in et out)
```

![Chat de Schrödinger](../images/Schrödinger.avif)

Lorsque `?in` ou `?out` est défini, les pays exportateurs non qualifiés sont également filtrés :

- `?in` masque les exportateurs dont tous les joueurs vont vers des équipes éliminées
- `?out` masque les exportateurs dont tous les joueurs vont vers des équipes alive & kicking

### `?fifa` — filtre confédérations FIFA

```
?fifa=uefa       UEFA — Europe
?fifa=afc        AFC — Asie
?fifa=caf        CAF — Afrique
?fifa=conmebol   CONMEBOL — Amérique du Sud
?fifa=concacaf   CONCACAF — Amériques du Nord et Centrale
?fifa=ofc        OFC — Océanie
```

Filtre la liste aux membres FIFA de la confédération indiquée uniquement. Les pays non-FIFA ne sont pas affectés — ils restent visibles ou masqués selon les paramètres `?show` et `?in`/`?out`. Sur la page Carte, met également en évidence la frontière de la confédération et effectue un zoom dessus.

Les valeurs inconnues sont silencieusement ignorées et les valeurs par défaut sont conservées.

### `?show` — liste blanche de filtre

```
?show=<jeton>[,<jeton>...]
```

Codes de cellule et/ou alias de groupe séparés par des virgules. Lorsque `show` est présent, il **remplace** entièrement les valeurs par défaut — chaque cellule non listée est décochée. En son absence, les valeurs par défaut s'appliquent.

##  Codes de cellule

La matrice de filtre reflète la disposition du panneau — deux colonnes (exportateur / non-exportateur) croisées avec quatre groupes de lignes :

|  | **exportateur** | **non-exportateur** |
|---|:---:|:---:|
| **qualifié · imports**        | `qie`&nbsp;&nbsp;✓  | `qi`&nbsp;&nbsp;✓ |
| **qualifié · sans import**    |  `qe` &nbsp;&nbsp;✓ |  `q` &nbsp;&nbsp;✓ |
| **non qualifié · FIFA**       |  `ef` &nbsp;&nbsp;✓ | `of`&nbsp;&nbsp;○ |
| **non qualifié · non-FIFA**   |  `en` &nbsp;&nbsp;✓ | `on`&nbsp;&nbsp;○ |

✓ actif par défaut · ○ inactif par défaut

Mnémoniques des lettres :

- `q` — qualifié
- `i` — imports
- `e` — exports
- `f` — membre FIFA
- `n` — non-FIFA
- `o` — autre (non qualifié, non-exportateur)

### Note sur la terminologie

Le cadre officiel de ce projet est **Né Dans / Joue Pour** : un joueur est *né dans* un pays et *joue pour* un autre. Dans la matrice de filtre, la même relation est exprimée du point de vue du pays comme **imports / exports** : un pays *exporte* un joueur lorsque quelqu'un né là-bas joue pour une autre équipe ; il *importe* un joueur lorsque quelqu'un né à l'étranger joue pour son équipe. Les deux formulations sont interchangeables :

- « La France exporte 17 joueurs » = « 17 joueurs nés en France jouent pour l'équipe d'un autre pays. »
- « Le Maroc importe 4 joueurs » = « 4 joueurs nés hors du Maroc jouent pour l'équipe marocaine. »
- « Un pays `qie` importe et exporte à la fois » = « une équipe qualifiée qui inclut des joueurs nés à l'étranger *et* qui a des joueurs nés chez elle représentant d'autres nations. »

## Alias de groupe

| Alias  | Se développe en    | Signification                                  |
|--------|--------------------|------------------------------------------------|
| `qual` | `qie,qi,qe,q`     | Toutes les lignes qualifiées                   |
| `nq`   | `ef,en,of,on`     | Toutes les lignes non qualifiées               |
| `exp`  | `qie,qe,ef,en`    | Colonne exportateurs                           |
| `nexp` | `qi,q,of,on`      | Colonne non-exportateurs                       |
| `imp`  | `qie,qi`          | Lignes importateurs (avec ou sans exports)     |
| `all`  | tous les 8 codes  | Toutes les cellules (dont `of` et `on`)        |

Les alias et les codes individuels peuvent être librement mélangés ; le résultat est une union. Les jetons inconnus sont silencieusement ignorés — si tous les jetons sont non reconnus, le paramètre est entièrement ignoré et les valeurs par défaut sont conservées.

## Combiner `?in`/`?out` avec `?show`

- `?in&show=qual` → uniquement les pays qualifiés alive & kicking
- `?out&show=qual` → uniquement les pays qualifiés éliminés
- `?in&show=exp` → exportateurs (qualifiés ou non) liés aux équipes alive & kicking
- `?in`/`?out` n'ont aucun effet sur les cellules `of`/`on` (elles n'ont pas de lien avec le tournoi)

## Exemples

```
?in&show=qual                 Uniquement les pays qualifiés alive & kicking.
?out&show=qual                Uniquement les pays qualifiés éliminés.
?show=qual                    Les 48 pays qualifiés ; non qualifiés masqués.
?show=qual&sort=pop&dir=asc   Pays qualifiés triés par population croissante.
?show=qie                     Uniquement les pays qui importent et exportent.
?in&show=exp                  Colonne exportateurs, filtrée sur les équipes alive & kicking.
?sort=delta&dir=asc&show=qual Pays qualifiés avec le moins d'écart joue-pour vs. né-dans en premier.
?show=all                     Toutes les 8 cellules, dont of et on normalement masquées.
?show=qual,ef                 Pays qualifiés + exportateurs FIFA non qualifiés.
?fifa=uefa                    Membres UEFA uniquement (filtre FIFA ; non-FIFA non affecté).
?fifa=caf&show=exp            Exportateurs africains uniquement.
```
<!-- /i18n:countries_url_params -->
