# ✅ Checklist Projet Angular

---

## 🏗️ 1. Configuration de base

- [ ] Créer le projet Angular `standalone`
  ```bash
  ng new <mon-projet> --skip-tests
  ```
- [ ] Ajouter `provideHttpClient` dans `app.config.ts` _(histoire de ne pas l'oublié)_

- [ ] Créer la structure du projet :
  ```text
  src/
   ├── app/
   │    ├── core/           # Services, interceptors, guards
   │    ├── features/       # Fonctionnalités (login, register, dashboard…)
   │    ├── components/     # Composants réutilisables
   │    ├── app.config.ts
   │    └── app.routes.ts
   └── environments/
        ├── environment.ts
        └── environment.dev.ts
        └── environment.prod.ts
  ```
- [ ] Modifié le fichier `tsconfig.app.json`
  - [ ] dans `compilerOptions` rajouter les `paths` avec:
  ```json
  {
    "@core/*": ["./src/app/core/*"],
    "@components/*": ["./src/app/components/*"],
    "@features/*": ["./src/app/features/*"],
    "@env": ["./src/environments/environment.ts"]
  }
  ```
- Modifié le fichier `angular.json`
  - [ ] Modifié `projetcts.<nom-du-projet>.architect.build.configurations.production`
    - [ ] Ajouter la propriété `fileReplacements`avec la valeur:
    ```json
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.prod.ts"
    }
    ```
  - [ ] Modifié `projetcts.<nom-du-projet>.architect.build.configurations.development`
    - [ ] Ajouter la propriété `fileReplacements`avec la valeur:
    ```json
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.dev.ts"
    }
    ```

- [ ] Installer et configurer Prettier
  - [ ] Installer prettier: `npm i prettier -D`
  - [ ] Créer un fichier `.prettierrc` à la racine du projet avec le contenu suivant :

    ```json
    {
      "singleQuote": true,
      "trailingComma": "all",
      "tabWidth": 4,
      "endOfLine": "lf",
      "printWidth": 80,
      "overrides": [
        {
          "files": "*.html",
          "options": {
            "parser": "angular"
          }
        }
      ]
    }
    ```

    - [ ] Ajouter un script dans le `package.json` pour formater le code :

    ```json
    "scripts": {
      "format": "prettier --write \"src/**/*\"",
    }
    ```

    - [ ] Installer l’extension Prettier dans votre éditeur de code

---

## 🛬 2. Internationalization

- [ ] Installer les pacakges
  ```bash
  npm i @ngx-translate/core @ngx-translate/http-loader ngx-translate-messageformat-compiler @messageformat/core
  ```
- [ ] Créer les fichiers de traduction dans `public/i18n`
- [ ] Ajouter le provide dans `src\app\app.config.ts`
- [ ] Configurer la langue par défaut dans `src\app\app.ts`

---

## 🔐 3. Authentification

- [ ] Créer un service `AuthService` avec :
  - [ ] Méthodes `login()`, `register()`, `logout()`
  - [ ] Stockage du token dans `localStorage` _(pour rester connecter même un rafraichissement)_
  - [ ] Signal `token`, `role` lors du login
- [ ] Créer les pages :
  - [ ] `register` → composant `RegisterPage`
  - [ ] `login` → composant `LoginPage`

---

## ⚙️ 4. Interceptors

- [ ] Créer `token.interceptor.ts` :
  - [ ] Ajouter le header `Authorization: Bearer <token>`
- [ ] Créer `error.interceptor.ts` :
  - [ ] Intercepter les erreurs HTTP (401, 403, 500…)
  - [ ] Afficher un message ou rediriger si besoin
- [ ] Enregistrer les interceptors dans `app.config.ts` :
  ```ts
  provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor]));
  ```

---

## 🧭 5. Guards

- [ ] Créer `isConnected.guard.ts` :
  - [ ] Redirige vers page `login` si utilisateur non connecté
- [ ] Créer `isNotConnected.guard.ts` :
  - [ ] Redirige vers `home` si déjà connecté
- [ ] Créer `admin.guard.ts` :
  - [ ] Vérifie le rôle de l’utilisateur via l’AuthService
  - [ ] Redirige vers page `404`

---

## 📚 6. Implémentation par fonctionnalité

- [ ] Définir l'ordre des fonctionnalités à implémenter
- [ ] Pour chaque fonctionnalité :
  - [ ] Créer un dossier dans `features/` (ex: `movie/`, `auth/`...)
  - [ ] Créer le sous-routeur de la fonctionnalité (ex: `movie.routes.ts`, `auth.routes.ts`...)
  - [ ] Ajouter la routes vers le sous-router dans `app.routes.ts` _(avec loadChildren)_
  - [ ] Créer les composants nécessaires (liste, détail, formulaire…) et leur routing _(avec loadComponent)_
  - [ ] Rajouter les traductions dans le fichier de traduction
  - [ ] Ajouter les guards si nécessaire
  - [ ] Créer les services pour les appels API
- [ ] Styler les composants avec SCSS et utiliser des composants réutilisables depuis `components/`
- [ ] Tester chaque fonctionnalité avant de passer à la suivante
