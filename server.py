import flask, os, subprocess, json, shutil

app = flask.Flask(__name__)


def createResponse(status, message):
    return json.dumps({"status": status, "message": message}, ensure_ascii=False)


def saveProjectConfig():
    json.dump(
        projectConfig,
        open("project/config.json", "w", encoding="utf8"),
        ensure_ascii=False,
    )


@app.before_request
def reload():
    global projectConfig, projectJsons
    projectConfig = json.load(open("project/config.json", encoding="utf8"))
    projectJsons = {}
    for i in projectConfig["validDir"]:
        current = json.load(open("project/" + i + "/project.json", encoding="utf8"))
        current["name"] = i
        projectJsons[i] = current


@app.route("/")
def root():
    return flask.redirect("/website/index.html")


@app.route("/website/<path:page>")
def website(page):
    return flask.send_file(os.path.join("website", page))


@app.route("/api/toJson", methods=["post"])
def tojson():
    res = flask.request.form["data"].replace("\n", "").replace(" ", "")
    while "\n" in res or " " in res:
        res = res.replace()
    open("article.txt", "w", encoding="utf8").write(res)
    subprocess.run(["python", "ArticleLoader.py"], shell=True)
    return flask.send_file("article.json")


@app.route("/api/project/<passwd>/<name>", methods=["post"])
def project(passwd, name):
    if passwd != projectConfig["password"]:
        return createResponse(False, "密码不对")
    if name == "add":
        if flask.request.form["name"] in projectConfig["validDir"]:
            return createResponse(False, "文章已存在")
        projectConfig["validDir"].append(flask.request.form["name"])
        os.mkdir("project/" + flask.request.form["name"])
        open(
            "project/" + flask.request.form["name"] + "/article.txt",
            "w",
            encoding="utf8",
        ).close()
        json.dump(
            {
                "title": flask.request.form["title"],
                "author": flask.request.form["author"],
                "info": flask.request.form["info"],
                "file": "article.txt",
            },
            open(
                "project/" + flask.request.form["name"] + "/project.json",
                "w",
                encoding="utf8",
            ),
            ensure_ascii=False,
        )
        saveProjectConfig()
    elif name == "del":
        if flask.request.form["name"] not in projectConfig["validDir"]:
            return createResponse(False, "文章不存在")
        projectConfig["validDir"].remove(flask.request.form["name"])
        shutil.rmtree("project/" + flask.request.form["name"])
        saveProjectConfig()
    elif name == "getall":
        return createResponse(True, list(projectJsons.values()))
    return createResponse(True, "操作成功！")


app.run("0.0.0.0", 25565)
