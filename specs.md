# Document de travail

## Objectif

Ce modèle de calcul a pour but d'être utilisé dans l'application
[Agir](https://agir.beta.gouv.fr/) pour aider les utilisateurices à prendre une
décision éclairée sur le changement de leur voiture. Cela nécessite un moyen de
comparer l'empreinte CO2e ainsi que le coût monétaire de deux véhicule et de
leurs usages.

Le but de ce modèle est donc de permettre le calcul d'une estimation de
l'empreinte carbone d'une voiture (fabrication et usage) ainsi que son coût
monétaire (achat, entretien, carburant, etc.).

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

> Q: Est-ce que l'année est un bon intervalle pour les coûts ? Est-ce que ça
> ne devrait pas être mensuel ou hebdomadaire ?

> Q: A quel point une part du calcul est commun aux deux sorties ?
> Ne serait-il pas plus judicieux d'avoir deux modèles séparés si il n'y a pas
> de sous-calculs communs ?

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
- Poids du véhicule (en kg)
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

### Interrogations

- Comment connaitre le coût du plein/recharge ?
- Comment bien collecter les trajets ?
- Comment bien répartir l'empreinte de la construction en fonction du type
  d'utilisation (location, libre service, etc...) ?
  > Toute l'empreinte est attribuée au propriétaire du véhicule ?
  > Dans NGC, l'empreinte de la construction est amortie au km parcouru.
- Comment gérer les voitures de fonctions ?
- Créer des personas en fonction des types de trajets ?
- **Comment gérer le fait de posséder plusieurs voitures ?**
