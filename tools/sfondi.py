"""
Prepara gli sfondi d'ambiente per le sei categorie.

Le foto di partenza hanno il lato corto di 735 px: portate a tutto schermo nitide
si sgranerebbero. Vengono quindi trattate come fondale cinematografico, sfocato e
scurito, come uno sfondo fuori fuoco dietro il soggetto. Tre vantaggi:

1. l'ingrandimento non si vede, perche' la sfocatura arriva dopo;
2. l'auto ritagliata in primo piano non compete con quella dentro la foto;
3. il testo chiaro dell'interfaccia resta leggibile sopra.

Per ogni categoria si generano due tagli, orizzontale e verticale, cosi' ne' il
desktop ne' il telefono devono deformare l'immagine.

Si esegue dalla radice del repository:  python3 tools/sfondi.py
Serve Pillow:  pip3 install Pillow
"""
from PIL import Image, ImageEnhance, ImageFilter

SORGENTI = 'tools/sfondi-sorgenti'
USCITA = 'FRONTEND/public/images/moods'

# categoria -> (file, tinta del mood, quanto scurire, punto d'interesse verticale 0-1)
# Velo leggero e poco colorato: la leggibilita' la reggono i veli sotto il testo,
# qui conta che si riconosca il luogo. Una tinta forte lo cancellerebbe.
MOOD = {
    'classiche':  ('4.jpg', (58, 42, 30), 0.38, 0.30),   # Ferrari 250 GTO, strada toscana al tramonto
    'supercar':   ('3.jpg', (40, 34, 34), 0.34, 0.35),   # due 911 GT3 RS sul passo alpino
    'suv':        ('5.jpg', (52, 46, 34), 0.34, 0.45),   # dune del deserto
    'hypercar':   ('1.jpg', (16, 26, 36), 0.40, 0.40),   # Ford GT in pista fra le montagne
    'utilitarie': ('6.jpg', (30, 42, 52), 0.36, 0.35),   # Times Square
    'special':    ('2.jpg', (22, 20, 16), 0.44, 0.40),   # Mustang GTD sul lago al crepuscolo
}

MISURE = {'wide': (1800, 1000), 'tall': (900, 1600)}


def ritaglia_per_riempire(im, larghezza, altezza, fuoco_y):
    """Ritaglia mantenendo le proporzioni, tenendo al centro il punto d'interesse."""
    voluto = larghezza / altezza
    w, h = im.size
    attuale = w / h

    if attuale > voluto:                      # sorgente troppo larga: si taglia ai lati
        nuova_w = int(h * voluto)
        sinistra = (w - nuova_w) // 2
        im = im.crop((sinistra, 0, sinistra + nuova_w, h))
    else:                                     # sorgente troppo alta: si taglia sopra e sotto
        nuova_h = int(w / voluto)
        alto = int((h - nuova_h) * fuoco_y)
        alto = max(0, min(h - nuova_h, alto))
        im = im.crop((0, alto, w, alto + nuova_h))

    return im.resize((larghezza, altezza), Image.LANCZOS)


def velo(dimensioni, tinta, intensita):
    """Velo scuro tinto del mood, piu' fitto in basso dove stanno testi e striscia auto."""
    larghezza, altezza = dimensioni
    strato = Image.new('RGBA', dimensioni, tinta + (0,))
    disegno = strato.load()
    for y in range(altezza):
        t = y / max(1, altezza - 1)
        # dall'alto verso il basso il velo si infittisce, cosi' il piede della pagina regge il testo
        alpha = int(255 * intensita * (0.70 + 0.7 * t))
        alpha = min(245, alpha)
        for x in range(larghezza):
            disegno[x, y] = tinta + (alpha,)
    return strato


def prepara(nome, sorgente, tinta, intensita, fuoco_y):
    originale = Image.open(f'{SORGENTI}/{sorgente}').convert('RGB')

    for taglio, (larghezza, altezza) in MISURE.items():
        im = ritaglia_per_riempire(originale, larghezza, altezza, fuoco_y)

        # La sfocatura arriva DOPO l'ingrandimento: e' cosi' che l'ingrandimento sparisce.
        ingrandimento = larghezza / originale.size[0]
        im = im.filter(ImageFilter.GaussianBlur(radius=max(2.4, 2.1 * ingrandimento)))

        # Meno colore e piu' contrasto: il fondale arretra, il primo piano stacca
        im = ImageEnhance.Color(im).enhance(0.88)
        im = ImageEnhance.Contrast(im).enhance(1.06)

        finita = Image.alpha_composite(im.convert('RGBA'), velo((larghezza, altezza), tinta, intensita))
        finita.convert('RGB').save(f'{USCITA}/{nome}-{taglio}.webp', 'WEBP', quality=82, method=6)


if __name__ == '__main__':
    import os
    os.makedirs(USCITA, exist_ok=True)
    for nome, (sorgente, tinta, intensita, fuoco) in MOOD.items():
        prepara(nome, sorgente, tinta, intensita, fuoco)
        print(f'  {nome} <- {sorgente}')
