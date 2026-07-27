# todo-list

Une application de liste de tâches (todo list) simple et interactive, faite avec [Next.js](https://nextjs.org).

## Ce que fait l'app

- Ajouter une tâche avec une priorité (Basse / Normale / Haute)
- Cocher une tâche comme terminée
- Modifier ou supprimer une tâche
- Filtrer : Toutes / Actives / Terminées
- Les tâches sont sauvegardées automatiquement dans le navigateur (elles restent après avoir fermé la page)

## Comment lancer l'app sur son ordinateur

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## Comment est organisé le dossier

```
src/app/
  page.tsx       -> la page d'accueil (affiche l'app)
  TodoApp.tsx     -> tout le fonctionnement de la todo list (le vrai code de l'app)
  layout.tsx      -> le cadre commun à toutes les pages (titre, police...)
  globals.css     -> les couleurs et le style général

public/           -> les images/icônes du site

package.json      -> la liste des outils utilisés par le projet
```

Les autres fichiers à la racine (`tsconfig.json`, `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`) sont des fichiers de configuration technique générés automatiquement par Next.js — pas besoin d'y toucher.
