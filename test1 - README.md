# Praxedo x Enzo — Microservice de sécurisation de fichiers

Micro-service de gestion de fichiers sécurisés avec analyse antivirus obligatoire avant tout téléchargement.

## Démarrage rapide

```bash
git clone https://github.com/enzo-kubiak/Praxedo-x-Enzo
docker compose up --build
```

L'application est disponible sur **http://localhost** après environ 2-4 minutes (le temps que ClamAV charge ses signatures).

| Service         | URL                        |
|-----------------|----------------------------|
| Interface React | http://localhost           |
| API REST        | http://localhost/api       |
| MinIO Console   | http://localhost:9001      |
| Backend #1      | http://localhost:8080      |
| Backend #2      | http://localhost:8081      |

---

## Architecture 

Shcéma disponible "archi.png"


### Flux d'un upload

1. Le client envoie `POST /api/files/upload` (multipart)
2. Spring Boot stocke le fichier dans MinIO et crée une entrée en base avec le statut `PENDING`
3. Un scheduler (`@Scheduled`, toutes les 10s) détecte les fichiers `PENDING`
4. Le fichier est téléchargé depuis MinIO et envoyé à ClamAV REST (`POST /scan`)
5. Le résultat est enregistré en base : `CLEAN` ou `INFECTED`
6. Si infecté : le fichier est supprimé de MinIO
7. Le frontend auto-rafraîchit la liste jusqu'à ce qu'il n'y ait plus de fichiers en attente


---

## API REST

### `POST /api/files/upload`
Envoie un fichier (nom, type, taille, scanstatus par l'antivirus -> téléchargeable ou non, date d'upload).


### `GET /api/files`
Liste tous les fichiers.

### `GET /api/files/{id}`
Détails d'un fichier.

### `GET /api/files/{id}/download`
Télécharge un fichier. Retourne `403` si le statut n'est pas `CLEAN`.

### `POST /api/contact`
Soumet un formulaire de contact retourné dans les logs.

---

## Choix techniques

### ClamAV (antivirus)
Solution open source, dockerisable, sans clé API externe.
Déjà utilisé lors d'un projet scolaire.
Image clamav/clamav intégrée dans le service Scanner (les autres images API de clamav n'étaient plus disponibles sur Docker Hub). 

### MinIO (stockage)
Solution déjà utilisée pendant mon alternance chez Evidian, compatible avec de nombreux outils, notamment Docker.

### PostgreSQL (métadonnées)
Base relationnelle simple, robuste, compatible avec Spring Data JPA. Stocke les métadonnées (nom, taille, type, statut, dates) mais pas les fichiers eux-mêmes. Je l'ai déjà utilisée à l'école, et la documentation est facile d'accès.

### Nginx (load balancer)
Déjà utilisé durant mes alternances et à l'école, léger, simple à configurer, round-robin natif. Simule un déploiement multi-instance pour le load-balancer. Je m'en suis servi pour répondre à la question de haute disponibilité du sujet du test. 

### React + Vite
React imposé par le sujet pour respecter l'écosystème React, Java et Springboot. Je me suis appuyé sur l'intelligence artificielle CLAUDE pour avoir une base frontend. 
Vite m'a été suggéré par CLAUDE.
Auto-refresh : Le `useFiles` rafraîchit la liste de fichiers toutes les 5s tant qu'il existe des fichiers `PENDING` ou `SCANNING`.

### SonarQube
Utilisé en extension dans VS Code pour tester la qualité de code.
Je m'en suis déjà servi pour tout types de projets (Personnels, scolaires ou professionnels)

### Github 
Utilisé pour rendre le projet disponible à l'équipe de recrutement
Je m'en suis déjà servi pour tout types de projets (Personnels, scolaires ou professionnels)

### Autres choix
Le scan asynchrone sépare le temps de l'upload du temps du scan (pour les gros fichiers par exemple).
Statut `SCANNING` : Introduit pour éviter que la deuxième instance Spring Boot reprenne un fichier déjà en cours de scan.
Le téléchargement est refusé (`403 Forbidden`) si le statut n'est pas exactement `CLEAN`. Cette vérification est faite côté serveur, pas seulement côté frontend.
J'ai surtout utilisé Claude AI pour m'aider dans ce projet, mais j'ai également utilisé Gemini, ChatGPT et des recherches internet pour aprendre à utiliser React, vérifier certains choix et debugger certaines erreurs.

---

## Hypothèses formulées

- Un seul bucket MinIO pour tous les utilisateurs. En production, on envisagerait une ségrégation par client.
- Pas d'authentification sur la plateforme. Un vrai service nécessiterait plus de ressources et de temps (Page d'authentification, base de données clients, service d'authentification, traitement des mots de passe oubliés).
- Le scheduler tourne sur chaque instance Spring Boot. Avec deux instances, un fichier `PENDING` pourrait théoriquement être pris en charge par les deux si le passage à `SCANNING` n'est pas atomique. La transaction `@Transactional` + le statut intermédiaire `SCANNING` atténuent ce risque, mais un service de messages (PubSub / Kafka) serait plus robuste en production.
- Les fichiers infectés sont supprimés de MinIO immédiatement après détection. On pourrait les conserver en quarantaine selon les besoins métier.
- Limite upload à 500 MB configurée dans `application.yml` et `nginx.conf`.
- ClamAV télécharge ses signatures au démarrage et met un peu de temps avant d'être opérationnel. Les fichiers sont tous traités comme `infectés` s'ils ne peuvent pas être scannés.

---

## Pistes d'amélioration

### Sécurité
- Authentification 
- Chiffrement des fichiers

### Performance
- Message broker comme Kafka pour éliminer le risque de double-scan et améliorer la réactivité
- Streaming du fichier directement depuis MinIO vers ClamAV sans passer par la RAM du service

### Observabilité
- Monitoring Prometheus + Grafana
- Alerting sur les fichiers infectés

### Production
- Déploiement Kubernetes avec HPA (Horizontal Pod Autoscaler) pour le nombre d'instances nécessaires
- CI/CD : build → test → push image → deploy
- Backup automatique 

