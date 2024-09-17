# Réflexion sur la modélisation des alternatives

Ce document a pour objectif de réfléchir à la modélisation des alternatives,
c'est-à-dire des différentes options de mobilité (ex: achat d'une nouvelle
voiture, location, covoiturage, etc...).

En effet, ce modèle de calcul a pour **objectif de fournir une vision
d'ensemble des différentes options de mobilité** en fonction d'une situation,
en fournissant un moyen de les **comparer par leurs coûts ou leur empreinte
carbone**.

## Faisabilité

Dans un premier temps, il est nécessaire de déterminer si la modélisation d'une
alternative est possible, et si oui, à quel point peut-elle être précise.

### 1. Garder sa voiture actuelle

TODO

### 2. Achat d'une nouvelle voiture (Neuve)

> Implémentée : Oui | Faisabilité : faisable mais avec une incertitude sur le
> prix d'achat.

Première alternative modélisée en **utilisant les _valeurs estimées_ pour le
prix d'achat et la consommation** et en gardant les valeurs modifiées par
l'utilisateurice pour le reste, comme par exemple les km annuels ou les frais
d'entretiens par exemple (pourrait être estimés à termes et dépendre du type de
motorisation et du gabarit).

#### Empreinte carbone 🟢

Pour l'estimation de l'empreinte carbone cela **ne semble pas poser de problème**,
vu que de toute façon l'empreinte de la construction est estimée en fonction du
gabarit et de la motorisation, il n'est actuellement pas possible d'avoir une
estimation plus précise avec le modèle de NGC.

#### Coûts 🟠

L'estimation des coûts des alternatives est en revanche moins précise que celle
de l'empreinte. En effet, **le prix d'achat qui est une part non négligeable du
coût total est très difficile à estimer** car pour un même gabarit et une même
motorisation, le prix d'une voiture neuve peut varier d'un facteur 10 en
fonction de la gamme de prix.

Pour le calcul des coûts de la voiture actuelle cela ne pose pas de problème
car l'utilisateurice est en mesure de le préciser, en revanche pour l'estimation
des alternatives cela est plus compliqué.

Une première solution **consisterait à demander la gamme de prix de la voiture
cible** ( ex: entrée de gamme, moyenne gamme, luxe). Encore faudrait il trouver
des données sur le prix moyen d'une voiture en fonction de ce nouveau
paramètre.

### 3. Achat d'une nouvelle voiture (Occasion)

> Implémentée : Non | Faisabilité : faisable avec une incertitude assez fort
> sur le prix d'achat et sur la modélisation de l'amortissement de la
> construction.

Pas encore implémentée, mais pourrait facilement l'être en rajoutant le
paramètre occasion, ce qui rajouterait une dimension à l'espace des
possibilités.

#### Empreinte carbone ⚪

Pour l'instant l'**occasion n'est pas prise en compte dans le calcul de
l'empreinte carbone** que ce soit pour la voiture actuelle ou pour les
alternatives. Il est nécessaire de déterminer la façon dont on souhaite le
modéliser, puis de voir si cela est faisable en réutilisant le modèle de NGC ou
si il est nécessaire de s'en éloigner (voir [Amortissement de l'empreinte de la
construction](./global.md#amortissement-de-lempreinte-de-la-construction)).

#### Coûts 🟠

Pour les coûts, en l'état, il **est possible de modéliser une estimation de la
décote du prix de la voiture** en fonction de son âge. Se pose les même
problématiques sur l'estimation du prix d'achat comme pour les voitures neuves
avec un facteur de différence de prix plus important : pour un même modèle,
suivant l'état et l'âge de la voiture, le prix peut varier.

Cependant, pour une première estimation, nous pourrions **partir de l'âge moyen
des véhicules d'occasion proposés à la vente pour appliquer la décote** (9 ans en
2022 selon
[LeBoncoin](https://leboncoinsolutionspro.fr/actualites/vieillissement-du-parc-automobile-doccasion-pourquoi/)).

### 4. Location (courte durée)

> Implémentée : Non | Faisabilité : faisable mais avec une incertitude sur la
> possibilité d'inférer le nombre de jours de location annuel en fonction du
> nombre de km annuels et même en rajoutant des questions supplémentaires.

Pas encore implémentée, mais pourrait l'être en **omettant l'empreinte et les
coûts de possessions et en se concentrant uniquement sur l'utilisation**.

A noter que pour cette alternative, il pourrait être pertinent de réduire le
nombre de km annuels parcourus par rapport à l'utilisation actuelle en partant
du principe que passer à une location ponctuelle entraine un changement de
comportement et une réduction des déplacements en voiture (à sourcer).

#### Empreinte carbone 🟢

Actuellement, il serait possible de faire une première modélisation en considérant
une empreinte de construction nulle :

```yaml
empreinte . voiture:
  valeur: ngc . transport . voiture
  contexte:
    # ...
    ngc . transport . voiture . construction: 0 kgCO2e
```

#### Coûts 🟠

Pour l'estimation des coûts, il semble envisageable de **remplacer les coûts
liées à la possession d'une voiture par le coût de la location**. Il faudrait
alors estimer le coût moyen d'une location de voiture en fonction du gabarit et
de la motorisation.

##### Prix de la location

Le prix d'une location _courte durée_ peut-être **calculée à la journée, à la
semaine ou au mois**. Il est donc nécessaire de déterminer si on souhaite avoir
un prix moyen par jour, par semaine ou par mois. Et une fois ce choix fait, il
faudra **trouver un moyen de l'estimer à partir des km annuels ou en posant des
questions supplémentaires** (ex: utilisation de la voiture uniquement pour les
vacances, pour les déplacements professionnels, etc...).

Il semble faisable de trouver des estimation du prix moyen d'une location en
fonction du gabarit que ce soit par jour ou par semaine (voir le [communiqué de
presse](https://www.carigami.fr/magazine/wp-content/uploads/2024/05/CP-tarifs-ete-des-tarifs-en-baisse-en-France-et-a-letranger.pdf)
de [Carigami](https://www.carigami.fr/) en 2022).

##### Prix de l'assurance

Bien que souvent incluse dans le prix de la location, il se peut que des
assurances soient à rajouter. Il faudra donc penser au **coût éventuel de
l'assurance** ( voir [_Location de voiture : combien ça coûte?_ 2021
(Challenges)](https://www.challenges.fr/economie/location-de-voiture-combien-ca-coute_775706)).

> Nous pourrions également imaginer dans le parcours intégré dans Agir, de
> pouvoir déterminer s'il est nécessaire d'inclure une garantie jeune conducteur
> si l'utilisateurice est concerné.

### 5. Leasing

> Implémentée : Non | Faisabilité : ?

Il existe plusieurs types de leasing :

- la **location longue durée (LLD)** : simple location du véhicule pour une
  durée déterminée,
- la **location avec option d'achat (LOA)** : location du véhicule avec la
  possibilité de l'acheter à la fin du contrat,
- le **leasing social/électrique** : location de véhicule électrique à un tarif
  préférentiel pour les foyer modestes.

Pour la LLD, la modélisation est essentiellement la même que pour la location
courte durée avec simplement le prix de la location qui varie. En revanche,
pour la LOA, il est nécessaire de prendre en compte la possibilité d'achat du
véhicule à la fin du contrat.

> **Question** : est-ce que nous aurions pas intérêt à modéliser uniquement la
> LOA et à considérer la LLD comme une location courte durée ?

#### Empreinte carbone 🟢

Une première modélisation pourrait **simplement considérer l'empreinte de la LLD
comme celle de la location courte durée et celle de la LOA comme celle de
l'achat d'une voiture neuve**.

#### Coûts ⚪

La plus grosse incertitude pour la modélisation des coûts de la LOA est le prix
de rachat du véhicule à la fin du contrat. Il est donc nécessaire de **trouver
un moyen d'estimer ce prix** en fonction du gabarit et de la motorisation.

### 6. 100% mobilité douce (vélo, marche, transports en commun)

> Implémentée : Non | Faisabilité : ?

#### Empreinte carbone ⚪

#### Coûts ⚪

### 7. Retrofit de sa voiture actuelle

> Implémentée : Non | Faisabilité : ?

#### Empreinte carbone ⚪

#### Coûts ⚪

### 8. Passer à un deux-roues motorisé

> Implémentée : Non | Faisabilité : ?

#### Empreinte carbone ⚪

#### Coûts ⚪

### 9. Utiliser les voiture en libre-service

> Implémentée : Non | Faisabilité : ?

#### Empreinte carbone ⚪

#### Coûts ⚪

### 10. Covoiturage

> Implémentée : Non | Faisabilité : ?

#### Empreinte carbone ⚪

#### Coûts ⚪

## Notes

### Sur le nombre de possibilités

En prenant en compte les différentes alternatives, on arrive à un total de :

$$
\begin{align*}
& ((|gabarit| \times |motorisation| \times |carburant| \times |occasion|) \\
& +  (|gabarit| \times |motorisation| \times |carburant| \times |location\_courte\_duree|) \\
& +  (|gabarit| \times |motorisation| \times |carburant| \times |leasing|)) \\
& = (5 \times 3 \times 4 \times 2) + (5 \times 3 \times 4 \times 1) + (5 \times 3 \times 4 \times 2) \\
& = 120 + 60 + 120 \\
& = 300 \ \text{possibilités}
\end{align*}
$$

Ce qui pose de nombreuses questions :

- **Comment représenter et rendre intelligible toutes ces possibilités pour
  l'utilisateurice ?**
- **Comment implémenter ces différentes alternatives ?** (ex: une règle Publicodes par alternative,
  le gérer dynamiquement dans un wrapper, etc...)

### Sur le modèle NGC

Le choix initial d'utiliser directement le modèle de calcul [`transport .
voiture`](https://nosgestesclimat.fr/documentation/transport/voiture) de NGC
était motivé par la volonté de **s'appuyer sur un modèle existant et reconnu**
pour l'estimation de l'empreinte carbone et ne pas avoir à réinventer la roue.
Cependant, cela entraine **une contrainte forte sur les choix de modélisation**,
notamment sur l'amortissement de l'empreinte de la construction. Au vu des
différentes alternatives à modéliser et de leurs contraintes, nous pourrions
envisager d'implémenter un nouveau modèle de calcul, se pose alors
la question de choisir entre :

- **Contribuer directement** au modèle NGC pour qu'il soit plus flexible et prendre
  en compte les différents besoins.
- **Créer un modèle de calcul de l'empreinte carbone** à part, plus flexible et
  adapté à nos besoins (pouvant utiliser certaines sous-parties du modèle NGC si
  besoin).
- **Réapatrier le modèle de calcul de l'empreinte de la voiture** dans ce
  paquet afin de pouvoir facilement le modifier et que le modèle de NGC devienne
  réutilisateur de celui-ci.
