import os, json

name, title, author, info, file = (
    input("name"),
    input("title"),
    input("author"),
    input("info"),
    "article.txt",
)
os.mkdir("project/" + name)
json.dump(
    {"title": title, "author": author, "info": info, "file": file},
    open("project/" + name + "/project.json", "w", encoding="utf8"),
    ensure_ascii=False,
)
config = json.load(open("project/config.json", encoding="utf8"))
config["validDir"].append(name)
json.dump(config, open("project/config.json", "w", encoding="utf8"), ensure_ascii=False)
