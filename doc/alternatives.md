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

|      Implémentée      | Faisabilité                                           |
| :-------------------: | :---------------------------------------------------- |
| En quelque sorte (v0) | 🟢 modélisable mais néccessite une réflexion sur l'UX |

Actuellement, l'alternative de prolonger la durée d'utilisation de sa voiture
actuelle n'est pas implémentée en tant que tel. En effet, il sera seulement
affiché un message indiquant que l'empreinte ou les coûts de la voiture
actuelle sont les plus bas comparés aux autres alternatives. Or, cela n'**est
pas représentatif de la réalité**, car en prolongeant la durée d'utilisation
d'une voiture, le prix d'achat est amorti sur une durée d'utilisation plus
longue, ce qui réduit le coût total de la voiture.

Il faudrait donc avoir une alternative _Gardez votre voiture X années de plus_,
qui permette de **prendre en compte le coût d'achat amorti sur la durée
d'utilisation totale**. Cette approche pose néanmoins le problème de devoir
faire évoluer dynamiquement la première estimation des coûts de la voiture
actuelle présentée dans les résultats. Nous pourrions envisager de permettre de
modifier la durée d'utilisation de la voiture actuelle depuis les résultats et
garder l'affichage actuel.

> **Question** : comment rendre compréhensible le fait que choisir une
> alternative _Gardez votre voiture actuelle_ revient à prolonger la durée
> d'utilisation de la voiture et donc de réduire la première estimation des
> coûts pour la voiture actuelle ?

En revanche, **pour l'empreinte carbone**, avec la modélisation actuelle de
l'amortissement, **cela n'a pas d'impact** car l'empreinte de la construction est
déjà amortie sur la durée de vie totale de la voiture en km (voir
[Amortissement de l'empreinte de la
construction](./global.md#amortissement-de-lempreinte-de-la-construction)).

---

### 2. Achat d'une nouvelle voiture (Neuve)

| Implémentée | Faisabilité                        |
| :---------: | :--------------------------------- |
|     Oui     | 🟠 incertitude sur le prix d'achat |

Première alternative modélisée en **utilisant les _valeurs estimées_ pour le
prix d'achat et la consommation** et en gardant les valeurs modifiées par
l'utilisateurice pour le reste, comme par exemple les km annuels ou les frais
d'entretiens (à noter qu'à terme, nous pourrions envisager de les paramétrer
également en fonction du gabarit et de la motorisation).

#### Empreinte carbone 🟢

Pour l'estimation de l'empreinte carbone cela **ne semble pas poser de problème**,
vu que de toute façon l'empreinte de la construction est estimée en fonction du
gabarit et de la motorisation, il n'est actuellement pas possible d'avoir une
estimation plus précise avec le modèle de NGC.

> **Remarque** : il serait tout de même possible d'améliorer la précision en
> permettant de préciser les paramètres de la voiture neuve comme par exemple
> la consommation au 100 km, les frais d'entretien, etc... (voir la note [Sur
> l'utilisation des données de Car
> Labelling](#sur-lutilisation-des-données-de-car-labelling)).

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

> **Question** : souhaitons-nous prendre en compte le crédit auto dans le
> calcul du prix d'achat amorti ?

---

### 3. Achat d'une nouvelle voiture (Occasion)

| Implémentée | Faisabilité                        |
| :---------: | :--------------------------------- |
|     Non     | 🟡 incertitude sur le prix d'achat |

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

Une première approche pourrait être de **considérer une durée de vie
_plus_ grande pour le calcul de l'empreinte de la construction** pour les
voitures d'occasion ainsi **réduire l'empreinte de la construction par km**.
Cependant, quelle durée de vie choisir ? 10 ans ? l'âge de la voiture ?

#### Coûts 🟡

Pour les coûts, en l'état, il **est possible de modéliser une estimation de la
décote du prix de la voiture** en fonction de son âge. Se pose les même
problématiques sur l'estimation du prix d'achat comme pour les voitures neuves
avec un facteur de différence de prix plus important : pour un même modèle,
suivant l'état et l'âge de la voiture, le prix peut varier.

Cependant, pour une première estimation, nous pourrions **partir de l'âge moyen
des véhicules d'occasion proposés à la vente pour appliquer la décote** (9 ans en
2022 selon
[LeBoncoin](https://leboncoinsolutionspro.fr/actualites/vieillissement-du-parc-automobile-doccasion-pourquoi/)).

---

### 4. Location courte durée (LCD)

| Implémentée | Faisabilité                                                                                                                                                   |
| :---------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|     Non     | 🟡 incertitude sur le prix de la location et sur la possibilité d'inférer le nombre de jours/semaines de location annuel en fonction du nombre de km annuels. |

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

#### Coûts 🟡

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

> **Question** : souhaitons-nous modéliser la durée de la location en jours,
> semaines ou mois ? Et comment souhaitons-nous l'estimer ?

Il semble faisable de trouver des estimation du prix moyen d'une location en
fonction du gabarit que ce soit par jour ou par semaine (voir le [communiqué de
presse](https://www.carigami.fr/magazine/wp-content/uploads/2024/05/CP-tarifs-ete-des-tarifs-en-baisse-en-France-et-a-letranger.pdf)
de [Carigami](https://www.carigami.fr/) en 2022).

##### Prix de l'assurance

Bien que souvent incluse dans le prix de la location, il se peut que des
assurances soient à rajouter. Il faudra donc penser au **coût éventuel de
l'assurance** ( voir [_Location de voiture : combien ça coûte?_ 2021
(Challenges)](https://www.challenges.fr/economie/location-de-voiture-combien-ca-coute_775706)).

> **Remarque** : nous pourrions également imaginer dans le parcours intégré
> dans Agir, de pouvoir déterminer s'il est nécessaire d'inclure une garantie
> jeune conducteur si l'utilisateurice est concerné.

---

### 5. Leasing (LLD/LOA/leasing social)

| Implémentée | Faisabilité                                                                                                                                                                        |
| :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     Non     | 🟠 questionnement sur la différenciation entre LLD et LOA et sur l'estimation du prix de rachat et de la façon de différencier les coûts annuels par rapport à un achat classique. |

Il existe plusieurs types de leasing :

- la **location longue durée (LLD)** : simple location du véhicule pour une
  durée déterminée,
- la **location avec option d'achat (LOA)** : location du véhicule avec la
  possibilité de l'acheter à la fin du contrat,
- le [**leasing social/électrique**](https://www.service-public.fr/particuliers/actualites/A16990) : location de véhicule électrique à un tarif
  préférentiel pour les foyer modestes.

Pour la LLD, la modélisation est essentiellement la même que pour la location
courte durée avec simplement le prix de la location qui varie. En revanche,
pour la **LOA, il est nécessaire de prendre en compte la possibilité d'achat** du
véhicule à la fin du contrat.

> **Question** : est-ce que nous aurions pas intérêt à modéliser uniquement la
> LOA et à considérer la LLD comme une location courte durée ?

Le leasing social pourrait être considéré comme une aide car les conditions
d'éligibilité sont **conditionnées par le revenu fiscal de référence** et la
distance parcourue annuellement dans le **cadre de l'activité
professionnelle**.

> **Question** : souhaitons-nous considérer le leasing social comme une aide à
> l'achat d'une voiture électrique et donc de ne pas le modéliser directement
> dans le modèle de calcul et simplement le notifier dans un contenu statique ?

A noter que pour la LOA, il est **également possible de le faire pour une voiture
d'occasion**.

> **Question** : souhaitons-nous modéliser la LOA pour les voitures d'occasion
> ou neuve seulement ?

#### Empreinte carbone 🟢

Une première modélisation pourrait **simplement considérer l'empreinte de la LLD
comme celle de la location courte durée et celle de la LOA comme celle de
l'achat d'une voiture neuve**.

Cependant, nous pourrions prendre en compte le fait qu'une LOA ne débouche pas
nécessairement sur l'achat du véhicule et donc dans ce cas là, **l'empreinte de
la construction ne serait pas prise en compte** et on se retrouverait dans le
cas de la LLD.

> **Question** : souhaitons-nous rentrer dans le détail de distinguer le cas où
> le véhicule est acheté à la fin du contrat ou non ?

#### Coûts ⚪

La plus grosse incertitude pour la modélisation des coûts de la LOA est le prix
de rachat du véhicule à la fin du contrat. Il est donc nécessaire de **trouver
un moyen d'estimer ce prix** en fonction du gabarit et de la motorisation.

> **Remarque** : si avec le prix de rachat, le coût total de la LOA est
> similaire à celui d'un achat d'une voiture neuve, se pose alors la question
> de savoir si cela vaut le coup de proposer une LOA ou bien de **trouver un
> moyen de modéliser la différence de prix sur le temps**. En effet, la LOA
> permet d'étaler les frais d'achat sur le temps.

Dans le cas où le véhicule n'est pas acheté à la fin du contrat, existe-t-il
une grande différence de prix entre une LOA et une LLD ? Si oui, il faudrait
**trouver un moyen de l'estimer** afin de voir si la différence de prix
justifierait de rentrer dans ce niveau de détail.

Pour la LOA, nous pourrions également modéliser [**l'apport
initial**](https://www.vivacar.fr/conseils-expert-loa/faut-il-mettre-de-l-apport-en-loa/).
Cela pourrait se justifier si ça a un impact sur le coût total de la LOA.

A noter, que pendant la durée de location, l'utilisateurice n'est pas
considérer comme propriétaire du véhicule et n'a donc **pas a sa charge le coût
du certificat d'immatriculation** (voir
[service-public.fr](https://www.service-public.fr/particuliers/vosdroits/F33208)).

---

### 6. Mobilité douce (vélo, marche, transports en commun)

| Implémentée | Faisabilité                                                                                                                                                      |
| :---------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     Non     | 🟠 données disponibles, en revanche, le point d'interrogation réside sur la façon d'estimer la part des km annuels pouvant être remplacer par une mobilité douce |

> **Question** : souhaitons-nous inclure le train (TGV, TER, etc...) dans les
> mobilités douces ? Ou bien considérer uniquement les transports en commun
> urbains ?

A priori, le remplacement de sa voiture pour passer à une mobilité douce n'est
possible que pour les personnes faisant des trajets courts au quotidien. Se
pose donc la question de **comment déterminer le type de trajet effectué par
l'utilisateurice**.

Une première piste consisterait à demander à choisir le
type de trajet majoritaire fait actuellement en voiture :

- trajet quotidien (< 5 km)
- trajet quotidien (> 5 km)
- vacances (> 100 km)

En fonction de ce choix, nous pourrions considérer que si l'utilisateurice fait
majoritairement des trajets quotidiens de moins de 5 km, il est pertinent de
lui proposer une alternative de mobilité douce pour remplacer sa voiture. De
même que pour les trajets occasionnels pour les vacances de plus de X km, il
semble envisageable de lui proposer une alternative utilisant le train.
En revanche, pour les trajets quotidiens _moyennement_ longs, ne pouvant être
desservis par les transports en commun ou trop longs pour être fait à pied ou à
vélo, il est peut-être moins pertinent de proposer cette alternative.

La **réalité des usages est bien sûr plus complexe** et souvent plusieurs types
de trajets sont effectués. Idéalement, il faudrait pouvoir **déterminer la part
des km annuels pouvant être effectués en mobilité douce** et ainsi soustraire
les km parcourus en voiture de l'empreinte carbone totale et des coûts et de
l'additionner à l'empreinte carbone et aux coûts de la mobilité douce.

> **Question** : est-ce pertinent de proposer une alternative 100% mobilité
> douce dans laquelle la totalité des km annuels est effectuée en mobilité
> douce ? Ou bien est-il plus souhaitable de proposer une alternative _Gardez
> votre voiture actuelle et remplacez une partie de vos trajets par de la
> mobilité douce_ ? Cela nécessiterait une collecte plus fine des km parcourus
> en fonction des différents types de trajets et donc pas forcément
> envisageable.

#### Empreinte carbone 🟢

Une fois la question de la répartition et de la collecte des km parcourus en
fonction de chacun des types de transports, calculer l'empreinte carbone de la
mobilité douce pour chacune des distances est **facilement faisable en utilisant
le modèle [`transport`](https://nosgestesclimat.fr/documentation/transport) de
NGC**.

#### Coûts 🟠

##### Vélo et marche 🟢

Concernant les coûts, la difficulté réside dans l'estimation du coûts des
trajets en trains et en transports en commun. En effet, **pour la marche et le
vélo, les coûts sont quasiment nuls** (surtout s'il est amorti sur toute sa durée
de vie qui est quasi infini), nous pourrions malgré tout estimer un coût global
moyen pour la possession d'un vélo (prix d'achat, équipement, entretien,
etc...) paramétrable en fonction de l'assistance électrique par exemple, voir
même du type de vélo (vélo de ville, VTT, etc...) et de s'il est neuf ou
d'occasion.

En revanche, pour les transports en commun, il est nécessaire de **trouver un
moyen d'estimer le coût moyen d'un trajet en train ou en bus** en fonction de
la distance parcourue.

##### TGV 🟠

Une [enquête de l'UFC-Que
Choisir](https://www.quechoisir.org/actualite-tarifs-sncf-au-kilometre-2023-moins-c-est-long-plus-c-est-cher-n106658/),
permet d'avoir un prix moyen du km parcouru en TGV, à noter que le **prix réel
des billets de trains peut varier énormément** en fonction de la région et du
moment de l'achat ainsi que du type d'abonnement, ce qui rend l'**estimation
imprécise**.

##### Transports en commun 🟢

Au contraire des TGV, qui sont principalement utilisés par l'achat de billets
et nécessitent donc une estimation du prix au km moyen. Si nous souhaitons
mettre en avant une alternative ou l'usage de la voiture est remplacé par
l'**utilisation des transports en commun, il est pertinent de se baser sur le
coût moyen d'un abonnement annuel pour les transports en commun** plutôt que
sur le coût moyen d'un trajet qui sera difficilement estimable à partir d'une
distance en km.

Une **estimation moyenne du prix des abonnements dans les villes aux réseaux de
transport les plus denses est faisable** à partir de cet [article de
Libération](https://www.liberation.fr/france/2018/03/22/combien-coutent-les-transports-publics-en-france-et-dans-le-monde_1637860/).
Les données date de 2018, il serait donc intéressant de trouver des données
plus récentes mais cela ne semble pas facile.

A noter que 50% des abonnements sont pris en charge par l'employeur, il est
sera donc nécessaire de l'indiquer dans les résultats.

---

### 7. Rétrofit de sa voiture actuelle

| Implémentée | Faisabilité                                                                                        |
| :---------: | :------------------------------------------------------------------------------------------------- |
|     Non     | 🔴 peux de recul et de données disponibles et déclinaisons comliquées pour les différents gabarits |

Le
[rétrofit](https://www.ecologie.gouv.fr/politiques-publiques/savoir-retrofit-electrique)
consiste à remplacer la motorisation d'un véhicule thermique par une
motorisation électrique.
Cette alternative ne pourra donc être envisagée uniquement pour les véhicule
actuels thermique de plus de 5 ans.

Le rétrofit étant **une pratique récente, il est encore difficile d'avoir le
recul pour estimer des valeurs moyennes**. Cependant, une [étude de
l'ADEME](https://librairie.ademe.fr/mobilite-et-transport/4590-etude-retrofit.html?search_query=retrofit&results=9)
pourrait permettre d'avoir des premières estimations.

> **Question** : à quel point souhaitons-nous modéliser le rétrofit si les
> valeurs risque de fortement évoluer au cours des prochaines années ?

#### Empreinte carbone 🔴

Il n'y a pas de données permettant de modéliser l'empreinte carbone du rétrofit
en fonction du gabarit et de la motorisation dans l'[étude de
l'ADEME](https://librairie.ademe.fr/mobilite-et-transport/4590-etude-retrofit.html?search_query=retrofit&results=9).
La seule information qui est fournie est une réduction de 66% des émissions de
GES pour le retrofit d'un véhicule diesel par rapport au prolongement de la
durée de vie du véhicule sur 10 ans de fonctionnement.

Une [étude de Carbone 4](https://www.carbone4.com/analyse-retrofit-vehicules)
estime quant à elle une réduction de 81% des émissions de GES pour un scénario
équivalent.

**Difficile donc d'en tirer des conclusions permettant de modéliser l'empreinte
d'un rétrofit en fonction du gabarit et de la motorisation**.

#### Coûts 🔴

Dans l'[étude de l'ADEME](https://librairie.ademe.fr/mobilite-et-transport/4590-etude-retrofit.html?search_query=retrofit&results=9),
un tableau page 8, permet d'avoir une fourchette du coûts des différentes opérations de conversions :

| Opération de conversion                                                  | Coût moyen (€)                                                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Achat du moteur électrique et autres composants du groupe motopropulseur | entre 9500 € et 66500 €                                                                               |
| Prix d'achat de la batterie                                              | entre 460 EUR/kWh (estimation actuelle) et 128 EUR/kWh (estimation 2030 dans la projection optimiste) |
| Assemblage du kit                                                        | entre 500 € et 1500 €                                                                                 |
| Installation du kit dans le véhicule                                     | entre 1400 € et 6100 €                                                                                |

Ce qui nous donne comme borne supérieure pour le coût total de la conversion (pour une batterie de 40 kWh) :

$$
\begin{align*}
& 66500 € + (40 kWh \times 450 €/kWh) + 1500 € + 6100 € \\
& = 66500 € + 18000 € + 1500 € + 6100 € \\
& = 92100 €
\end{align*}
$$

Et comme borne inférieure :

$$
\begin{align*}
& 9500 € + (40 kWh \times 128 €/kWh) + 500 € + 1400 € \\
& = 9500 € + 5120 € + 500 € + 1400 € \\
& = 16520 €
\end{align*}
$$

Cela semble bien différent de la fourchette moyenne de 15000 € à 20000 €
avancée sur
[ecologie.gouv.fr](https://www.ecologie.gouv.fr/politiques-publiques/savoir-retrofit-electrique).
Cela pourrait s'expliquer par le fait que l'estimation de l'ADEME prenne en
compte le rétrofit de gros véhicules utilitaires qui ne seraient pas pris en
compte dans l'estimation ecologie.gouv.fr ?

Ceci étant, il semble **difficile de pouvoir estimer un coût moyen en fonction du
gabarit**.

---

### 8. Passer à un deux-roues motorisé

| Implémentée | Faisabilité                                          |
| :---------: | :--------------------------------------------------- |
|     Non     | 🟡 faisable avec une incertitude sur le prix d'achat |

#### Empreinte carbone 🟢

Pour l'empreinte carbone, il est possible d'utiliser le modèle [`transport . deux roues`](https://nosgestesclimat.fr/documentation/transport/deux-roues/)
de NGC pour estimer l'empreinte carbone d'un deux-roues motorisé.
Les types de véhicules sont les suivants :

- Scooter électrique
- Scooter thermique
- Moto (< 250 cm3)
- Moto (> 250 cm3)

Nous pouvons donc envisager de pouvoir modéliser un ou plusieurs de ces types
de véhicules. Si nous arrivons à déterminer le type de trajet effectué
majoritairement par l'utilisateurice, nous pourrions également lui proposer un
type de véhicule adapté : un scooter électrique pour les trajets quotidiens de
moins de 5 km par exemple et une moto pour les trajets plus longs.

> **Remarque** : avec les informations sur la composition du foyer il serait
> également possible de déterminer si le passage de à un deux-roues motorisé
> est envisageable ou non. Par exemple, si l'utilisateurice a plusieurs
> enfants, il est peu probable qu'il puisse passer à un deux-roues motorisé.

#### Coûts 🟡

Tout comme pour l'achat de voiture, la **difficulté résidera dans l'estimation
d'un prix d'achat moyen**. Le reste des coûts (entretien, assurance, etc...)
pourraient être estimés de la même manière que pour une voiture.

---

### 9. Covoiturage

| Implémentée | Faisabilité |
| :---------: | :---------- |
|     Non     | ?           |

Pour modéliser le covoiturage, il est faut décider si nous souhaitons
simplement **diviser les coûts et l'empreinte par le nombre de passagers** ou
**différencier le cas où l'utilisatrice est conductrice ou passagère** en
considérant que la propriétaire à une plus grande responsabilité dans
l'empreinte et que les passagères n'ont pas à payer les coûts de possession et
d'entretien.

#### Empreinte carbone ⚪

#### Coûts ⚪

---

### 10. Utiliser les voiture en libre-service

| Implémentée | Faisabilité |
| :---------: | :---------- |
|     Non     | ?           |

#### Empreinte carbone 🟡

Pour la voiture en libre-service ce pose la même question que pour la location,
à savoir : **comment souhaitons-nous répartir l'empreinte de la construction
?**

L'inconvénient avec le fait d'utiliser le même amortissement que pour la
voiture en location est de ne pas mettre en avant la virtuosité de
l'alternative. Une alternative consisterait à considérer que la durée de vie
d'une voiture en libre-service est plus longue que celle d'une simple location
car plus entretenue, et ainsi avoir une part de l'empreinte de la construction
au km plus faible. Reste à déterminer sa valeur.

#### Coûts 🟡

Selon l'[enquête de
l'ADEME](https://librairie.ademe.fr/mobilite-et-transport/5804-enquete-autopartage-2022.html)
de 2022, le prix médian au mois est de 35 euros et d'environs 50 centimes le
km.

Une première version pourrait simplement utiliser se coût là pour estimer un
coût médian à l'année ($35 \times 12 = 370$), ce qui ne permettrait pas de
différencier le coût des _gros rouleurs_ vs _petits rouleurs_. Ou bien, de
partir d'une base de 50 centimes le km et de le multiplier par le nombre de km
annuels parcourus (possiblement réduit comme pour la location), ce qui
donnerait pour 10000 km annuels un coût de 5000 euros. Nous observons donc un
écart important entre ces deux estimations et il semble nécessaire de trouver
des informations plus précises.

## Notes

### Sur l'utilisation des données de Car Labelling

Une des principales difficultés qui émerge réside dans l'estimation des coûts
et de l'empreinte carbone des alternatives. En effet, le fait d'utiliser des
valeurs moyennes pour le prix d'achat ou la consommation de carburant **ne permet
pas d'avoir le même niveau de précision que pour la voiture actuelle ce qui
peut induire en erreur l'utilisateurice**.

Les [données de Car
Labelling](https://data.ademe.fr/datasets/ademe-car-labelling) pourraient
permettre dans un premier temps d'**affiner les valeurs moyennes en tant que
telles (prix d'achat et consommation moyenne)** et dans un second temps, nous
pouvons imaginer un module permettant de **comparer avec un modèle précis de
voiture**.

> **Remarque** : la sélection pourrait se faire dans la section _Voiture
> cible_. A noter, qu'avec ces nouvelles alternatives, il serait peut-être
> judicieux de renommer cette section pour bien exprimer le fait que
> l'alternative n'est pas nécessairement l'achat d'une nouvelle voiture.

Nous pouvons également envisager, un peu à la manière de [Je change ma
voiture](https://jechangemavoiture.gouv.fr/jcmv/), de proposer à
l'utilisateurice dès le départ de pouvoir sélectionner le modèle de sa voiture
et ainsi pouvoir préremplir la consommation de carburant et le prix d'achat
(même si pour ce dernier, le prix réel d'achat peut varier par rapport au prix
affiché et plus encore pour les voitures d'occasion).

> **Question** : est-ce vraiment utile de complexifier le parcours
> utilisateurice en lui demandant de sélectionner le modèle de sa voiture si au
> final, cela ne permet de préremplir uniquement la consommation de carburant ?

A noter que **rentrer dans ce niveau de détail pourrait porter à confusion pour
les alternatives avec des valeurs estimées moins précises**.

### Sur la différence entre le client autonome et l'intégration dans Agir

Au vu de l'étude des différentes alternatives, il semblerait que le fait
d'avoir des **informations supplémentaire tel que la localisation de
l'utilisateurice, pourrait permettre des estimation plus précises des coûts**.
Par exemple, cela permettrait d'affiner le prix des abonnements de transports
en fonction de la région et de l'âge, ou encore pour le prix de location de
voiture qui peut [grandement
varier](https://www.carigami.fr/magazine/wp-content/uploads/2024/05/CP-tarifs-ete-des-tarifs-en-baisse-en-France-et-a-letranger.pdf)
en fonction de la région (même si la région de location n'est pas
nécessairement la région de résidence).

> **Question** : est-ce que nous souhaitons proposer des estimations plus
> précises en fonction des données disponibles dans la version intégrée dans
> Agir et des moyennes pour la version autonome ? Souhaitons-nous proposer des
> estimations plus précises pour la version autonome et dans ce cas là, poser
> plus de questions ? Rester sur des moyennes pour les deux versions par soucis
> de simplicité et et ne pas tromper l'utilisateurice en lui faisant croire que
> l'estimation est plus précise de ce qu'elle est en réalité ? (voir [ce
> commentaire](https://github.com/incubateur-ademe/nosgestesclimat/issues/816#issuecomment-811246798)).

### Sur le nombre de possibilités

La simple combinaison des différents types de gabarits, de motorisations et de
carburants nous donne déjà 60 possibilités. En rajoutant la possibilité de
l'occasion ou double déjà le nombre de possibilités. Donc **en prenant en
compte toutes les différentes alternatives, nous arrivons à plusieurs centaines
de possibilités**.

Ce qui pose de nombreuses questions :

- **Comment représenter et rendre intelligible toutes ces possibilités pour
  l'utilisateurice ?**
- **Comment implémenter ces différentes alternatives ?** (ex: une règle Publicodes par alternative,
  le gérer dynamiquement dans un wrapper, etc...)
