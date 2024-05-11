import sys, json


def getLocalStr(target, start, end=0):
    return target[
        len(target) + start if start <= 0 else start - 1 : (
            len(target) + end if end <= 0 else end
        )
    ]


def findStr(target: str, substr):
    return target.index(substr) + 1


if len(sys.argv) < 2:
    sys.argv.append("article.txt")
targetfile = sys.argv[1]
content = open(targetfile, encoding="utf8").read()
print(f"Read < {targetfile}")
try:
    content = content.split("\n")
    for i in range(len(content)):
        while content[i][0] == " ":
            content[i] = content[i][1:]
    temp = ""
    for i in content:
        temp += i
    content = temp
    lines = content.split(";")
    for i in range(len(lines)):
        if len(lines[i]) < 1:
            continue
        while lines[i][0] == " ":
            lines[i] = lines[i][1:]
    lines.remove("") if "" in lines else ""
    result = {}
    dataArgs = []
    for i in lines:
        dataArgs.append(i.split(":"))
    typelist = {"@": "talk", "&": "select", "#": "end", "!": "image", "$": "video"}
    findingOptions = False
    lastFindingOptions: list = None
    for i in dataArgs:
        i: list
        if findingOptions:
            if i[0] == "}":
                findingOptions = False
                continue
            current = {}
            current["label"] = i[0]
            current["jumpTo"] = i[1]
            lastFindingOptions.append(current)
        else:
            current = {}
            currentType = typelist[i[0]]
            current["type"] = currentType
            if currentType == "talk":
                current["output"] = i[2]
                current["emoji"] = i[3]
                current["content"] = i[4]
                current["jumpTo"] = i[5]
            elif currentType == "select":
                current["output"] = i[2]
                current["emoji"] = i[3]
                current["content"] = i[4]
                current["options"] = [{"label": i[5][1:], "jumpTo": i[6]}]
                findingOptions = True
                lastFindingOptions = current["options"]
            elif currentType == "end":
                current["jumpTo"] = i[2]
            elif currentType == "image":
                current["src"] = i[2]
                current["jumpTo"] = i[3]
            elif currentType == "video":
                current["src"] = i[2]
                current["jumpTo"] = i[3]
            result[i[1]] = current
    json.dump(result, open("article.json", "w", encoding="utf8"), ensure_ascii=False)
    print("Exported output > article.json")
except Exception as e:
    print("Export failed!")
    print(e)
