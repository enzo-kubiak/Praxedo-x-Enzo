# Prompts IA utilisés

Ce fichier documente les prompts utilisés avec l'IA générative (Claude & Gemini) dans le cadre de ce projet,
conformément aux consignes de l'exercice Praxedo.

---



**Contexte :** Démarrage du projet

**Prompt :**
> Je voudrais faire un projet de gestion de fichiers en micro-service pour l'entreprise Praxedo.
> L'application doit impérativement s'inscrire dans un écosystème Java / Spring Boot / React, et utiliser un antivirus par API pour scanner les fichiers
> Je ne sais pas s'il y a des templates SpringBoot pour le traitement de fichier.
> Il faudrait que je fasse une interface en react mais je n'ai jamais utilisé ce langage donc je voudrais que tu me guide pour développer le front.
>J'ai déjà une base sur docker avec deux instances back et un nginx pour avoir un load balancer, et minIO pour le stockage des fichiers. Qu'en penses-tu?
> Aussi, pour le front, je voudrais créer une page de contact sur l'interface, afficher les fichiers, en grisant ceux qui ne sont pas encore analysés par l'antivirus en API, et afficher les détails des fichiers (type, taille, date...).
> Quelles solution pour l'antivirus me conseilles-tu?

**Réponse obtenue :** proposition de ClamAV + question sur l'existant.

---
**Prompt sur une autre IA:**
> Que penses-tu de Clamav pour vérifier des fichiers de tous types via API ?

**Réponse obtenue :** Validation du choix

**Prompt :**
> Pour l'antivirus : partons sur clamAV oui.
> Voici mon existant [capture de l'indentation VScode]. 

**Réponse :** Validation, proposition d'ajout des fichiers ClamAV, question sur le contenu des fichiers java

**Prompt :** contenu des principaux fichiers java

**Réponse :** ajout de postgre, intégration de l'api clamAV, liste des dépendances java, proposition de passer au front
---


**Prompt :**
> Continuer

**Résultat :** Génération des fichiers du frontend React et proposition d'indentation front


**Prompt Gemini:** quelles sont les images disponibles pour clamav car mkodockr/clamav-rest ne fonctionne pas
**Résultat :** liste d'autres images

j'ai ensuite cherché sur DockerHub pour en trouvé une qui n'était pas expirée
Débug d'autres erreurs via recherche web

**Prompt :**
> tous les fichiers sont marqués comme infecté, y aurait-il un problème avec clamav ? J'ai utilisé l'image clamav/clamav car celle que tu m'as conseillé n'était plus disponible

**Résultat :** écriture de `AntivirusService.java` pour utiliser le protocole TCP INSTREAM de clamd :
- Connexion socket TCP sur port 3310
- Suppression de la dépendance WebFlux (plus nécessaire)
- proposition de modification des ports

**Prompt ChatGPT:** quelle est la fonction java pour la lecture asyncrone d'un service externe d'analyse de fichier?

**Résultat :** paramétrage du scheduled

L'IA a été utilisée pour :
- **Architecture** : aide à la décision sur le stack technique (Antivirus, metadata)
- **Scaffolding** : génération du squelette idéal du projet (tous les fichiers React)
- **Debug d'erreurs**


L'IA n'a **pas** été utilisée pour :
- La compréhension du métier (analyse des besoins)
- La validation de la logique de sécurité (contrôle du statut avant téléchargement)

Ont également servi comme base d'informations et de recherche :
- Recherches Google
- Cours de mon école pour un TP micro-services
- Projet scolaire pour Load-Balancer
- certaines bases pour MinIO
