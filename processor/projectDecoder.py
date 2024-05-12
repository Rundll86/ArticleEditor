import os, shutil, json, zipfile


def run(arg, name):
    if os.path.exists("interpret"):
        shutil.rmtree("interpret")
    os.mkdir("interpret")
    article = {}
    projPath = "output/project/" + name + "/"
    if not os.path.exists(projPath):
        print(os.path.abspath(projPath))
        os.mkdir(projPath)
    zipfile.ZipFile(arg).extractall("interpret")
    os.chdir("interpret")
    mainJson = json.load(open("main.json", encoding="utf8"))
    os.remove("main.json")
    for i in os.listdir("."):
        try:
            current = json.load(open(i, encoding="utf8"))
            article[os.path.splitext(i)[0]] = current
        except:
            shutil.copy(i, "../" + projPath)
    json.dump(article, open("../" + projPath + "article.json", "w", encoding="utf8"))
    json.dump(mainJson, open("../" + projPath + "project.json", "w", encoding="utf8"))
    os.chdir("..")
    shutil.rmtree("interpret")
