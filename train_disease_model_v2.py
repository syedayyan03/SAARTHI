"""
train_disease_model_v2.py
=========================
HIGH-ACCURACY Plant Disease Detection — Transfer Learning
---------------------------------------------------------
Target accuracy : 98–99% on PlantVillage (38 classes, 14 plants)
Backbone        : EfficientNet-B4  (stronger than B0, still fast)
"""

import os, sys, json, time, shutil, zipfile, subprocess, warnings, argparse
import urllib.request
import numpy as np
warnings.filterwarnings("ignore")

# ─── CONFIG ─────────────────────────────────────────────────────────────────
CFG = {
    "data_dir"     : "data/plantvillage",
    "model_dir"    : "models",
    "best_model"   : "models/best_disease_model.pth",
    "last_model"   : "models/last_disease_model.pth",
    "labels_path"  : "models/class_labels.json",
    "report_path"  : "models/training_report.json",
    "torch_cache"  : "models/torch_cache",
    "backbone"     : "efficientnet_b4",
    "img_size"     : 380,
    "num_workers"  : 2,         # safe default
    "batch_size"   : 16,
    "epochs"       : 30,
    "lr"           : 3e-4,
    "weight_decay" : 1e-4,
    "val_split"    : 0.15,
    "test_split"   : 0.10,
    "freeze_epochs": 5,
    "mixup_alpha"       : 0.3,
    "label_smoothing"   : 0.1,
    "use_weighted_loss" : True,
    "tta_steps"         : 5,
    "early_stop"   : 7,
    "min_lr"       : 1e-6,
}

DISEASE_INFO = {
    "Apple___Apple_scab"
        : ("medium",   "Apply captan or mancozeb at bud break. Rake and remove fallen leaves to reduce inoculum."),
    "Apple___Black_rot"
        : ("high",     "Prune out infected branches 8–10 inches below canker. Apply copper-based fungicide. Remove mummified fruit."),
    "Apple___Cedar_apple_rust"
        : ("medium",   "Apply myclobutanil or propiconazole. Remove nearby cedar or juniper trees if possible."),
    "Apple___healthy"
        : ("none",     "Plant is healthy. Maintain regular fertilization and irrigation schedule."),
    "Blueberry___healthy"
        : ("none",     "Plant is healthy."),
    "Cherry_(including_sour)___Powdery_mildew"
        : ("medium",   "Apply sulfur, potassium bicarbonate, or neem oil. Improve air circulation by pruning."),
    "Cherry_(including_sour)___healthy"
        : ("none",     "Plant is healthy."),
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot"
        : ("high",     "Apply strobulurin or triazole fungicides. Use resistant hybrids. Practice crop rotation."),
    "Corn_(maize)___Common_rust_"
        : ("medium",   "Apply fungicides (azoxystrobin) early. Plant resistant hybrids. Monitor humidity levels."),
    "Corn_(maize)___Northern_Leaf_Blight"
        : ("high",     "Use resistant varieties. Apply propiconazole or mancozeb at first symptom. Rotate crops."),
    "Corn_(maize)___healthy"
        : ("none",     "Plant is healthy."),
    "Grape___Black_rot"
        : ("high",     "Apply mancozeb or myclobutanil from bud break to fruit set. Remove mummified berries immediately."),
    "Grape___Esca_(Black_Measles)"
        : ("high",     "No chemical cure. Prune infected wood heavily. Paint cuts with wound sealant. Remove severely infected vines."),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)"
        : ("medium",   "Apply copper-based fungicides. Remove and destroy infected leaves. Improve vineyard air circulation."),
    "Grape___healthy"
        : ("none",     "Plant is healthy."),
    "Orange___Haunglongbing_(Citrus_greening)"
        : ("critical", "No cure exists. Remove and destroy infected trees immediately. Control Asian citrus psyllid vector with systemic insecticides."),
    "Peach___Bacterial_spot"
        : ("medium",   "Apply copper bactericides in fall and early spring. Use resistant varieties. Avoid overhead irrigation."),
    "Peach___healthy"
        : ("none",     "Plant is healthy."),
    "Pepper,_bell___Bacterial_spot"
        : ("medium",   "Apply copper hydroxide sprays. Use certified disease-free transplants. Avoid wetting foliage."),
    "Pepper,_bell___healthy"
        : ("none",     "Plant is healthy."),
    "Potato___Early_blight"
        : ("medium",   "Apply chlorothalonil or mancozeb at first symptoms. Ensure adequate nitrogen. Remove infected lower leaves."),
    "Potato___Late_blight"
        : ("critical", "Apply metalaxyl-mancozeb or cymoxanil immediately. Destroy all infected plants. Do not compost. Use certified seed next season."),
    "Potato___healthy"
        : ("none",     "Plant is healthy."),
    "Raspberry___healthy"
        : ("none",     "Plant is healthy."),
    "Soybean___healthy"
        : ("none",     "Plant is healthy."),
    "Squash___Powdery_mildew"
        : ("medium",   "Apply sulfur, potassium bicarbonate, or neem oil sprays. Improve plant spacing for air circulation."),
    "Strawberry___Leaf_scorch"
        : ("medium",   "Remove infected leaves. Apply myclobutanil. Improve drainage. Avoid overhead watering."),
    "Strawberry___healthy"
        : ("none",     "Plant is healthy."),
    "Tomato___Bacterial_spot"
        : ("medium",   "Apply copper bactericide + mancozeb. Use disease-free transplants. Drip irrigate — avoid wetting leaves."),
    "Tomato___Early_blight"
        : ("medium",   "Apply chlorothalonil or mancozeb at first sign. Mulch around base. Remove infected lower leaves."),
    "Tomato___Late_blight"
        : ("critical", "Apply metalaxyl or cymoxanil urgently. Destroy all infected plants — do NOT compost. Use resistant varieties next season."),
    "Tomato___Leaf_Mold"
        : ("medium",   "Improve greenhouse ventilation. Apply copper fungicide. Remove infected leaves. Use resistant varieties."),
    "Tomato___Septoria_leaf_spot"
        : ("medium",   "Apply chlorothalonil or copper fungicide. Remove and destroy infected lower leaves. Avoid splashing water."),
    "Tomato___Spider_mites Two-spotted_spider_mite"
        : ("medium",   "Apply miticide (abamectin) or neem oil. Increase humidity. Remove heavily infested leaves. Introduce predatory mites."),
    "Tomato___Target_Spot"
        : ("medium",   "Apply azoxystrobin or chlorothalonil. Improve plant spacing. Avoid excess nitrogen fertilization."),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus"
        : ("high",     "No chemical cure. Control whitefly vector with imidacloprid or reflective mulches. Remove and destroy infected plants."),
    "Tomato___Tomato_mosaic_virus"
        : ("high",     "No chemical cure. Remove infected plants immediately. Disinfect tools with bleach. Control aphid and thrips vectors."),
    "Tomato___healthy"
        : ("none",     "Plant is healthy."),
}

def _flatten(data_dir):
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
                s = os.path.join(src, cls)
                d = os.path.join(data_dir, cls)
                if os.path.isdir(s) and not os.path.exists(d):
                    shutil.move(s, d)
            try:
                shutil.rmtree(os.path.join(data_dir, rel.split("/")[0]), ignore_errors=True)
            except Exception:
                pass
            return True
    return False


def download_dataset(data_dir: str) -> bool:
    subdirs = [d for d in os.listdir(data_dir)
               if os.path.isdir(os.path.join(data_dir, d))] if os.path.exists(data_dir) else []
    if len(subdirs) >= 5:
        print(f"  [OK] Dataset found  ({len(subdirs)} class folders)")
        return True
    os.makedirs(data_dir, exist_ok=True)

    print("  [..] Trying Kaggle CLI ...")
    try:
        r = subprocess.run(
            ["kaggle", "datasets", "download",
             "-d", "abdallahalidev/plantvillage-dataset",
             "-p", data_dir, "--unzip"],
            capture_output=True, text=True, timeout=900)
        if r.returncode == 0:
            _flatten(data_dir)
            if len([d for d in os.listdir(data_dir)
                    if os.path.isdir(os.path.join(data_dir, d))]) >= 5:
                print("  [OK] Kaggle download complete")
                return True
        else:
            print(f"  [!!] Kaggle: {r.stderr.strip()[:120]}")
    except (FileNotFoundError, subprocess.TimeoutExpired) as e:
        print(f"  [!!] Kaggle unavailable: {e}")

    url = "https://github.com/spMohanty/PlantVillage-Dataset/archive/refs/heads/master.zip"
    zip_path = os.path.join(data_dir, "_pv.zip")
    print("  [..] Trying GitHub zip ...")
    try:
        def _progress(b, bs, total):
            if total > 0:
                print(f"\r      {min(b*bs,total)/1e6:.1f}/{total/1e6:.1f} MB", end="", flush=True)
        urllib.request.urlretrieve(url, zip_path, reporthook=_progress)
        print()
        with zipfile.ZipFile(zip_path, "r") as z:
            z.extractall(data_dir)
        os.remove(zip_path)
        _flatten(data_dir)
        if len([d for d in os.listdir(data_dir)
                if os.path.isdir(os.path.join(data_dir, d))]) >= 5:
            print("  [OK] GitHub download complete")
            return True
    except Exception as e:
        print(f"  [!!] GitHub failed: {e}")
    return False

def get_transforms(img_size: int):
    from torchvision import transforms
    MEAN = [0.485, 0.456, 0.406]
    STD  = [0.229, 0.224, 0.225]

    train_tf = transforms.Compose([
        transforms.Resize((img_size + 40, img_size + 40)),
        transforms.RandomCrop(img_size),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(45),
        transforms.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4, hue=0.1),
        transforms.RandomGrayscale(p=0.05),
        transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
        transforms.RandomErasing(p=0.1, scale=(0.02, 0.1)),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    tta_tf = transforms.Compose([
        transforms.Resize((img_size + 20, img_size + 20)),
        transforms.RandomCrop(img_size),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    return train_tf, val_tf, tta_tf

def build_loaders(data_dir: str, cfg: dict):
    from torchvision import datasets
    from torch.utils.data import DataLoader, Subset
    import torch

    # Select subset indices (max 100 per class) to avoid loading 180k images on CPU
    temp_ds = datasets.ImageFolder(data_dir)
    targets = np.array(temp_ds.targets)
    indices = []
    for c in range(len(temp_ds.classes)):
        class_indices = np.where(targets == c)[0]
        np.random.seed(42)
        np.random.shuffle(class_indices)
        indices.extend(class_indices[:min(100, len(class_indices))])
    
    indices = np.array(indices)
    n = len(indices)
    
    np.random.seed(42)
    shuffled_idx = np.random.permutation(n)
    n_te = int(n * cfg["test_split"])
    n_va = int(n * cfg["val_split"])
    
    te_indices = indices[shuffled_idx[:n_te]]
    va_indices = indices[shuffled_idx[n_te:n_te+n_va]]
    tr_indices = indices[shuffled_idx[n_te+n_va:]]

    train_tf, val_tf, _ = get_transforms(cfg["img_size"])
    base_train = datasets.ImageFolder(data_dir, transform=train_tf)
    base_val = datasets.ImageFolder(data_dir, transform=val_tf)
    
    tr_ds = Subset(base_train, tr_indices)
    va_ds = Subset(base_val, va_indices)
    te_ds = Subset(base_val, te_indices)

    def make(ds, shuffle):
        return DataLoader(ds, batch_size=cfg["batch_size"], shuffle=shuffle,
                          num_workers=cfg["num_workers"], pin_memory=True)

    loaders = {
        "train": make(tr_ds, True),
        "val":   make(va_ds, False),
        "test":  make(te_ds, False),
    }
    print(f"  Classes : {len(temp_ds.classes)}")
    print(f"  Images  : train={len(tr_indices)}  val={len(va_indices)}  test={len(te_indices)}")
    return loaders, temp_ds.classes, len(temp_ds.classes), [targets[i] for i in indices]

def compute_class_weights(targets, n_classes: int):
    import torch
    counts = np.bincount(targets, minlength=n_classes).astype(float)
    counts = np.maximum(counts, 1)
    weights = 1.0 / counts
    weights = weights / weights.sum() * n_classes
    return torch.FloatTensor(weights)

def build_model(n_classes: int, backbone: str, torch_cache: str):
    import torch.nn as nn
    from torchvision import models

    os.makedirs(torch_cache, exist_ok=True)
    os.environ["TORCH_HOME"] = torch_cache

    if backbone == "efficientnet_b4":
        weights = models.EfficientNet_B4_Weights.IMAGENET1K_V1
        model   = models.efficientnet_b4(weights=weights)
        in_feat = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.4),
            nn.Linear(in_feat, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
            nn.Dropout(p=0.3),
            nn.Linear(512, n_classes),
        )
    elif backbone == "efficientnet_b0":
        weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1
        model   = models.efficientnet_b0(weights=weights)
        in_feat = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(p=0.4),
            nn.Linear(in_feat, 512),
            nn.BatchNorm1d(512),
            nn.GELU(),
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
            nn.GELU(),
            nn.Dropout(p=0.3),
            nn.Linear(512, n_classes),
        )
    else:
        raise ValueError(f"Unknown backbone: {backbone}")
    return model

def freeze_backbone(model, backbone: str):
    head = "fc" if backbone == "resnet50" else "classifier"
    for name, p in model.named_parameters():
        if not name.startswith(head):
            p.requires_grad = False
    n = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  [Phase-1] Backbone frozen  —  trainable params: {n:,}")

def unfreeze_all(model):
    for p in model.parameters():
        p.requires_grad = True
    n = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  [Phase-2] Full fine-tune   —  trainable params: {n:,}")

def mixup_batch(inputs, targets, alpha: float, n_classes: int, device):
    import torch
    lam = np.random.beta(alpha, alpha) if alpha > 0 else 1.0
    batch_size = inputs.size(0)
    idx = torch.randperm(batch_size, device=device)
    mixed_inputs = lam * inputs + (1 - lam) * inputs[idx]
    y_a = torch.zeros(batch_size, n_classes, device=device).scatter_(1, targets.view(-1, 1), 1)
    y_b = torch.zeros(batch_size, n_classes, device=device).scatter_(1, targets[idx].view(-1, 1), 1)
    mixed_targets = lam * y_a + (1 - lam) * y_b
    return mixed_inputs, mixed_targets

def train_epoch(model, loader, criterion_soft, optimizer, device, n_classes, mixup_alpha):
    import torch
    model.train()
    tot_loss = correct = total = 0
    for inputs, labels in loader:
        inputs, labels = inputs.to(device), labels.to(device)
        if mixup_alpha > 0:
            inputs, soft_targets = mixup_batch(inputs, labels, mixup_alpha, n_classes, device)
            optimizer.zero_grad()
            out  = model(inputs)
            log_prob = torch.nn.functional.log_softmax(out, dim=1)
            loss = -(soft_targets * log_prob).sum(dim=1).mean()
            pred = out.argmax(1)
            hard = soft_targets.argmax(1)
            correct += (pred == hard).sum().item()
        else:
            optimizer.zero_grad()
            out  = model(inputs)
            loss = criterion_soft(out, labels)
            correct += (out.argmax(1) == labels).sum().item()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        tot_loss += loss.item() * inputs.size(0)
        total    += inputs.size(0)
    return tot_loss / total, correct / total

def eval_epoch(model, loader, criterion, device):
    import torch
    model.eval()
    tot_loss = correct = total = 0
    with torch.no_grad():
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            out  = model(inputs)
            loss = criterion(out, labels)
            tot_loss += loss.item() * inputs.size(0)
            correct  += (out.argmax(1) == labels).sum().item()
            total    += inputs.size(0)
    return tot_loss / total, correct / total

def train(cfg: dict):
    import torch
    import torch.nn as nn
    import torch.optim as optim

    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("=" * 68)
    print("   HIGH-ACCURACY Plant Disease Detection  —  Training")
    print("=" * 68)
    print(f"  Device     : {DEVICE}")
    print(f"  Backbone   : {cfg['backbone']}")
    print(f"  Image size : {cfg['img_size']}px")
    print(f"  Epochs     : {cfg['epochs']}  (freeze first {cfg['freeze_epochs']})")
    print(f"  Batch      : {cfg['batch_size']}   LR: {cfg['lr']}")
    print("=" * 68)

    for d in [cfg["model_dir"], cfg["data_dir"], cfg["torch_cache"]]:
        os.makedirs(d, exist_ok=True)

    print("\n[1/5] Dataset")
    if not download_dataset(cfg["data_dir"]):
        sys.exit(1)
    loaders, class_names, n_classes, all_targets = build_loaders(cfg["data_dir"], cfg)

    label_map = {str(i): n for i, n in enumerate(class_names)}
    with open(cfg["labels_path"], "w") as f:
        json.dump(label_map, f, indent=2)

    print("\n[2/5] Building model")
    model = build_model(n_classes, cfg["backbone"], cfg["torch_cache"]).to(DEVICE)
    freeze_backbone(model, cfg["backbone"])

    if cfg["use_weighted_loss"]:
        weights = compute_class_weights(all_targets, n_classes).to(DEVICE)
        criterion      = nn.CrossEntropyLoss(weight=weights, label_smoothing=cfg["label_smoothing"])
        criterion_soft = nn.CrossEntropyLoss(weight=weights, label_smoothing=cfg["label_smoothing"])
    else:
        criterion      = nn.CrossEntropyLoss(label_smoothing=cfg["label_smoothing"])
        criterion_soft = criterion

    optimizer = optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=cfg["lr"], weight_decay=cfg["weight_decay"])
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=cfg["epochs"], eta_min=cfg["min_lr"])

    print("\n[3/5] Training")
    print(f"\n{'Ep':>4} {'Phase':<12} {'Tr-Loss':>9} {'Tr-Acc':>8} {'Va-Loss':>9} {'Va-Acc':>8} {'LR':>10} {'Time':>7}")
    print("-" * 75)

    best_acc    = 0.0
    best_epoch  = 0
    no_improve  = 0
    history     = []
    phase2_done = False

    for ep in range(1, cfg["epochs"] + 1):
        t0 = time.time()
        if ep == cfg["freeze_epochs"] + 1 and not phase2_done:
            print(f"\n  -> Switching to Phase-2 (full fine-tune) at epoch {ep}")
            unfreeze_all(model)
            optimizer = optim.AdamW([
                {"params": [p for n, p in model.named_parameters() if not n.startswith("classifier") and not n.startswith("fc")], "lr": cfg["lr"] * 0.1},
                {"params": [p for n, p in model.named_parameters() if n.startswith("classifier") or n.startswith("fc")], "lr": cfg["lr"]},
            ], weight_decay=cfg["weight_decay"])
            scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=cfg["epochs"] - cfg["freeze_epochs"], eta_min=cfg["min_lr"])
            phase2_done = True

        phase = "head-only" if ep <= cfg["freeze_epochs"] else "fine-tune"
        tr_loss, tr_acc = train_epoch(model, loaders["train"], criterion_soft, optimizer, DEVICE, n_classes, cfg["mixup_alpha"])
        va_loss, va_acc = eval_epoch(model, loaders["val"], criterion, DEVICE)
        scheduler.step()
        cur_lr  = optimizer.param_groups[0]["lr"]
        elapsed = time.time() - t0

        print(f"{ep:>4} {phase:<12} {tr_loss:>9.4f} {tr_acc*100:>7.2f}% {va_loss:>9.4f} {va_acc*100:>7.2f}% {cur_lr:>10.2e} {elapsed:>6.1f}s")

        history.append(dict(epoch=ep, phase=phase, train_loss=round(tr_loss,4), train_acc=round(tr_acc,4), val_loss=round(va_loss,4), val_acc=round(va_acc,4), lr=cur_lr))

        ckpt = dict(epoch=ep, model_state=model.state_dict(), class_names=class_names, backbone=cfg["backbone"], img_size=cfg["img_size"], val_acc=va_acc, n_classes=n_classes)
        torch.save(ckpt, cfg["last_model"])

        if va_acc > best_acc:
            best_acc   = va_acc
            best_epoch = ep
            no_improve = 0
            torch.save(ckpt, cfg["best_model"])
            print(f"       *  Best saved  val_acc={va_acc*100:.2f}%")
        else:
            no_improve += 1
            if no_improve >= cfg["early_stop"]:
                print(f"\n  [Early stop] best epoch={best_epoch}  val_acc={best_acc*100:.2f}%")
                break

    print("\n[4/5] Test evaluation  (best checkpoint)")
    ckpt = torch.load(cfg["best_model"], map_location=DEVICE)
    model.load_state_dict(ckpt["model_state"])
    te_loss, te_acc = eval_epoch(model, loaders["test"], criterion, DEVICE)
    print(f"  Test accuracy : {te_acc*100:.2f}%")
    print(f"  Test loss     : {te_loss:.4f}")
    print(f"  Best val acc  : {best_acc*100:.2f}%  (epoch {best_epoch})")

    report = dict(backbone=cfg["backbone"], n_classes=n_classes,
                  best_epoch=best_epoch, best_val_acc=round(best_acc,4),
                  test_acc=round(te_acc,4), test_loss=round(te_loss,4),
                  total_epochs=len(history), history=history,
                  class_names=class_names)
    with open(cfg["report_path"], "w") as f:
        json.dump(report, f, indent=2)
    print("\n[5/5] Files saved")
    print("=" * 68)

def predict_disease(image_input, model_dir: str = "models", top_k: int = 3, use_tta: bool = True):
    import torch
    from PIL import Image

    model_path = os.path.join(model_dir, "best_disease_model.pth")
    if not os.path.exists(model_path):
        model_path = os.path.join(model_dir, "plant_disease_model.pth")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No trained model found in '{model_dir}'.")

    if not hasattr(predict_disease, "_cache"):
        print(f"[Model] Loading from {model_path}", file=sys.stderr)
        ckpt  = torch.load(model_path, map_location="cpu")
        cache = os.path.join(model_dir, "torch_cache")
        m     = build_model(ckpt["n_classes"], ckpt["backbone"], cache)
        m.load_state_dict(ckpt["model_state"])
        m.eval()
        predict_disease._cache = dict(model=m, class_names=ckpt["class_names"], img_size=ckpt["img_size"], backbone=ckpt["backbone"])

    cache       = predict_disease._cache
    model       = cache["model"]
    class_names = cache["class_names"]
    img_size    = cache["img_size"]
    DEVICE      = next(model.parameters()).device

    if isinstance(image_input, str):
        pil_img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, bytes):
        import io
        pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, Image.Image):
        pil_img = image_input.convert("RGB")
    else:
        raise TypeError("image_input must be a file path, bytes, or PIL.Image")

    _, val_tf, tta_tf = get_transforms(img_size)

    if use_tta:
        probs_list = []
        with torch.no_grad():
            t = val_tf(pil_img).unsqueeze(0).to(DEVICE)
            probs_list.append(torch.softmax(model(t), dim=1)[0])
            for _ in range(4):
                t = tta_tf(pil_img).unsqueeze(0).to(DEVICE)
                probs_list.append(torch.softmax(model(t), dim=1)[0])
        probs = torch.stack(probs_list).mean(0)
    else:
        tensor = val_tf(pil_img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            probs = torch.softmax(model(tensor), dim=1)[0]

    top_probs, top_idxs = probs.topk(min(top_k, len(class_names)))
    results = []
    for rank, (prob, idx) in enumerate(zip(top_probs.tolist(), top_idxs.tolist()), 1):
        cls     = class_names[idx]
        parts   = cls.split("___")
        plant   = parts[0].replace("_", " ") if parts else cls
        disease = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
        severity, treatment = DISEASE_INFO.get(cls, ("unknown", "Consult a local agricultural officer."))
        results.append(dict(
            rank=rank, class_key=cls,
            plant=plant, disease=disease,
            confidence=round(prob, 4),
            is_healthy="healthy" in disease.lower(),
            severity=severity,
            treatment=treatment,
        ))
    return results

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--predict",   type=str,   default=None)
    ap.add_argument("--no_tta",    action="store_true")
    ap.add_argument("--top_k",     type=int,   default=3)
    ap.add_argument("--data_dir",  type=str,   default=CFG["data_dir"])
    ap.add_argument("--model_dir", type=str,   default=CFG["model_dir"])
    ap.add_argument("--epochs",    type=int,   default=CFG["epochs"])
    ap.add_argument("--batch",     type=int,   default=CFG["batch_size"])
    ap.add_argument("--backbone",  type=str,   default=CFG["backbone"])
    ap.add_argument("--no_mixup",  action="store_true")
    args = ap.parse_args()

    if args.predict:
        results = predict_disease(args.predict, model_dir=args.model_dir, top_k=args.top_k, use_tta=not args.no_tta)
        print(json.dumps(results, indent=2))
    else:
        cfg = dict(CFG)
        cfg["data_dir"]    = args.data_dir
        cfg["model_dir"]   = args.model_dir
        cfg["epochs"]      = args.epochs
        cfg["batch_size"]  = args.batch
        cfg["backbone"]    = args.backbone
        cfg["mixup_alpha"] = 0.0 if args.no_mixup else CFG["mixup_alpha"]
        train(cfg)
