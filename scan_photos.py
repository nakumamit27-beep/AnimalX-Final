import os, shutil, zipfile

out_dir = "/home/runner/workspace/app_storage_1679_photos"
if os.path.exists(out_dir):
    shutil.rmtree(out_dir)
os.makedirs(out_dir, exist_ok=True)

print("⏳ Deep System Scan se photos find ho rahi hain...")

count = 0
search_roots = ["/tmp", "/home/runner/workspace", "/replit-objstore"]

for root_dir in search_roots:
    if os.path.exists(root_dir):
        for root, dirs, files in os.walk(root_dir):
            if "node_modules" in root or ".git" in root or "app_storage_1679_photos" in root:
                continue
            for file in files:
                full_p = os.path.join(root, file)
                try:
                    size = os.path.getsize(full_p)
                    if 10000 < size < 15000000 and not file.endswith((".js", ".json", ".html", ".css", ".map", ".tar.gz", ".zip", ".py", ".cjs")):
                        clean_f = file.replace("/", "_").replace("\\", "_")
                        dest_name = "photo_" + str(count + 1) + "_" + clean_f + ".jpg"
                        shutil.copy2(full_p, os.path.join(outDir if 'outDir' in locals() else out_dir, dest_name))
                        count += 1
                except Exception:
                    pass

print("🎯 TOTAL FOUND & COPIED: " + str(count) + " photos!")

if count > 0:
    zip_path = "/home/runner/workspace/1679_animal_photos.zip"
    if os.path.exists(zip_path):
        os.remove(zip_path)
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in os.listdir(out_dir):
            zipf.write(os.path.join(out_dir, file), file)
    print("✅ SUCCESS! Nayi ZIP file Replit Files panel me ready ho gayi hai!")
