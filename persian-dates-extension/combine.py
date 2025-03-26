import os

src_dir = "src"
output_file = "combined.txt"
extensions = (".ts", ".css", ".html")

with open(output_file, "w", encoding="utf-8") as out:
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(extensions):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    code = f.read()
                out.write(f"{file}\n{code}\n+++++\n")
