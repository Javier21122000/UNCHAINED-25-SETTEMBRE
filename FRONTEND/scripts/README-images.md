# Immagini delle auto

Le JPG originali sono in `assets-source/cars`. I ritagli trasparenti PNG e WebP sono generati in `public/images/cars` e hanno tutti la stessa inquadratura e linea di appoggio. Il sito carica le WebP per ridurre il traffico; le PNG restano disponibili nella stessa cartella.

Per rigenerarle dopo aver aggiunto nuove JPG:

```sh
python3.12 -m venv .venv-images
.venv-images/bin/python -m pip install 'rembg[cpu]'
.venv-images/bin/python scripts/prepare-car-images.py
```

La prima esecuzione scarica il modello `isnet-general-use`. L'elaborazione delle immagini resta fuori dal bundle React. Le nuove auto devono anche essere associate al rispettivo modello in `src/lib/carMedia.ts`; il catalogo e i prezzi restano alimentati dall'API.
