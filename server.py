import flask, os, json, shutil, imghdr, subprocess

app = flask.Flask(__name__)


class ProjectApi:
    arg = {}

    def add(self):
        if self.arg["name"] in projectConfig["validDir"]:
            return createResponse(False, "文章已存在")
        projectConfig["validDir"].append(self.arg["name"])
        os.mkdir("project/" + self.arg["name"])
        open(
            "project/" + self.arg["name"] + "/article.txt",
            "w",
            encoding="utf8",
        ).close()
        json.dump(
            {
                "title": self.arg["title"],
                "author": self.arg["author"],
                "info": self.arg["info"],
                "file": "article.txt",
            },
            open(
                "project/" + self.arg["name"] + "/project.json",
                "w",
                encoding="utf8",
            ),
            ensure_ascii=False,
        )
        saveProjectConfig()
        return createResponse(True, "文章创建成功！")

    def delete(self):
        if self.arg["name"] not in projectConfig["validDir"]:
            return createResponse(False, "文章不存在")
        projectConfig["validDir"].remove(self.arg["name"])
        shutil.rmtree("project/" + self.arg["name"])
        saveProjectConfig()
        return createResponse(True, "文章删除成功！")

    def save(self):
        if self.arg["name"] not in projectConfig["validDir"]:
            return createResponse(False, "文章不存在")
        open(
            "project/"
            + self.arg["name"]
            + "/"
            + readProjectConfig(self.arg["name"])["file"],
            "w",
            encoding="utf8",
        ).write(self.arg["content"])
        return createResponse(True, "文章保存成功！")

    def read(self):
        if self.arg["name"] not in projectConfig["validDir"]:
            return createResponse(False, "文章不存在")
        filename = (
            "project/"
            + self.arg["name"]
            + "/"
            + readProjectConfig(self.arg["name"])["file"]
        )
        os.system(f'python ArticleLoader.py "{filename}"')
        return createResponse(
            True,
            {
                "code": open(
                    filename,
                    encoding="utf8",
                ).read(),
                "json": json.load(open("article.json", encoding="utf8")),
            },
        )

    def getall(self):
        return createResponse(True, list(projectJsons.values()))


project_api = ProjectApi()


def createResponse(status, message):
    return json.dumps({"status": status, "message": message}, ensure_ascii=False)


def readProjectConfig(name):
    return json.load(open("project/" + name + "/project.json", encoding="utf8"))


def saveProjectConfig():
    json.dump(
        projectConfig,
        open("project/config.json", "w", encoding="utf8"),
        ensure_ascii=False,
    )


def is_image(file_path):
    try:
        return imghdr.what(file_path) is not None
    except Exception:
        return False


def is_video(file_path):
    try:
        command = [
            "ffprobe",
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_streams",
            file_path,
        ]
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        video_info = json.loads(result.stdout)
        if "streams" in video_info:
            for stream in video_info["streams"]:
                if "codec_type" in stream and stream["codec_type"] == "video":
                    return True
        return False
    except:
        return False


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
    os.system("python ArticleLoader.py")
    return flask.send_file("article.json")


@app.route("/api/project/<passwd>/<name>", methods=["post"])
def project(passwd, name):
    if passwd != projectConfig["password"]:
        return createResponse(False, "密码错误")
    project_api.arg = flask.request.form.to_dict()
    if name in ProjectApi.__dict__.keys():
        return ProjectApi.__dict__[name](project_api)
    else:
        return createResponse(False, "无效操作类型")


@app.route("/api/uploadMedia", methods=["post"])
def uploadMedia():
    target = flask.request.files["target"]
    path = "mediaAsset/" + target.filename
    target.save(path)
    if not is_image(path) and not is_video(path):
        os.remove(path)
        return createResponse(False, "无效媒体类型")
    return createResponse(True, "上传成功")


@app.route("/getAsset/<name>")
def getAsset(name):
    path = "mediaAsset/" + name
    if os.path.exists(path):
        return flask.send_file(path)
    else:
        return flask.make_response("not found", 404)


app.run("0.0.0.0", 25565)
