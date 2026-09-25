"""Create consistent transparent car assets from the source JPEG photographs."""

from pathlib import Path

from PIL import Image
from rembg import new_session, remove


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets-source" / "cars"
DESTINATION = ROOT / "public" / "images" / "cars"
CANVAS_SIZE = (1200, 650)
MAX_CAR_SIZE = (1150, 540)
BASELINE = 625


def prepare_image(source: Path, session: object) -> Path:
    with Image.open(source) as original:
        cutout = remove(
            original.convert("RGB"),
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
        ).convert("RGBA")

    visible = cutout.getchannel("A").point(lambda alpha: 255 if alpha > 6 else 0)
    bounds = visible.getbbox()
    if bounds is None:
        raise ValueError(f"No foreground detected in {source.name}")

    car = cutout.crop(bounds)
    car.thumbnail(MAX_CAR_SIZE, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(car, ((CANVAS_SIZE[0] - car.width) // 2, BASELINE - car.height))

    destination = DESTINATION / f"{source.stem.lower()}.png"
    canvas.save(destination, optimize=True)
    canvas.save(destination.with_suffix(".webp"), format="WEBP", quality=90, method=6)
    return destination


def main() -> None:
    DESTINATION.mkdir(parents=True, exist_ok=True)
    sources = sorted(SOURCE.glob("*.jpg"))
    if not sources:
        raise SystemExit(f"No JPEG images found in {SOURCE}")

    session = new_session("isnet-general-use")
    for index, source in enumerate(sources, start=1):
        destination = prepare_image(source, session)
        print(f"[{index}/{len(sources)}] {source.name} → {destination.name}", flush=True)


if __name__ == "__main__":
    main()
