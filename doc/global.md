# Document de travail

## Objectif

Ce modèle de calcul a pour but d'être utilisé dans l'application
[Agir](https://agir.beta.gouv.fr/) pour aider les utilisateurices à prendre une
décision éclairée sur le changement de leur voiture. Cela nécessite un moyen de
comparer l'empreinte CO2e ainsi que le coût monétaire de deux véhicule et de
leurs usages.

Le but de ce modèle est donc de permettre le calcul d'une estimation de
l'empreinte carbone d'une voiture (fabrication et usage) ainsi que son coût
monétaire (achat, entretien, carburant, etc.) et de permettre de fournir une
listes des différentes options alternatives au véhicule actuel (voir ce
[document](/alternatives.md) pour plus d'informations sur les alternatives).

Un client autonome est disponible pour ce modèle :
[agir-voiture](https://github.com/betagouv/agir-voiture).

## Historique

### Expérimentation - [v0.3.0-7](https://github.com/betagouv/publicodes-voiture/commit/5779101907027d85e8ef52809d702bd066e97f64)

Afin de pouvoir rapidement confronter une première version aux tests
utilisateurices et vérifier l'utilité du projet, une première version du modèle
a été effectuée en réutilisant :

- le modèle de [Nos Gestes
  Climat (NGC)](https://nosgestesclimat.fr/documentation/transport/voiture) pour le calcul
  de l'empreinte carbone,
- et le modèle de
  [Futur.eco](https://github.com/laem/futur.eco/blob/master/app/cout-voiture/data/voiture.yaml)
  pour le calcul du coût.

Les règles correspondantes aux questions à posées étaient utilisées via le
mécanisme [`contexte`](https://publi.codes/docs/mecanismes#contexte) permettant
de calculer une règle avec un contexte particulier correspondant à la situation
de l'utilisateurice.

Par exemple, pour le calcul du coût à partir des règles de `futureco` :

```yaml
coût . voiture:
  formule: usage . km annuels * futureco . voiture . coûts au km
  unité: €/an
  contexte:
    futureco . trajet . voyageurs: 1
    futureco . voiture . consommation thermique:
      valeur:
        # TODO: factoriser avec empreinte
        # Permet de forcer l'utilisation de la consommation estimée lors des
        # recalculs pour les alternatives.
        #
        # Par défaut, si la personne n'a pas renseigné le prix d'achat, on avec
        # le mécansime `plancher`, la règle `prix d'achat` est évaluée à 1.
        variations:
          - si: voiture . thermique . consommation > 1
            alors: voiture . thermique . consommation
          - sinon: voiture . thermique . consommation . consommation estimée
    futureco . voiture . km annuels . par défaut: usage . km annuels
    futureco . voiture . prix d'achat:
      valeur:
        # Permet de forcer l'utilisation du prix d'achat estimé lors des
        # recalculs pour les alternatives.
        #
        # Par défaut, si la personne n'a pas renseigné le prix d'achat, on avec
        # le mécansime `plancher`, la règle `prix d'achat` est évaluée à 1.
        variations:
          - si: voiture . prix d'achat > 1
            alors: voiture . prix d'achat
          - sinon: voiture . prix d'achat . estimé
    futureco . voiture . motorisation:
      variations:
        - si: voiture . motorisation = 'thermique'
          alors:
            variations:
              - si: voiture . thermique . carburant = 'gazole B7 ou B10'
                alors: "'diesel'"
              - si: voiture . thermique . carburant = 'essence E5 ou E10'
                alors: "'essence'"
              - si: voiture . thermique . carburant = 'essence E85'
                alors: "'biocarburant'"
        - sinon: voiture . motorisation
    futureco . trajet voiture . prix carburant: voiture . thermique . prix carburant
    futureco . voiture . occasion: voiture . occasion
    futureco . voiture . occasion . année de fabrication: voiture . occasion . année de fabrication
```

#### Limitations

Cependant, cette approche possède certaines limites.

En effet, il est nécessaire de devoir traduire certains valeurs pour
correspondre à celles attendues par `futureco` qui ne sont pas les même que
celles utilisées par `NGC`. Ce qui **complique la compréhension du calcul** à
partir de la documentation, créer des **risques d'erreurs et d'incohérences si
c'est valeurs évaluent**.

De plus, n'ayant pas la mains sur le calcul la structure, cela **ne permet pas
de facilement exposer la répartition entre coût d'achat/construction et
l'utilisation** nécessaire pour une bonne pédagogie.

**La prise en compte de l'occasion diffères entre les deux modèles** : l'un
utilise la durée de vie en année et l'autre en km parcourus ce qui pose un
problème de cohérence du calcul et potentiellement des règles de conversions
compliquant encore une fois le calcul et la compréhension que l'on peut s'en
faire.

Le choix de la fonction d'amortissement` de
l'achat/construction).

La achat/construction de la voiture est amortie lorsque l'`économie réalisée sur
l'utilisation` est supérieur au coût d'achat/empreinte de la construction :

```yaml
durée d'amortissement:
  valeur: coût d'achat / économie réalisée sur l'utilisation
  unité: an

économie réalisée sur l'utilisation:
  valeur: coût d'utilisation actuelle - coût utilisation alternative
  unité: €/an
```

> **Interrogations** : est-ce que la durée d'amortissement ainsi que l'économie
> réalisée ne devrait pas être fait au niveau du client ?

Une autre option consisterait à calculer non pas une _durée_ d'amortissement
mais un certains nombres de km. Côté NGC, l'amortissement est fait en nombre de
km parcourus (voir la [documentation
correspondante](https://nosgestesclimat.fr/documentation/transport/voiture/amortissement),
il pourrait être donc pertinent d'utiliser la même approche pour le coût.

#### Voiture d'occasion

Prendre en compte l'occasion permet essentiellement de repartir la
responsabilité des émissions entre les propriétaires d'une même voiture.
Cependant, pour le calcul du coût cela se reflète déjà dans le prix d'achat de
la voiture donc ne serait pas forcément nécessaire de le prendre en compte
directement dans le calcul.
Sauf pour prendre en compte la durée de vie réduite la voiture comme c'est le cas
dans le modèle de `futureco` :

```yaml
futureco . voiture . durée de vie . relative:
  titre: Durée de vie estimée depuis le dernier achat
  description: |
    Si le propriétaire actuel a acheté la voiture neuve, sa durée de vie
    relative est la durée de vie moyenne d'une voiture.

    S'il l'a achetée d'occasion, on retranche la durée de possession d'un
    ancien propriétaire pour estimer le coût amorti de possession du
    propriétaire actuel, dans l'hypothèse où il la garderait jusqu'à sa fin de
    vie.

    Si vous avez acheté une voiture fabriquée en 2000, qui a donc 23 ans, nous
    estimons qu'elle n'a qu'un an à vivre, statistiquement. Bien sûr, de
    nombreuses voitures tiennent plus longtemps. Mais à l'inverse, de
    nombreuses tiennent moins longtemps, c'est le principe de la moyenne. Une
    extension du modèle pour ces cas-là pourra être envisagée.
  note: |
    Pour simplifier, nous prenons l'année la plus proche. En octobre 2023,
    c'est donc 2024. À mettre à jour dans 8 mois.
  formule:
    variations:
      - si: occasion
        alors:
          valeur: durée de vie - (2024 - occasion . année de fabrication)
          plancher: 1
      - sinon: durée de vie
```

Cependant, se pose la question de comment reporter cette durée de vie relative
dans le calcul de l'empreinte carbone.

#### Voiture de location

L'empreinte de la construction doit-elle ignorée pour la location en
considérant qu'elle revient au propriétaire (c'est-à-dire la compagnie de
location) ?

Si oui, elle devient une _meilleure_ alternative si le coût de location pour
toute la durée d'utilisation de la voiture louée est inférieur à la durée
d'amortissement d'une alternative correspondante à la voiture louée ?

#### Garder sa voiture actuelle ?

Garder sa voiture actuelle serait uniquement intéressant si le fait d'en
changer entraine un coût et une empreinte supérieur :

```yaml
alternative . garder sa voiture actuelle:
  valeur: durée d'amortissement > durée de vie présumée de la voiture
```

#### Conclusion intermédiaire

En commençant à réfléchir sur ce que signifie _meilleure alternative_, il semblerait
que c'est peut-être rentrer trop dans le détails et laisser cette notion au client
réutilisant le modèle.

**Le périmètre de ce modèle pourrait être cantonné à calculer d'une part le coût
(coût de construction amorti + coût d'utilisation + coût administratifs + coût
d'entretiens) et d'autre part l'empreinte (empreinte de construction amortie +
empreinte utilisation).**

### Amortissement du prix d'achat

> **Remarque** : cette réflexion ne devrait-elle pas être déplacée directement
> dans la note de la règle correspondante ?

Le prix d'achat d'une voiture qu'elle soit neuve ou d'occasion représente une
part importante du coût total du véhicule. De nombreuses méthodes existe pour
l'amortir : amortissement linéaire sur toute la durée de vie ou sur la durée
d'utilisation, non-linéaire en _payant_ plus les premières années, amorti en
retranchant le prix de revente. L'amortissement sur la durée de vie peut se
faire en années ou bien en km parcourus. Pour ce modèle un choix doit donc être
tranché.

Côté empreinte carbone, de nombreuses itérations ont été faites (voir la [page
dédiée](https://nosgestesclimat.fr/documentation/transport/voiture/amortissement))
avant de conclure sur un **amortissement du véhicule en fonction du nombre de
km parcourus, au regard du nombre de km maximal correspondant au gabarit du
véhicule**.

Dans le modèle de Futur.eco, c'est l'amortissement linéaire sur la durée de vie
en années de la voiture en faisant l'hypothèse **qu'en moyenne la voiture est
gardée jusqu'au bout de sa vie**.

Si à l'échelle d'une voiture, il est probable qu'elle roule jusqu'à la fin de
sa vie, (c'est-à-dire qu'elle ne soit plus en état de fonctionner), à l'échelle
d'un.e conducteurice cela semble peu probable. En effet, selon le [bilan de
2021 de
l'ONSIR](https://www.onisr.securite-routiere.gouv.fr/sites/default/files/2022-09/74-75%20Le%20parc%20automobile%20des%20m%C3%A9nages%20V5.pdf), la durée de
détention n'est que de 5,5 ans alors que l'âge moyen des voitures hors d'usage (VHU)
est de 19 ans (voir
cet [article](https://www.ecologie.gouv.fr/politiques-publiques/vehicules-hors-dusage-vhu).

> **Remarque** : nous observons un fort écart entre l'âge moyen des VHU (19
> ans) et l'âge moyen des véhicules du parc automobile des ménages (9 ans).
> Cela serait dû au fait que les voitures en fin de vie n'appartiennent plus
> aux ménages et seraient stockées chez des concessionnaire ou autre points de
> reventes avant d'être considéré comme étant hors d'usage ?

Le problème si l'on souhaite prendre en compte la durée d'utilisation pour
amortir le coût de l'achat il faudrait également prendre en compte le prix de
revente du véhicule et ainsi amortir uniquement `prix d'achat - prix de
revente`. Cependant, il n'est pas aisé d'avoir une méthode générale pour ce
calcul.

Afin d'avoir une cohérence entre le calcul de l'empreinte carbone et du coût il
pourrait être judicieux d'opter pour la même méthodologie que NGC. Cependant,
dans le modèle de NGC l'amortissement est effectué sur la durée de vie en km de
la voiture. Ce qui semble pertinent pour l'ACV à l'échelle de la voiture mais
si la ou le propriétaire ne la détient seulement pendant 5 ans, il serait
logique de répartir la charge de l'empreinte aux différent.es propriétaires et
éviter un double comptage.

**Conclusion**

**Partir pour un amortissement linéaire du prix d'achat sur la durée
d'utilisation semble être une solution simple est compréhensible** bien
qu'augmentant significativement le coût annuel par rapport au modèle de
Futur.eco.

Avec ce choix, des questions peuvent se poser :

- Souhaitons-nous appliquer la même fonction d'amortissement pour le calcul de
  l'empreinte de la construction ? Est-ce pertinent ?
- Comment refléter le prix de la revente de la voiture dans le prix des
  alternatives ?
- Pour l'occasion, la différence se fera donc uniquement sur le
  prix d'achat lui-même et non plus sur la durée de vie relative comme c'est le
  cas pour le modèle de Futur.eco, mais ce n'est pas forcément un problème.

> **Remarque** : pour l'empreinte carbone, nous pourrions considérer que la les
> émissions de la construction sont uniquement de la responsabilité de
> l'acheteureuse. Comment le signifier au niveau des résultats ? En
> amortissement linéairement sur la durée de vie pour l'achat d'une voiture
> neuve et pour l'occasion ne pas la décompter ? Comment faire pour reporter
> cette _dette d'empreinte_ lors d'un futur achat ?

#### Durée de détention

Ayant choisit un amortissement linéaire du prix d'achat sur la durée de
détention, il est nécessaire de déterminer cette durée de détention.
Or, trouver la bonne formulation afin de signifier que **cette durée
comprend à la fois le temps écoulé depuis l'achat mais également
le temps restant avant la revente n'est pas évident**.

### Estimation du prix d'achat

Pour le calcul des coûts de la voiture actuelle, il n'est pas nécessaire d'être
très précis sur le prix d'achat puisqu'il pourra être facilement renseigné par
l'utilisateurice. En revanche, **pour les alternatives, il est nécessaire
d'avoir une estimation relativement précise du prix d'achat** pour pouvoir
calculer les coûts. Or, **les prix varient énormément en fonction des modèles**
au sein même d'une même catégorie de véhicule et il est difficile de trouver
des sources et une méthodologie pour estimer ces prix en fonction du gabarit
et du type de motorisation.

**Il serait donc peut-être nécessaire de demander en plus la gamme de prix
envisagé par l'utilisateurice pour les alternatives (entrée de gamme, milieu de
gamme, luxe) pour pouvoir calculer une estimation plus précise des coûts**.
Reste à savoir comment déterminer les prix pour ces gammes en fonction du
gabarit et de la motorisation.

Une autre solution serait de **comparer les alternatives avec sans coût
d'achat** et se baser uniquement sur les autres paramètres.

Nous pourrions également envisager de **demander le prix envisagé pour l'achat de
la nouvelle voiture cible**.

### Contraventions

Le montant des recettes liées aux amendes de circulation s'élève à 1,8
milliards d'euros en 2022 selon la [Cour des
comptes](https://www.ccomptes.fr/system/files/2023-04/NEB-2022-Controle-circulation-et-stationnement-routiers.pdf?page=15).
Ce poste n'est donc pas à négliger dans le calcul des coûts d'une voiture.
Cependant, la valeur par défaut de 46 euros par an (calculée en divisant le
montant total des recettes par le nombre de voiture en circulation) doit
pouvoir être ajustée par l'utilisateurice, en effet, la montant de ces coûts
doivent fortement varier en fonction des personnes.

Si cela ne **semble pas être un problème pour la version autonome du simulateur**
pour laquelle aucune information renseignées par le l'utilisateurice ne sort de
son navigateur, **ce n'est pas forcément le cas pour une intégration dans Agir
qui aura la mains sur les données renseignées**.

### Amortissement de l'empreinte de la construction

> Réflexions liées :
>
> - https://github.com/incubateur-ademe/nosgestesclimat/issues/816
> - https://github.com/incubateur-ademe/nosgestesclimat/issues/2127

Actuellement, le calcul de l'empreinte carbone reprenant celui du modèle
`transport . voiture` de NGC, l'**empreinte de la construction est amortie sur
la durée de vie totale de la voiture (en km parcourus)** et se [reflète donc
dans le nombre de km parcourus par
an](https://nosgestesclimat.fr/documentation/transport/voiture/construction)
avec un
[seuil](https://nosgestesclimat.fr/documentation/transport/voiture/construction/seuil-km)
pour les _petits rouleurs_. Ce qui signifie que **plus de km sont parcourus à
l'année, plus l'empreinte liée à la construction augmente**.

Cette approche reparti la **responsabilité de l'empreinte de la construction
entre les différents propriétaires au prorata de leurs utilisation**.

### Quid des réglementation et interdiction sur des catégories de véhicules ?

## Ressources

- [_Voiture électrique à quel coûts ?_ (France Stratégie)](https://www.strategie.gouv.fr/publications/voiture-electrique-cout)
- [_Bilan annuel des transports en 2022_ (SDES)](https://www.statistiques.developpement-durable.gouv.fr/le-parc-automobile-des-menages-en-2023-moins-de-voitures-pour-les-plus-modestes-plus-souvent)
- [_Chiffres clés des transports - Édition 2023_ (SDES)](https://www.statistiques.developpement-durable.gouv.fr/chiffres-cles-des-transports-edition-2023?list-chiffres=true)
- [_Infographies Prix des péages : visualisez l'augmentation des tarifs en 2023, autoroute par autoroute_ (Franceinfo)](https://www.francetvinfo.fr/economie/automobile/infographies-prix-des-peages-visualisez-l-augmentation-des-tarifs-en-2023-autoroute-par-autoroute_5917970.html)
- [_La Sécurité routière en France - Bilan de l'année 2021_ (ONISR)](https://www.onisr.securite-routiere.gouv.fr/sites/default/files/2022-09/74-75%20Le%20parc%20automobile%20des%20m%C3%A9nages%20V5.pdf)
- [_Les voitures des Français n’ont jamais été aussi anciennes, selon une étude_ (Le Figaro)](https://www.lefigaro.fr/conjoncture/les-voitures-des-francais-n-ont-jamais-ete-aussi-anciennes-selon-une-etude-20230831)
- [_38,9 millions de voitures en circulation en France au 1er janvier 2023_ (SDES)](https://www.statistiques.developpement-durable.gouv.fr/389-millions-de-voitures-en-circulation-en-france-au-1er-janvier-2023)
- [_Analyse de cycle de vie appliquée a un véhicule ou un équipement automobile - Préconisations méthodologiques_ (PFA)](https://pfa-auto.fr/wp-content/uploads/2023/04/DT_Me%CC%81thodologie_2023_V15_FRANCAIS.pdf)
- [_Véhicules hors d'usage (VHU)_ (ADEME)](https://www.ecologie.gouv.fr/politiques-publiques/vehicules-hors-dusage-vhu)
- [_Compte d’affectation spéciale « Contrôle de la circulation et du stationnement routiers »_, 2022 (Cour des comptes)](https://www.ccomptes.fr/system/files/2023-04/NEB-2022-Controle-circulation-et-stationnement-routiers.pdf?page=15)
- [_Vieillissement du parc automobile d’occasion, pourquoi ?_ 2023 (LeBoncoin)](https://leboncoinsolutionspro.fr/actualites/vieillissement-du-parc-automobile-doccasion-pourquoi/)
- [_Baromètre du financement automobile européen_ 2021 (Eurogroup Consulting)](https://www.eurogroupconsulting.com/wp-content/uploads/2021/11/Eurogroup-Consulting_Barometre-financement-auto-2021.pdf)
- [_Budget de l'automobiliste en 2019_ (Automobile Club Association)](https://www.automobile-club.org/assets/doc/Budget_de_lAutomobiliste_2020_BD.pdf)
- [_Note d'analyse - Autopartage_ 2018 (The Shift Project)](https://theshiftproject.org/wp-content/uploads/2017/12/Analyse-Autopartage-V12-1.pdf)
- [_Enquête Autopartage 2022_ (ADEME)](https://librairie.ademe.fr/mobilite-et-transport/5804-enquete-autopartage-2022.html)
- [_Le covoiturage en France, ses avantages et la réglementation en vigueur_ (ecologie.gouv.fr)](https://www.ecologie.gouv.fr/politiques-publiques/covoiturage-france-ses-avantages-reglementation-vigueur)

### Sites de références

- [nosgestesclimat.fr](https://nosgestesclimat.fr/)
- [futur.eco](https://futur.eco/)
- [Car Labelling](https://carlabelling.ademe.fr/)
- [mes-aides.francetravail.fr](https://mes-aides.francetravail.fr)
- [Je roule en électrique](https://www.je-roule-en-electrique.fr/)
- [Observatoire.covoiturage.gouv.fr](https://observatoire.covoiturage.gouv.fr)

### Modèles existants

- [Je change ma voiture](https://jechangemavoiture.gouv.fr/jcmv/)
- [calculis.net](https://calculis.net/cout-km)
- [toutcalculer.com](https://www.toutcalculer.com/automobile/cout-kilometre-moto-voiture.php)

### Comparateurs de prix

- [elite-auto.fr](https://www.elite-auto.fr/recherche?prod_ELITE_OFFERS%5BrefinementList%5D%5Bcategory%5D%5B0%5D=3&prod_ELITE_OFFERS%5BrefinementList%5D%5BtypeForRecherche%5D%5B0%5D=Particulier&prod_ELITE_OFFERS%5BrefinementList%5D%5BsegmentEliteGroup%5D%5B0%5D=citadine&prod_ELITE_OFFERS%5BrefinementList%5D%5BenergieNormalized%5D%5B0%5D=essence)

---

<details>
  <summary>Anciennes notes</summary>

## Spécifications

### Sorties

Les sorties du modèle sont les suivantes :

- L'empreinte carbone totale (en kgCO2e/an), décomposée en :
  - Fabrication
  - Usage
- Le coût total (en €/an), décomposé en :
  - Achat
  - Entretien
  - Carburant
  - Autres (assurances, péages, parking, etc.)

### Entrées

Voici les différentes informations nécessaires pour le calcul :

**Informations sur le véhicule**:

- Le type de carburant:
  - essence
  - diesel
  - électrique
  - hybride
  - hybride rechargeable
- La consommation (en L/100km ou Wh/km)
- ~~Poids du véhicule (en kg)~~ gabarit
  > Q: nécessaire si on a déjà la consommation ?
- Coût d'achat (en €)
- Coût d'entretien annuel (en €)

- Voiture de fonction ?

**Informations sur l'usage**:

- Nombre de kilomètres parcourus par an (en km)
- Prix du carburant (en €/L ou €/kWh)
- Prix de l'assurance (en €/an)
- Type de trajets:
  - Urbain (ex. travail, trajets quotidiens)
  - Longue distance (ex. vacances, famille)
  - Rural (ex. travail en dehors de la ville ou dans une autre ville)

Le type de trajet à pour but d'affiner l'estimation des coûts de la catégorie
`Autres`, quelle est la fréquence d'utilisation d'autoroutes par exemple,
etc... (Voir [futur.eco/cout-voiture](https://futur.eco/cout-voiture).

<details>
```
