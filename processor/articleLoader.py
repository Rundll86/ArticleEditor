import json


def run(arg="article.txt", output="article.json"):
    targetfile = arg
    content = open(targetfile, encoding="utf8").read().replace("\n", "")
    if True:
        # try:
        lines = content.split(";")
        while "" in lines:
            lines.remove("")
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
                    try:
                        current["options"] = [{"label": i[5][1:], "jumpTo": i[6]}]
                    except:
                        current["options"] = []
                    findingOptions = True
                    lastFindingOptions = current["options"]
                    lastI = i[len(i) - 1]
                    if lastI[len(lastI) - 1] == "}":
                        findingOptions = False
                elif currentType == "end":
                    current["jumpTo"] = i[2]
                elif currentType == "image" or currentType == "video":
                    current["src"] = i[2]
                    current["jumpTo"] = i[3]
                result[i[1]] = current
        json.dump(result, open(output, "w", encoding="utf8"), ensure_ascii=False)
        return True
    """except Exception as e:
        print(e)
        return False"""
