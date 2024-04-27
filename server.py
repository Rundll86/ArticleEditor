import flask, os, subprocess

app = flask.Flask(__name__)


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


app.run("0.0.0.0", 25565)
