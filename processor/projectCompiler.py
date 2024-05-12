import zipfile, json, os, hashlib, shutil
from . import articleLoader


def calculate_md5(content: str):
    md5 = hashlib.md5()
    if os.path.exists(content):
        with open(content, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                md5.update(chunk)
    else:
        md5.update(content.encode("utf8"))
    return md5.hexdigest()


def run(arg):
    if os.path.exists("build"):
        shutil.rmtree("build")
    os.mkdir("build")
    projPath = "project/" + arg + "/"
    outputFile = zipfile.ZipFile("output/akg/" + arg + ".akg", "w")
    articleLoader.run(projPath + "article.txt")
    fileContent: dict = json.load(open("article.json", encoding="utf8"))
    for ik in fileContent:
        ik: str
        i = fileContent[ik]
        if i["type"] == "image" or i["type"] == "video":
            src = "mediaAsset/" + i["src"]
            if os.path.exists(src) and i["src"] != "":
                currentFile = calculate_md5(src) + os.path.splitext(src)[1]
                shutil.copyfile(src, "build/" + currentFile)
                i["src"] = currentFile
        current = calculate_md5(ik)
        for j in fileContent.values():
            if j["type"] == "select":
                for l in j["options"]:
                    if l["jumpTo"] == ik:
                        l["jumpTo"] = current
            else:
                if j["jumpTo"] == ik:
                    j["jumpTo"] = current
        i["buildName"] = current
    for i in fileContent.values():
        current = i["buildName"]
        del i["buildName"]
        json.dump(
            i,
            open("build/" + current + ".json", "w", encoding="utf8"),
            ensure_ascii=False,
        )
    metaFile = json.load(open(projPath + "project.json", encoding="utf8"))
    resultMetaFile = {"entry": calculate_md5(metaFile["entry"])}
    json.dump(
        resultMetaFile,
        open("build/main.json", "w", encoding="utf8"),
        ensure_ascii=False,
    )
    os.chdir("build")
    for i in os.listdir("."):
        outputFile.write(i)
    outputFile.close()
    os.chdir("..")
    shutil.rmtree("build")
