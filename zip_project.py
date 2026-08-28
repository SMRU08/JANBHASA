import os
import zipfile

project_dir = r"D:\Additional\PROJECT\JANBHASHA"
zip_path = r"D:\Additional\JANBHASHA.zip"

exclude_dirs = {'venv', 'node_modules', '.expo', '__pycache__', '.git', 'web-build'}
exclude_exts = {'.pyc', '.pyo'}

print(f"Creating zip file at: {zip_path}")
count = 0
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(project_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in exclude_exts or file.endswith('.db-journal'):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, project_dir)
            zipf.write(full_path, os.path.join("JANBHASHA", rel_path))
            count += 1

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"Successfully created: {zip_path}")
print(f"Files included: {count}")
print(f"Archive size: {size_mb:.2f} MB")
