# Bonus écologique

https://www.economie.gouv.fr/particuliers/bonus-ecologique

---

## Limite de la modélisation du bonus écologique

Après une première tentative de modélisation, les paramètres nécessaire pour
déterminer l’éligibilité à l’aide semblent trop précis pour être inférés
automatiquement pour chacune des alternatives (achat voiture neuve). En effet,
pour déterminer si une voiture est éligible au bonus écologique, il faut
connaitre entre autre :

- **sa masse** (< 2,4 tonnes)
  Elle pourrait être inférée à partir du gabarit comme c’est le cas pour le
  [calcul de l’empreinte
  carbone](https://agir-voiture.netlify.app/documentation/ngc/transport/voiture/gabarit/berline/poids).
  Cependant, utiliser une masse moyenne en fonction du gabarit pourrait induire
  en erreur en incluant des voitures ayant potentiellement une masse supérieur à
  2,4 tonnes car dans le modèle de NGC le poids d’un SUV est approximé à 2
  tonnes.
- **son prix** (< 47 000 €)
  Tout comme la masse, le prix est estimé en fonction du gabarit et de la
  motorisation. Cependant, ce paramètre peut grandement varier entre deux
  véhicules d’un même gabarit avec la même motorisation.
- **son score environnemental**
  Ce paramètre n’est pas estimable à partir des informations actuelles. Il
  faudrait être en mesure de pouvoir le déterminer à partir de
  [https://score-environnemental-bonus.ademe.fr/](https://score-environnemental-bonus.ademe.fr/)

La nécessité d’avoir ces informations remet une bille dans le fait d’utiliser
CarLabelling pour récupérer les informations à partir d’un modèle de véhicule,
avec les limites suivantes :

- Liste non-exaustive (je sais pas à quel point)
- Ne semble plus être maintenu
- Le calcul du bonus-malus semble ne plus être à jour avec les dernière
  modifications. Cependant, nous pourrions recalculer cette valeur nous même à
  partir des autres informations.
- Incohérence dans les données avec doublons, difficile de déterminer quelle
  modèle considérer comme alternative.
- Problème de perf pour calculer tel quel toutes les alternatives.
- Prix probablement plus d’actualité
