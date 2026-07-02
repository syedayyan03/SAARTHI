import os, sys, json, time, shutil, zipfile, subprocess, warnings, argparse
import urllib.request
warnings.filterwarnings("ignore")

# ─── CONFIG ─────────────────────────────────────────────────────────────────
CFG = {
    # paths
    "data_dir"     : "data/plantvillage",
    "model_dir"    : "models",
    "model_path"   : "models/plant_disease_model.pth",
    "labels_path"  : "models/class_labels.json",
    "report_path"  : "models/training_report.json",
    "torch_cache"  : "models/torch_cache",   # redirect pretrained-weight cache here
    # model
    "backbone"     : "efficientnet_b0",
    "img_size"     : 224,
    "num_workers"  : 2,
    # training
    "batch_size"   : 32,
    "epochs"       : 25,
    "lr"           : 1e-3,
    "weight_decay" : 1e-4,
    "val_split"    : 0.15,
    "test_split"   : 0.10,
    "freeze_epochs": 5,        # phase-1: backbone frozen, only head trains
    "early_stop"   : 5,
    # LR scheduler
    "lr_patience"  : 3,
    "lr_factor"    : 0.3,
    "min_lr"       : 1e-6,
}

# ─── DISEASE INFO  (severity + plain-English treatment, shown at inference) ──
DISEASE_INFO = {
    "Apple___Apple_scab"                          : ("medium",   "Apply captan/mancozeb at bud break. Remove fallen leaves."),
    "Apple___Black_rot"                           : ("high",     "Prune infected branches. Apply copper fungicides. Remove mummified fruit."),
    "Apple___Cedar_apple_rust"                    : ("medium",   "Apply myclobutanil. Remove nearby cedar/juniper trees if possible."),
    "Apple___healthy"                             : ("none",     "Plant is healthy. No action needed."),
    "Blueberry___healthy"                         : ("none",     "Plant is healthy."),
    "Cherry_(including_sour)___Powdery_mildew"    : ("medium",   "Apply sulfur or potassium bicarbonate sprays. Improve air circulation."),
    "Cherry_(including_sour)___healthy"           : ("none",     "Plant is healthy."),
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ("high","Apply strobilurin fungicides. Use resistant varieties. Rotate crops."),
    "Corn_(maize)___Common_rust_"                 : ("medium",   "Apply fungicides early. Plant resistant hybrids."),
    "Corn_(maize)___Northern_Leaf_Blight"         : ("high",     "Use resistant varieties. Apply propiconazole at first sign."),
    "Corn_(maize)___healthy"                      : ("none",     "Plant is healthy."),
    "Grape___Black_rot"                           : ("high",     "Apply mancozeb/myclobutanil from bud break. Remove infected parts."),
    "Grape___Esca_(Black_Measles)"                : ("high",     "No cure — prune heavily, seal wounds, remove severely infected vines."),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)"  : ("medium",   "Apply copper fungicides. Remove infected leaves promptly."),
    "Grape___healthy"                             : ("none",     "Plant is healthy."),
    "Orange___Haunglongbing_(Citrus_greening)"    : ("critical", "No cure. Remove infected trees immediately. Control Asian citrus psyllid."),
    "Peach___Bacterial_spot"                      : ("medium",   "Apply copper bactericides in fall and spring. Use resistant varieties."),
    "Peach___healthy"                             : ("none",     "Plant is healthy."),
    "Pepper,_bell___Bacterial_spot"               : ("medium",   "Apply copper sprays. Use disease-free seed. Avoid overhead irrigation."),
    "Pepper,_bell___healthy"                      : ("none",     "Plant is healthy."),
    "Potato___Early_blight"                       : ("medium",   "Apply chlorothalonil/mancozeb. Maintain nitrogen nutrition."),
    "Potato___Late_blight"                        : ("critical", "Apply metalaxyl/cymoxanil immediately. Destroy infected plants. Use certified seed."),
    "Potato___healthy"                            : ("none",     "Plant is healthy."),
    "Raspberry___healthy"                         : ("none",     "Plant is healthy."),
    "Soybean___healthy"                           : ("none",     "Plant is healthy."),
    "Squash___Powdery_mildew"                     : ("medium",   "Apply sulfur or neem oil. Improve plant spacing."),
    "Strawberry___Leaf_scorch"                    : ("medium",   "Remove infected leaves. Apply myclobutanil. Improve drainage."),
    "Strawberry___healthy"                        : ("none",     "Plant is healthy."),
    "Tomato___Bacterial_spot"                     : ("medium",   "Apply copper bactericides. Use disease-free transplants. Avoid overhead watering."),
    "Tomato___Early_blight"                       : ("medium",   "Apply chlorothalonil/mancozeb at first sign. Mulch to prevent soil splash."),
    "Tomato___Late_blight"                        : ("critical", "Apply metalaxyl urgently. Destroy infected plants. Do NOT compost."),
    "Tomato___Leaf_Mold"                          : ("medium",   "Improve ventilation. Apply copper fungicides. Use resistant varieties."),
    "Tomato___Septoria_leaf_spot"                 : ("medium",   "Apply chlorothalonil. Remove infected lower leaves. Avoid wetting foliage."),
    "Tomato___Spider_mites Two-spotted_spider_mite": ("medium",  "Apply miticides/neem oil. Increase humidity. Remove heavily infested leaves."),
    "Tomato___Target_Spot"                        : ("medium",   "Apply azoxystrobin. Improve plant spacing. Avoid excess nitrogen."),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus"      : ("high",     "No cure. Control whitefly with insecticides/reflective mulch. Remove infected plants."),
    "Tomato___Tomato_mosaic_virus"                : ("high",     "No cure. Remove infected plants. Disinfect tools. Control aphids and thrips."),
    "Tomato___healthy"                            : ("none",     "Plant is healthy."),
}

# ──────────────────────────────────────────────────────────────────────────
# DATASET HELPERS
# ──────────────────────────────────────────────────────────────────────────

def _flatten(data_dir):
    """Move images from nested subdirs into ImageFolder-compatible structure."""
    candidates = [
        "color",
        "raw/color",
        os.path.join("PlantVillage-Dataset-master", "raw", "color"),
        "plantvillage dataset/color",
        "plantvillage dataset/segmented",
    ]
    for rel in candidates:
        src = os.path.join(data_dir, rel)
        if os.path.isdir(src):
            print(f"  [flatten] Moving '{src}' -> '{data_dir}'")
            for cls in os.listdir(src):
                cls_src = os.path.join(src, cls)
                cls_dst = os.path.join(data_dir, cls)
                if os.path.isdir(cls_src) and not os.path.exists(cls_dst):
                    shutil.move(cls_src, cls_dst)
            try:
                top = os.path.join(data_dir, rel.split("/")[0])
                shutil.rmtree(top, ignore_errors=True)
            except Exception:
                pass
            return True
    return False


def download_dataset(data_dir: str) -> bool:
    """Try to download PlantVillage; return True if data is ready to use."""
    subdirs = [d for d in os.listdir(data_dir)
               if os.path.isdir(os.path.join(data_dir, d))] if os.path.exists(data_dir) else []
    if len(subdirs) >= 5:
        print(f"  [OK] Dataset found  ({len(subdirs)} class folders)")
        return True

    os.makedirs(data_dir, exist_ok=True)

    # ── try Kaggle CLI ──────────────────────────────────────────────────
    print("  [..] Trying Kaggle CLI ...")
    try:
        r = subprocess.run(
            ["kaggle", "datasets", "download",
             "-d", "abdallahalidev/plantvillage-dataset",
             "-p", data_dir, "--unzip"],
            capture_output=True, text=True, timeout=900
        )
        if r.returncode == 0:
            _flatten(data_dir)
            subdirs = [d for d in os.listdir(data_dir)
                       if os.path.isdir(os.path.join(data_dir, d))]
            if len(subdirs) >= 5:
                print(f"  [OK] Kaggle download complete  ({len(subdirs)} class folders)")
                return True
        else:
            print(f"  [!!] Kaggle: {r.stderr.strip()[:150]}")
    except (FileNotFoundError, subprocess.TimeoutExpired) as e:
        print(f"  [!!] Kaggle CLI unavailable: {e}")

    # ── try GitHub zip ──────────────────────────────────────────────────
    url      = "https://github.com/spMohanty/PlantVillage-Dataset/archive/refs/heads/master.zip"
    zip_path = os.path.join(data_dir, "_pv_download.zip")
    print("  [..] Trying GitHub zip ...")
    try:
        def _progress(b, bs, total):
            if total > 0:
                pct = min(b * bs / total * 100, 100)
                print(f"\r      {pct:.0f}%  ({min(b*bs,total)/1e6:.1f}/{total/1e6:.1f} MB)",
                      end="", flush=True)
        urllib.request.urlretrieve(url, zip_path, reporthook=_progress)
        print()
        print("  [..] Extracting ...")
        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(data_dir)
        os.remove(zip_path)
        _flatten(data_dir)
        subdirs = [d for d in os.listdir(data_dir)
                   if os.path.isdir(os.path.join(data_dir, d))]
        if len(subdirs) >= 5:
            print(f"  [OK] GitHub download complete  ({len(subdirs)} class folders)")
            return True
    except Exception as e:
        print(f"  [!!] GitHub download failed: {e}")

    # ── manual instructions ──────────────────────────────────────────────
    print("""
============================================================
            MANUAL DATASET SETUP  (one-time)
============================================================
  Option A - Kaggle  (recommended, full 54,306 images)
    pip install kaggle
    # configure ~/.kaggle/kaggle.json  (API token)
    kaggle datasets download \\
        -d abdallahalidev/plantvillage-dataset
    unzip plantvillage-dataset.zip -d data/plantvillage

  Option B - GitHub clone
    git clone https://github.com/spMohanty/PlantVillage-Dataset
    cp -r PlantVillage-Dataset/raw/color  data/plantvillage

  Expected layout:
    data/plantvillage/
      Apple___Apple_scab/   img001.jpg  img002.jpg  ...
      Apple___Black_rot/    ...
      Tomato___Late_blight/ ...         (38 folders total)
============================================================
""")
    return False


# ──────────────────────────────────────────────────────────────────────────
# DATA TRANSFORMS & LOADERS
# ──────────────────────────────────────────────────────────────────────────

def get_transforms(img_size: int):
    from torchvision import transforms
    MEAN = [0.485, 0.456, 0.406]
    STD  = [0.229, 0.224, 0.225]

    train_tf = transforms.Compose([
        transforms.Resize((img_size + 32, img_size + 32)),
        transforms.RandomCrop(img_size),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(30),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        transforms.RandomGrayscale(p=0.05),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    return train_tf, val_tf


def build_loaders(data_dir: str, cfg: dict):
    from torchvision import datasets
    from torch.utils.data import DataLoader, random_split
    import torch

    _, val_tf = get_transforms(cfg["img_size"])
    full = datasets.ImageFolder(data_dir, transform=val_tf)
    n    = len(full)
    n_te = int(n * cfg["test_split"])
    n_va = int(n * cfg["val_split"])
    n_tr = n - n_va - n_te
    tr_ds, va_ds, te_ds = random_split(
        full, [n_tr, n_va, n_te],
        generator=torch.Generator().manual_seed(42)
    )
    train_tf, _ = get_transforms(cfg["img_size"])
    tr_ds.dataset = datasets.ImageFolder(data_dir, transform=train_tf)

    def make(ds, shuffle):
        return DataLoader(ds, batch_size=cfg["batch_size"], shuffle=shuffle,
                          num_workers=cfg["num_workers"], pin_memory=True)

    loaders = {"train": make(tr_ds, True), "val": make(va_ds, False), "test": make(te_ds, False)}
    print(f"  Classes : {len(full.classes)}")
    print(f"  Images  : train={n_tr}  val={n_va}  test={n_te}")
    return loaders, full.classes, len(full.classes)


# ──────────────────────────────────────────────────────────────────────────
# MODEL
# ──────────────────────────────────────────────────────────────────────────

def build_model(n_classes: int, backbone: str, torch_cache: str):
    """EfficientNet-B0 (or ResNet50) with custom classification head."""
    import torch.nn as nn
    from torchvision import models

    os.makedirs(torch_cache, exist_ok=True)
    os.environ["TORCH_HOME"] = torch_cache   # redirect pretrained-weight cache

    if backbone == "efficientnet_b0":
        weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1
        model   = models.efficientnet_b0(weights=weights)
        in_feat = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.4),
            nn.Linear(in_feat, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(512, n_classes),
        )
    elif backbone == "resnet50":
        weights = models.ResNet50_Weights.IMAGENET1K_V1
        model   = models.resnet50(weights=weights)
        in_feat = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(p=0.4),
            nn.Linear(in_feat, 512),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(512, n_classes),
        )
    else:
        raise ValueError(f"Unknown backbone: {backbone}")
    return model


def freeze_backbone(model, backbone: str):
    head = "classifier" if backbone == "efficientnet_b0" else "fc"
    for name, p in model.named_parameters():
        if not name.startswith(head):
            p.requires_grad = False
    n = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  [Phase-1] Backbone frozen  -  trainable params: {n:,}")


def unfreeze_all(model):
    for p in model.parameters():
        p.requires_grad = True
    n = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  [Phase-2] Full fine-tune   -  trainable params: {n:,}")


# ──────────────────────────────────────────────────────────────────────────
# TRAIN / EVAL LOOPS
# ──────────────────────────────────────────────────────────────────────────

def run_epoch(model, loader, criterion, optimizer, device, training: bool):
    import torch
    model.train() if training else model.eval()
    tot_loss = correct = total = 0
    ctx = torch.enable_grad() if training else torch.no_grad()
    with ctx:
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            if training:
                optimizer.zero_grad()
            out  = model(inputs)
            loss = criterion(out, labels)
            if training:
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
            tot_loss += loss.item() * inputs.size(0)
            correct  += (out.argmax(1) == labels).sum().item()
            total    += inputs.size(0)
    return tot_loss / total, correct / total


# ──────────────────────────────────────────────────────────────────────────
# MAIN TRAIN FUNCTION
# ──────────────────────────────────────────────────────────────────────────

def train(cfg: dict):
    import torch
    import torch.nn as nn
    import torch.optim as optim

    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("=" * 65)
    print("   Plant Disease Detection  -  Model Training")
    print("=" * 65)
    print(f"  Device   : {DEVICE}")
    print(f"  Backbone : {cfg['backbone']}")
    print(f"  Epochs   : {cfg['epochs']}  (freeze first {cfg['freeze_epochs']})")
    print(f"  Batch    : {cfg['batch_size']}   LR: {cfg['lr']}")
    print("=" * 65)

    for d in [cfg["model_dir"], cfg["data_dir"], cfg["torch_cache"]]:
        os.makedirs(d, exist_ok=True)

    # ── 1. Dataset ────────────────────────────────────────────────────
    print("\n[1/5] Dataset")
    if not download_dataset(cfg["data_dir"]):
        sys.exit(1)

    loaders, class_names, n_classes = build_loaders(cfg["data_dir"], cfg)

    with open(cfg["labels_path"], "w") as f:
        json.dump({str(i): n for i, n in enumerate(class_names)}, f, indent=2)
    print(f"  Labels saved -> {cfg['labels_path']}")

    # ── 2. Model ──────────────────────────────────────────────────────
    print("\n[2/5] Building model")
    model = build_model(n_classes, cfg["backbone"], cfg["torch_cache"]).to(DEVICE)
    freeze_backbone(model, cfg["backbone"])

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=cfg["lr"], weight_decay=cfg["weight_decay"]
    )
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", factor=cfg["lr_factor"],
        patience=cfg["lr_patience"], min_lr=cfg["min_lr"]
    )

    # ── 3. Training loop ─────────────────────────────────────────────
    print("\n[3/5] Training")
    print(f"\n{'Ep':>4} {'Phase':<12} {'Tr-Loss':>9} {'Tr-Acc':>8} "
          f"{'Va-Loss':>9} {'Va-Acc':>8} {'LR':>10} {'Time':>7}")
    print("-" * 75)

    best_acc    = 0.0
    best_epoch  = 0
    no_improve  = 0
    history     = []
    phase2_done = False

    for ep in range(1, cfg["epochs"] + 1):
        t0 = time.time()

        if ep == cfg["freeze_epochs"] + 1 and not phase2_done:
            print(f"\n  -> Switching to Phase-2 at epoch {ep}")
            unfreeze_all(model)
            optimizer = optim.AdamW([
                {"params": [p for n, p in model.named_parameters()
                            if not n.startswith("classifier") and not n.startswith("fc")],
                 "lr": cfg["lr"] * 0.1},
                {"params": [p for n, p in model.named_parameters()
                            if n.startswith("classifier") or n.startswith("fc")],
                 "lr": cfg["lr"]},
            ], weight_decay=cfg["weight_decay"])
            scheduler = optim.lr_scheduler.ReduceLROnPlateau(
                optimizer, mode="min", factor=cfg["lr_factor"],
                patience=cfg["lr_patience"], min_lr=cfg["min_lr"]
            )
            phase2_done = True

        phase = "head-only" if ep <= cfg["freeze_epochs"] else "fine-tune"

        tr_loss, tr_acc = run_epoch(model, loaders["train"], criterion, optimizer, DEVICE, True)
        va_loss, va_acc = run_epoch(model, loaders["val"],   criterion, None,      DEVICE, False)
        scheduler.step(va_loss)
        cur_lr = optimizer.param_groups[0]["lr"]
        elapsed = time.time() - t0

        print(f"{ep:>4} {phase:<12} {tr_loss:>9.4f} {tr_acc*100:>7.2f}% "
              f"{va_loss:>9.4f} {va_acc*100:>7.2f}% {cur_lr:>10.2e} {elapsed:>6.1f}s")

        history.append(dict(epoch=ep, phase=phase,
                            train_loss=round(tr_loss,4), train_acc=round(tr_acc,4),
                            val_loss=round(va_loss,4),   val_acc=round(va_acc,4),
                            lr=cur_lr))

        if va_acc > best_acc:
            best_acc   = va_acc
            best_epoch = ep
            no_improve = 0
            torch.save({
                "epoch"      : ep,
                "model_state": model.state_dict(),
                "class_names": class_names,
                "backbone"   : cfg["backbone"],
                "img_size"   : cfg["img_size"],
                "val_acc"    : va_acc,
                "n_classes"  : n_classes,
            }, cfg["model_path"])
            print(f"       *  Best saved  val_acc={va_acc*100:.2f}%")
        else:
            no_improve += 1
            if no_improve >= cfg["early_stop"]:
                print(f"\n  [Early stop] best epoch={best_epoch}  acc={best_acc*100:.2f}%")
                break

    # ── 4. Test evaluation ───────────────────────────────────────────
    print("\n[4/5] Test evaluation")
    ckpt = torch.load(cfg["model_path"], map_location=DEVICE)
    model.load_state_dict(ckpt["model_state"])
    te_loss, te_acc = run_epoch(model, loaders["test"], criterion, None, DEVICE, False)
    print(f"  Test accuracy : {te_acc*100:.2f}%")
    print(f"  Test loss     : {te_loss:.4f}")
    print(f"  Best val acc  : {best_acc*100:.2f}%  (epoch {best_epoch})")

    # ── 5. Save report ───────────────────────────────────────────────
    report = dict(backbone=cfg["backbone"], n_classes=n_classes,
                  best_epoch=best_epoch, best_val_acc=round(best_acc,4),
                  test_acc=round(te_acc,4), test_loss=round(te_loss,4),
                  total_epochs=len(history), history=history,
                  class_names=class_names)
    with open(cfg["report_path"], "w") as f:
        json.dump(report, f, indent=2)

    print("\n[5/5] Files saved")
    print(f"  Model   -> {cfg['model_path']}")
    print(f"  Labels  -> {cfg['labels_path']}")
    print(f"  Report  -> {cfg['report_path']}")
    print("=" * 65)


# ──────────────────────────────────────────────────────────────────────────
# INFERENCE  (import this in your app)
# ──────────────────────────────────────────────────────────────────────────

def predict_disease(image_input, model_dir: str = "models", top_k: int = 3):
    import torch
    from PIL import Image

    model_path = os.path.join(model_dir, "plant_disease_model.pth")
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"No trained model at '{model_path}'. Run  python train_disease_model.py  first.")

    if not hasattr(predict_disease, "_cache"):
        print(f"[Loading model from {model_path}]", file=sys.stderr)
        ckpt = torch.load(model_path, map_location="cpu")
        cache = os.path.join(model_dir, "torch_cache")
        m = build_model(ckpt["n_classes"], ckpt["backbone"], cache)
        m.load_state_dict(ckpt["model_state"])
        m.eval()
        predict_disease._cache = dict(model=m, class_names=ckpt["class_names"],
                                      img_size=ckpt["img_size"])
        print(f"  {ckpt['backbone']}  |  {ckpt['n_classes']} classes  |  val_acc={ckpt['val_acc']*100:.1f}%", file=sys.stderr)

    cache       = predict_disease._cache
    model       = cache["model"]
    class_names = cache["class_names"]
    img_size    = cache["img_size"]

    if isinstance(image_input, str):
        img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, bytes):
        import io
        img = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, Image.Image):
        img = image_input.convert("RGB")
    else:
        raise TypeError("image_input must be a path str, bytes, or PIL.Image")

    _, val_tf = get_transforms(img_size)
    tensor = val_tf(img).unsqueeze(0)

    with torch.no_grad():
        probs = torch.softmax(model(tensor), dim=1)[0]

    top_probs, top_idxs = probs.topk(min(top_k, len(class_names)))
    results = []
    for rank, (prob, idx) in enumerate(zip(top_probs.tolist(), top_idxs.tolist()), 1):
        cls   = class_names[idx]
        parts = cls.split("___")
        plant   = parts[0].replace("_", " ") if parts else cls
        disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
        severity, treatment = DISEASE_INFO.get(cls, ("unknown", "Consult a local agronomist."))
        results.append(dict(
            rank=rank, class_key=cls,
            plant=plant, disease=disease,
            confidence=round(prob, 4),
            is_healthy="healthy" in disease.lower(),
            severity=severity,
            treatment=treatment,
        ))
    return results


# ──────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────

def _print_prediction(results):
    print("\n" + "-" * 60)
    for r in results:
        tag = "HEALTHY" if r["is_healthy"] else f"DISEASE [{r['severity'].upper()}]"
        print(f"\n#{r['rank']}  {r['plant']}  -  {r['disease']}")
        print(f"    Status     : {tag}")
        print(f"    Confidence : {r['confidence']*100:.2f}%")
        if not r["is_healthy"]:
            print(f"    Treatment  : {r['treatment']}")
    print("-" * 60 + "\n")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Plant Disease Detection")
    ap.add_argument("--predict",   type=str, default=None,
                    help="Path to leaf image - runs inference only (no training)")
    ap.add_argument("--data_dir",  type=str, default=CFG["data_dir"])
    ap.add_argument("--epochs",    type=int, default=CFG["epochs"])
    ap.add_argument("--batch",     type=int, default=CFG["batch_size"])
    ap.add_argument("--backbone",  type=str, default=CFG["backbone"],
                    choices=["efficientnet_b0", "resnet50"])
    ap.add_argument("--model_dir", type=str, default=CFG["model_dir"])
    args = ap.parse_args()

    if args.predict:
        print(f"\nPredicting disease for: {args.predict}")
        try:
            _print_prediction(predict_disease(args.predict, model_dir=args.model_dir))
        except FileNotFoundError as e:
            print(f"\n[ERROR] {e}")
            sys.exit(1)
    else:
        cfg = dict(CFG)
        cfg["data_dir"]    = args.data_dir
        cfg["epochs"]      = args.epochs
        cfg["batch_size"]  = args.batch
        cfg["backbone"]    = args.backbone
        cfg["model_dir"]   = args.model_dir
        cfg["model_path"]  = os.path.join(args.model_dir, "plant_disease_model.pth")
        cfg["labels_path"] = os.path.join(args.model_dir, "class_labels.json")
        cfg["report_path"] = os.path.join(args.model_dir, "training_report.json")
        cfg["torch_cache"] = os.path.join(args.model_dir, "torch_cache")
        train(cfg)
