# LiveChat — Guide complet

## Comment ça marche

Tes potes envoient dans le channel Discord #livechat :
- Une vidéo/image/gif → apparaît sur le stream avec coins arrondis, ombre, pp + nom
- Un son mp3 → joue le son avec une animation
- Un texte → s'affiche comme caption
- Vidéo + texte → vidéo avec la blague en dessous

## Ciblage

- **Sans préfixe** → envoie à TOUS les streams connectés
- **!famax** au début → envoie UNIQUEMENT sur le stream de Famax
- **!famax !pote2** → envoie sur Famax ET pote2

## URL de l'overlay

Chaque streamer a sa propre URL avec son nom :
- `https://ton-site.railway.app/?name=famax`
- `https://ton-site.railway.app/?name=pote1`

## Déploiement Railway

1. Va sur **railway.app** → New Project → Deploy from GitHub
2. Variables d'environnement à ajouter :
   - `DISCORD_TOKEN` = ton token bot Discord
   - `CHANNEL_ID` = `1495162702287601694`
   - `DISPLAY_DURATION` = `7000`
3. Railway te donne une URL → c'est l'URL de base

## OBS/Streamlabs — Source Navigateur

- URL : `https://ton-site.railway.app/?name=TON_PSEUDO`
- Largeur : `1920`
- Hauteur : `1080`
- Coche "Transparence du fond"
- Mets la source tout en haut dans tes scènes
