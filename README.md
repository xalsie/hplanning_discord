# hplanning_discord

> Description : Module NodeJs Hyper Planning in discord

## Command :

```
$/> !planning {slam/sisr/all}
```

## Command admin :

```
$/> !first
$/> !uuid {slam/sisr} {uuid}
```

## Version V2.7.2 (27 sept. 2021)

-  [x] Ajout progression du cours
-  [x] Ajout numéro de version dans le message
-  [x] FIX erreur sur la taille du message
-  [x] FIX parametre de commande en minuscule
-  [x] Vérifier si hyperplanning indisponnible
-  [x] Afficher en rouge les cours reporté/Annulé

## Version 0.2.0 (23 sept. 2021)

-  [x] Mise à jour automatique du planning
	```
	- 15 minutes pendant les horaires de cours
	- 120 minutes hors les horaires de cours
	```
-  [x] Mise à jour du design
-  [x] Ajout la possibilité d'actualisé les deux plannings avec une commande

## Version 0.1.0 (15 sept. 2021)

-  [x] Recupere le planning sur hyperplanning (http)
	```
	- token - planning SLAM
	- token - planning SISR
	```
-  [x] Channel séparer avec message différent SLAM/SISR
-  [x] uuid message/channel sauvegarder apres reboot
-  [x] Style message iPhone/Android/Bureau