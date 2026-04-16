# Prompts IA utilisés

Ce fichier documente les prompts utilisés avec l'IA générative (Chat GPT) dans le cadre de la partie architecture de ce projet,
conformément aux consignes de l'exercice Praxedo.

---
**Contexte :** Poursuite du projet développé lors du premier test. Choix d'architecture déjà bien établi dans ma tête.

**Prompt :**
> Je voudrais héberger une architecture d'application qui fonctionne avec Docker sur un serveur Proxmox. J'aimerai pouvoir créer et supprimer facilement l'architecture avec ansible et terraform, pour potentiellement déployer par la suite sur un environement cloud.
> Je voudrais utiliser mes deux disques installés sur mon serveur, existe-t-il une solution pour faire une sorte de load balancing sur des disques en cas de plusieurs uploads de fichiers en simultanés par différents utilisateurs ? J'utilise actuellement minIO.
> Discutons aussi de la mise en oeuvre de la scalabilité horzontale avec kubernetes, pour l'instant, j'ai simplement deux instances back avec un load balancer


**Réponse obtenue :** faisabilité sur Proxmox, minIO distributed mode, ansible + Terraform quasi identique on-prem vs cloud, option kubernetes.


**Prompt :**
> Je voudrais monitorer cette infra avec prometheus et grafana (je souhaite rester sur une solution gratuite). Comment puis-je brancher mes sondes prometheus sur mes services docker ?


**Réponse obtenue :** Actuator

**Prompt IA Claude:**
> Propose moi un template de dashboard grafana, je vais brancher des sondes prometheus sur les services docker pour le projet Praxedo


**Réponse obtenue :** JSON grafana


**Prompt IA Claude:**
> Comment puis-je paramétrer un altering par mail sur grafana ?


**Réponse obtenue :** smtp
