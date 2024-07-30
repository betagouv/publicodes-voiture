<div align="center">
  <h3 align="center">
	<big>Simulateur Changer de voiture</big>
  </h3>
  <p align="center">
   <a href="https://github.com/betagouv/publicodes-voiture/issues">Report Bug</a>
   •
   <a href="https://betagouv.github.io/publicodes-voiture/">API docs</a>
   •
   <a href="https://github.com/betagouv/publicodes-voiture/blob/master/CONTRIBUTING.md">Contribute</a>
   •
   <a href="https://publi.codes">Publicodes</a>
  </p>

Modèle de calcul pour le simulateur d'aide au changement de voiture d'Agir.

</div>

> [!WARNING]
> Ce projet est en cours d'expérimentation et n'est pas encore prêt pour une
> réutilisation en production. Voir le [document de travail](/specs.md) pour
> plus d'informations sur le projet.

## Usage

Ajouter le paquet à vos dépendances :

```
yarn add publicodes-voiture
```

Instancier un nouveau moteur Publicode :

```typescript
import Engine from "publicodes"
import rules from "publicodes-voiture"

const engine = new Engine(rules)

engine.evaluate("empreinte carbone . voiture . essence")
```

### En local

#### Compiler le modèle

> Les règles publicodes du modèle sont disponible dans le workspace
> [`rules/`](https://github.com/betagouv/publicodes-voiture/tree/main/rules).

Pour installer les dépendances et compiler tous les fichiers `.publicodes` en
un seul fichier JSON, il suffit d'exécuter la commande suivante :

```
yarn

yarn build
```

#### Lancer la documentation

> Le code de la documentation est disponible dans le workspace
> [`doc/`](https://github.com/betagouv/publicodes-voiture/tree/main/doc).

Pour lancer l'app React en local permettant de parcourir la documentation du
modèle, il suffit d'exécuter la commande suivante :

```
yarn install --cwd doc

yarn doc
```

## Publier une nouvelle version

Afin de publier une nouvelle version il suffit d'exécuter la commande `npm
version`.
