const addBoxBtn = document.getElementById("add-box");
const addSelectBoxBtn = document.getElementById("add-select-box");
const addImageBtn = document.getElementById("add-image");
const addVideoBtn = document.getElementById("add-video");
const geneCodeBtn = document.getElementById("gene-code");
const idControlBox = document.getElementById("control");
const projNameInput = document.getElementById("proj-name"),
    projTitleInput = document.getElementById("proj-title"),
    projAuthorInput = document.getElementById("proj-author"),
    projInfoInput = document.getElementById("proj-info");
const projPanel = document.getElementById("proj-panel");
const projPanelHeight = projPanel.clientHeight;
const showPanelBtn = document.getElementById("show-panel");
const showPanelBtnText = showPanelBtn.querySelector("span");
const addProjBtn = document.getElementById("add-proj");
const addProjBtnText = addProjBtn.innerText;
const projInfoBar = document.getElementById("create-panel");
const allMenu = document.getElementById("all-menu");
const workMenuBtn = document.getElementById("work-menu");
const workMenuBtnText = workMenuBtn.innerText;
const delProjBtn = document.getElementById("del-proj");
delProjBtn.addEventListener("click", () => requestProj("delete", { name: ProjBox.selected }, true, () => pullProjs()));
const saveProjBtn = document.getElementById("save-proj");
saveProjBtn.addEventListener("click", () => requestProj("save", { name: ProjBox.selected, content: generateArticle() }, true, () => pullProjs()));
const readProjBtn = document.getElementById("read-proj");
readProjBtn.addEventListener("click", () => requestProj("read", { name: ProjBox.selected }, false, (data) => {
    loadToEditor(data.json);
}));
const projList = document.getElementById("proj-list");
const userPwdInput = document.getElementById("user-pwd");
const loadingText = document.getElementById("loading-text");
const readyText = loadingText.innerText;
const projBoxes = document.getElementById("proj-boxes");
class ProjBox {
    /**
     * @type {Array<ProjBox>}
     */
    static boxes = {};
    static selected = null;
    static reset() {
        this.boxes = {};
        this.selected = null;
        this.update();
        projBoxes.innerHTML = "";
    };
    static update() {
        delProjBtn.disabled = !this.selected;
        saveProjBtn.disabled = !this.selected;
        readProjBtn.disabled = !this.selected;
    };
    result = null;
    selected = false;
    name = null;
    update() {
        if (this.selected) {
            this.result.classList.remove("selected");
            this.selected = false;
            ProjBox.selected = null;
        }
        else {
            Object.values(ProjBox.boxes).forEach(e => {
                e.selected = true;
                e.update();
            });
            this.result.classList.add("selected");
            this.selected = true;
            ProjBox.selected = this.name;
        };
        ProjBox.update();
    };
    constructor(title, name, author, info) {
        this.result = eleTree("div").clsName("proj-box").child(
            eleTree("div").clsName("textleft").child(
                eleTree("span").clsName("proj-title").attr("innerText", title)
            ).child(
                eleTree("span").clsName("proj-name").attr("innerText", name)
            ).child(br()).child(
                eleTree("span").clsName("proj-author").attr("innerText", author)
            ).child(br()).child(
                eleTree("span").clsName("proj-info").attr("innerText", info)
            )
        ).listener("click", () => this.update()).result;
        ProjBox.boxes[name] = this;
        this.name = name;
    }
};
userPwdInput.addEventListener("change", () => { userPasswd = userPwdInput.value; });
var showablePanel = {
    content: {},
    update(name) {
        let { target, internalCallback, status } = this.content[name];
        target.style.height = this.content[name].status ? this.content[name].initHeight + "px" : "0px";
        target.style.transform = `scale(1,${this.content[name].status ? 1 : 0})`;
        target.style.opacity = this.content[name].status ? 1 : 0;
        internalCallback(status);
    },
    create(name, target, controller, status = true, internalCallback = () => { }, userCallback = () => { },) {
        this.content[name] = { status, initHeight: target.clientHeight, target, internalCallback, userCallback };
        this.update(name);
        controller.addEventListener("click", () => {
            let { status } = this.content[name];
            this.content[name].status = !status;
            this.update(name);
            userCallback(!status);
        });
    }
};
showablePanel.create("proj-info-bar", projInfoBar, addProjBtn, true, (status) => {
    if (status) {
        addProjBtn.innerText = "确认新建！";
    } else {
        addProjBtn.innerText = addProjBtnText
    };
}, (status) => {
    if (!status) {
        requestProj("add", {
            name: projNameInput.value,
            title: projTitleInput.value,
            author: projAuthorInput.value,
            info: projInfoInput.value
        }, true, () => pullProjs());
    };
});
showablePanel.create("proj", projPanel, showPanelBtn, false, (status) => {
    if (status) { showPanelBtnText.className = "fa fa-angle-double-up" }
    else {
        showPanelBtnText.className = "fa fa-angle-double-down";
        ProjBox.selected = null;
        ProjBox.reset();
        showablePanel.content["proj-info-bar"].status = false;
        showablePanel.update("proj-info-bar");
    };
});
showablePanel.content["proj-info-bar"].status = false;
showablePanel.update("proj-info-bar");
showablePanel.create("all-menu", allMenu, workMenuBtn, false, (status) => {
    if (status) { workMenuBtn.innerText = "收起"; }
    else {
        workMenuBtn.innerText = workMenuBtnText;
        showablePanel.content["proj"].status = false;
        showablePanel.update("proj");
    };
});
idControlBox.addEventListener("mouseover", () => { moveingBox = true; });
idControlBox.addEventListener("mouseout", () => { moveingBox = false; });
const lineTypes = {
    talk: "talk",
    select: "select",
    end: "end",
    image: "image",
    video: "video"
};
geneCodeBtn.addEventListener("click", () => {
    let oldtext = geneCodeBtn.innerText;
    navigator.clipboard.writeText(generateArticle());
    geneCodeBtn.innerText = "生成完成！已复制代码！";
    setTimeout(() => {
        geneCodeBtn.innerText = oldtext;
    }, 2000);
});
const geneJsonBtn = document.getElementById("gene-json");
geneJsonBtn.addEventListener("click", () => {
    let oldtext = geneJsonBtn.innerText;
    $.ajax({
        url: "/api/toJson",
        type: "post",
        data: {
            data: generateArticle()
        },
        success(data) {
            navigator.clipboard.writeText(JSON.stringify(data));
            geneJsonBtn.innerText = "生成完成！已复制代码！";
            setTimeout(() => {
                geneJsonBtn.innerText = oldtext;
            }, 2000);
        }
    });
});
function loadToEditor(data) {
    reset();
    let offsetx = 0;
    let offsety = 0;
    Object.keys(data).forEach(eid => {
        let e = data[eid];
        let id;
        if (e.type === "talk") {
            id = addBox(e.emoji, e.output, e.content, eid, e.jumpTo);
        } else if (e.type === "select") {
            id = addSelectBox(e.emoji, e.output, e.content, eid, e.options);
        } else if (e.type === "end") {
            id = addEnd(eid);
        } else if (e.type === "image") {
            id = addImage(eid, e.jumpTo, e.src);
        } else if (e.type === "video") {
            id = addVideo(eid, e.jumpTo, e.src);
        };
        lines[id].pos[0] += offsetx;
        lines[id].pos[1] += offsety;
        offsetx += 200;
        offsety += 200;
    });
};
document.getElementById("load-code").addEventListener("click", () => {
    let selector = document.createElement("input");
    selector.type = "file";
    selector.addEventListener("change", () => {
        let reader = new FileReader();
        reader.readAsText(selector.files[0], "utf8");
        reader.addEventListener("load", () => {
            $.ajax({
                url: "/api/toJson",
                type: "post",
                data: {
                    data: reader.result
                },
                success(data) {
                    msgboxCont.innerHTML = "";
                    lines = {};
                    loadToEditor(data);
                }
            });
        });
    });
    selector.click();
});
var userPasswd = "";
function requestProj(type, data, autoMessage = true, callback = (_data) => { }) {
    $.ajax({
        url: "/api/project/" + userPasswd + "/" + type,
        type: "post",
        data,
        success(data) {
            let dataA = JSON.parse(data);
            if (dataA.status) {
                autoMessage ? loadingText.innerText = dataA.message : null;
                callback(dataA.message);
            } else {
                loadingText.innerText = "失败！" + dataA.message;
            };
        },
        error() { loadingText.innerText = "未知错误，请刷新网页重试。"; }
    });
};
function pullProjs(cb = () => { }) {
    requestProj("getall", {}, false, (data) => {
        ProjBox.reset();
        for (let i in data) {
            let current = data[i];
            projBoxes.appendChild(
                new ProjBox(current.title, current.name, current.author, current.info).result
            );
        };
        cb();
    });
};
document.getElementById("pull-proj").addEventListener("click", () => {
    loadingText.innerText = "正在拉取";
    pullProjs(() => {
        loadingText.innerText = readyText;
    });
});
const msgboxCont = document.getElementById("msgbox-c");
const clickedElement = {
    drop: false
};
const dropPos = [0, 0];
/**
 * @type {HTMLCanvasElement}
 */
const lineDraw = document.getElementById("line");
const viewRect = document.body.getBoundingClientRect();
const context = lineDraw.getContext("2d");
function reset() {
    msgboxCont.innerHTML = "";
    lines = {};
    addEnd("#");
};
var lines = {};
var idLast = 1;
var connecting = {
    state: false,
    /**
     * @type {HTMLElement}
     */
    start: null,
    /**
     * @type {HTMLElement}
     */
    preToOK: null,
    preToOKButID: "",
    toTarget: "",
    type: lineTypes.talk
};
var moveingBox = false;
var mosuePos = { x: 0, y: 0 };
var scaling = 100;
function eleTree(tag) {
    return {
        /**
         * @type {HTMLElement}
         */
        result: tag instanceof HTMLElement ? tag : document.createElement(tag),
        css(n, v) {
            this.result.style[n] = v;
            return this;
        },
        attr(n, v) {
            this.result[n] = v;
            return this;
        },
        child(ele) {
            this.result.appendChild(ele.result);
            return this;
        },
        clsName(...classes) {
            classes.forEach((e) => {
                this.result.classList.add(e);
            });
            return this;
        },
        listener(n, h =
            /**
             * 
             * @param {Event} e 
             * @param {HTMLElement} r 
             */
            (e, r) => { }) {
            this.result.addEventListener(n, e => h(e, this.result));
            return this;
        }
    };
};
function br() { return eleTree("br"); };
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};
function addBox(a = "", n = "", c = "", mid = null, to = "") {
    let myid = mid ? mid : "ArticleEditor_AutoGenerate_ID" + idLast;
    let res = eleTree("div").clsName("msgbox").child(
        eleTree("div").attr("innerText", "对话框").clsName("msgbox-title")
    ).child(
        eleTree("div").child(
            eleTree("input").attr("placeholder", "CharacterAvatar").clsName("avatarInput").attr("value", a)
        ).child(
            eleTree("input").attr("placeholder", "CharacterName").clsName("nameInput").attr("value", n)
        ).child(br()).child(
            eleTree("input").attr("placeholder", "Content").clsName("contentInput").attr("value", c)
        ).clsName("contentEdit")
    ).child(
        eleTree("div").clsName("connectStart").child(
            eleTree("span").clsName("fa", "fa-arrow-circle-right")
        ).child(
            eleTree("span").attr("innerText", " 连接")
        ).listener("mousedown", () => {
            connecting.state = true;
            connecting.start = res;
            connecting.type = lineTypes.talk;
            connecting.toTarget = myid;
            lines[myid].to = "";
            clickedElement.drop = false;
        })
    ).listener("mouseover", () => {
        connecting.preToOK = res;
        connecting.preToOKButID = myid;
    }).listener("mouseout", () => {
        connecting.preToOK = null;
    }).listener("mousedown", () => {
        moveingBox = true;
        lines[myid].moving = true;
    }).result;
    msgboxCont.appendChild(res);
    lines[myid] = new Aline(to, res);
    idLast++;
    return myid;
};
function addSelectBox(a = "", n = "", c = "", mid = null, ops = []) {
    function createOption(to = "", label = "") {
        let whoAmI = lines[myid].options.length;
        let optionEle = eleTree("div").child(
            eleTree("input").attr("value", label)
        ).child(
            eleTree("button").attr("innerText", "连接").clsName("optionBox").listener("mousedown", () => {
                connecting.state = true;
                connecting.start = optionEle;
                connecting.type = lineTypes.select;
                connecting.toTarget = myid;
                connecting.whoAmI = whoAmI;
                lines[myid].options[whoAmI].to = "";
                clickedElement.drop = false;
            })
        ).result;
        optionslist.appendChild(optionEle);
        lines[myid].options.push({ start: optionEle.querySelector("button.optionBox"), to, label: optionEle.querySelector("input") });
    };
    let myid = mid ? mid : "ArticleEditor_AutoGenerate_ID" + idLast;
    let res = (eleTree("div").clsName("msgbox").child(
        eleTree("div").attr("innerText", "对话选项").clsName("msgbox-title")
    ).child(
        eleTree("div").child(
            eleTree("input").attr("placeholder", "CharacterAvatar").clsName("avatarInput").attr("value", a)
        ).child(
            eleTree("input").attr("placeholder", "CharacterName").clsName("nameInput").attr("value", n)
        ).child(br()).child(
            eleTree("input").attr("placeholder", "Content").clsName("contentInput").attr("value", c)
        ).clsName("contentEdit")
    ).child(
        eleTree("div").child(
            eleTree("div").clsName("connectStart").child(
                eleTree("span").clsName("fa", "fa-commenting")
            ).child(
                eleTree("span").attr("innerText", " 添加选项")
            ).listener("click", () => {
                createOption();
            })
        ).child(
            eleTree("div").clsName("options")
        )
    ).listener("mouseover", () => {
        connecting.preToOK = res;
        connecting.preToOKButID = myid;
    }).listener("mouseout", () => {
        connecting.preToOK = null;
    }).listener("mousedown", () => {
        moveingBox = true;
        lines[myid].moving = true;
    })).result;
    let optionslist = res.querySelector(".options");
    msgboxCont.appendChild(res);
    lines[myid] = new Aline("", res);
    lines[myid].type = lineTypes.select;
    idLast++;
    ops.forEach(e => {
        createOption(e.jumpTo, e.label);
    });
    return myid;
};
function addEnd(mid) {
    let myid = mid ? mid : "ArticleEditor_AutoGenerate_ID" + idLast;
    idLast++;
    let res = eleTree("div").clsName("msgbox", "end-block").attr("innerText", "结束剧本").listener("mouseover", () => {
        connecting.preToOK = res;
        connecting.preToOKButID = myid;
    }).listener("mouseout", () => {
        connecting.preToOK = null;
    }).listener("mousedown", () => {
        moveingBox = true;
        lines[myid].moving = true;
    }).result;
    msgboxCont.appendChild(res);
    lines[myid] = new Aline("", res);
    lines[myid].type = lineTypes.end;
    return myid;
};
function addImage(mid = null, to = "", src = "") {
    let myid = mid ? mid : "ArticleEditor_AutoGenerate_ID" + idLast;
    let res = eleTree("div").clsName("msgbox").child(
        eleTree("div").attr("innerText", "切换背景图像").clsName("msgbox-title")
    ).child(
        eleTree("div").child(
            eleTree("img").attr("src", src).clsName("imageInput")
        ).child(br()).child(
            eleTree("button").attr("innerText", "上传图像")
        ).clsName("contentEdit")
    ).child(
        eleTree("div").clsName("connectStart").child(
            eleTree("span").clsName("fa", "fa-arrow-circle-right")
        ).child(
            eleTree("span").attr("innerText", " 连接")
        ).listener("mousedown", () => {
            connecting.state = true;
            connecting.start = res;
            connecting.type = lineTypes.talk;
            connecting.toTarget = myid;
            lines[myid].to = "";
            clickedElement.drop = false;
        })
    ).listener("mouseover", () => {
        connecting.preToOK = res;
        connecting.preToOKButID = myid;
    }).listener("mouseout", () => {
        connecting.preToOK = null;
    }).listener("mousedown", () => {
        moveingBox = true;
        lines[myid].moving = true;
    }).result;
    msgboxCont.appendChild(res);
    lines[myid] = new Aline(to, res);
    lines[myid].type = lineTypes.image;
    lines[myid].src = src;
    idLast++;
    return myid;
};
function addVideo(mid = null, to = "", src = "") {
    let myid = mid ? mid : "ArticleEditor_AutoGenerate_ID" + idLast;
    let res = eleTree("div").clsName("msgbox").child(
        eleTree("div").attr("innerText", "播放视频").clsName("msgbox-title")
    ).child(
        eleTree("div").child(
            eleTree("video").attr("src", src).clsName("videoInput")
        ).child(br()).child(
            eleTree("button").attr("innerText", "上传视频")
        ).clsName("contentEdit")
    ).child(
        eleTree("div").clsName("connectStart").child(
            eleTree("span").clsName("fa", "fa-arrow-circle-right")
        ).child(
            eleTree("span").attr("innerText", " 连接")
        ).listener("mousedown", () => {
            connecting.state = true;
            connecting.start = res;
            connecting.type = lineTypes.talk;
            connecting.toTarget = myid;
            lines[myid].to = "";
            clickedElement.drop = false;
        })
    ).listener("mouseover", () => {
        connecting.preToOK = res;
        connecting.preToOKButID = myid;
    }).listener("mouseout", () => {
        connecting.preToOK = null;
    }).listener("mousedown", () => {
        moveingBox = true;
        lines[myid].moving = true;
    }).result;
    msgboxCont.appendChild(res);
    lines[myid] = new Aline(to, res);
    lines[myid].type = lineTypes.video;
    lines[myid].src = src;
    idLast++;
    return myid;
};
addBoxBtn.addEventListener("click", () => addBox());
addSelectBoxBtn.addEventListener("click", () => addSelectBox());
addImageBtn.addEventListener("click", () => addImage());
addVideoBtn.addEventListener("click", () => addVideo());
window.addEventListener("mousedown", () => {
    if (!connecting.state && !moveingBox) { clickedElement.drop = true; };
});
window.addEventListener("mouseup", () => {
    clickedElement.drop = false;
    moveingBox = false;
    Object.values(lines).forEach(e => {
        e.moving = false;
    });
    if (connecting.state) {
        if (connecting.preToOKButID !== connecting.toTarget) {
            if (connecting.type === lineTypes.talk) {
                if (connecting.preToOK) {
                    lines[connecting.toTarget].to = connecting.preToOKButID;
                };
            } else if (connecting.type === lineTypes.select) {
                if (connecting.preToOK) {
                    lines[connecting.toTarget].options[connecting.whoAmI].to = connecting.preToOKButID;
                };
            };
        };
        connecting.state = false;
        connecting.start = null;
    };
});
window.addEventListener("mousemove", (e) => {
    e.preventDefault();
    mosuePos.x = e.clientX;
    mosuePos.y = e.clientY;
    if (clickedElement.drop) {
        dropPos[0] += e.movementX;
        dropPos[1] += e.movementY;
    };
    Object.values(lines).forEach(e2 => {
        e2.start.style.zIndex = "0";
        if (e2.moving && !connecting.state) {
            e2.start.style.zIndex = "1";
            e2.pos[0] += e.movementX;
            e2.pos[1] += e.movementY;
        };
    });
    msgboxCont.style.left = dropPos[0] + "px";
    msgboxCont.style.top = dropPos[1] + "px";
});
window.addEventListener("wheel", (e) => {
    if (!moveingBox) {
        if (e.deltaY > 0 ? scaling > 20 : true) { scaling -= e.deltaY * 0.1; };
        msgboxCont.style.transform = `scale(${scaling}%)`;
        let bounding = msgboxCont.getBoundingClientRect();
        msgboxCont.style.transformOrigin = `${e.clientX - bounding.left}px ${e.clientY - bounding.top}px`;
    };
});
class Aline {
    to = "";
    /**
     * @type {HTMLElement}
     */
    start = null;
    pos = [100, 100];
    type = lineTypes.talk;
    options = [];
    src = "";
    constructor(a, b, t = lineTypes.talk) {
        this.to = a;
        this.start = b;
        this.type = t;
    };
};
function drawArrow(ctx, startX, startY, endX, endY, arrowSize) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    var headLen = arrowSize;
    var angle = Math.atan2(endY - startY, endX - startX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
};
function findSegmentRectangleIntersection(Ox, Oy, w, h, Ex, Ey) {
    const leftX = Ox - w / 2;
    const rightX = Ox + w / 2;
    const topY = Oy - h / 2;
    const bottomY = Oy + h / 2;
    const minX = Math.min(Ox, Ex);
    const maxX = Math.max(Ox, Ex);
    const minY = Math.min(Oy, Ey);
    const maxY = Math.max(Oy, Ey);
    const slope = (Ey - Oy) / (Ex - Ox);
    const yIntercept = Oy - slope * Ox;
    let intersections = [];
    const leftIntersectY = slope * leftX + yIntercept;
    if (leftIntersectY >= topY && leftIntersectY <= bottomY && leftX >= minX && leftX <= maxX && leftIntersectY >= minY && leftIntersectY <= maxY) {
        intersections.push({ x: leftX, y: leftIntersectY });
    };
    const rightIntersectY = slope * rightX + yIntercept;
    if (rightIntersectY >= topY && rightIntersectY <= bottomY && rightX >= minX && rightX <= maxX && rightIntersectY >= minY && rightIntersectY <= maxY) {
        intersections.push({ x: rightX, y: rightIntersectY });
    };
    const topIntersectX = (topY - yIntercept) / slope;
    if (topIntersectX >= leftX && topIntersectX <= rightX && topY >= minY && topY <= maxY && topIntersectX >= minX && topIntersectX <= maxX) {
        intersections.push({ x: topIntersectX, y: topY });
    };
    const bottomIntersectX = (bottomY - yIntercept) / slope;
    if (bottomIntersectX >= leftX && bottomIntersectX <= rightX && bottomY >= minY && bottomY <= maxY && bottomIntersectX >= minX && bottomIntersectX <= maxX) {
        intersections.push({ x: bottomIntersectX, y: bottomY });
    };
    return intersections[0];
};
function generateArticle() {
    let res = "";
    Object.keys(lines).forEach(
        eid => {
            if (eid === "#") { return; };
            /**
             * @type {Aline}
             */
            var e = lines[eid];
            if (e.type === lineTypes.talk) {
                res += "@:";
                res += eid;
                res += ":";
                res += e.start.querySelector("input.nameInput").value;
                res += ":";
                res += e.start.querySelector("input.avatarInput").value;
                res += ":";
                res += e.start.querySelector("input.contentInput").value;
                res += ":";
                res += e.to ? e.to : "#";
                res += ";";
            } else if (e.type === lineTypes.select) {
                res += "&:";
                res += eid;
                res += ":";
                res += e.start.querySelector("input.nameInput").value;
                res += ":";
                res += e.start.querySelector("input.avatarInput").value;
                res += ":";
                res += e.start.querySelector("input.contentInput").value;
                res += ":{";
                e.options.forEach(e => {
                    res += e.label.value;
                    res += ":";
                    res += e.to ? e.to : "#";
                    res += ";";
                });
                res += "};";
            } else if (e.type === lineTypes.end) {
                res += "#:";
                res += eid;
                res += ";";
            } else if (e.type === lineTypes.image) {
                res += "!:";
                res += eid;
                res += ":";
                res += e.src;
                res += ":";
                res += e.to ? e.to : "#";
                res += ";";
            } else if (e.type === lineTypes.video) {
                res += "$:";
                res += eid;
                res += ":";
                res += e.src;
                res += ":";
                res += e.to ? e.to : "#";
                res += ";";
            };
        }
    );
    return res;
};
reset();
function updateLines() {
    lineDraw.width = lineDraw.clientWidth;
    lineDraw.height = lineDraw.clientHeight;
    context.strokeStyle = "gray";
    context.lineWidth = 5;
    context.lineCap = "round";
    context.beginPath();
    context.clearRect(0, 0, lineDraw.width, lineDraw.height);
    context.closePath();
    if (connecting.state) {
        let e = connecting.start.getBoundingClientRect();
        let epos = findSegmentRectangleIntersection(
            e.left + e.width / 2,
            e.top + e.height / 2,
            e.width + 20,
            e.height + 20,
            mosuePos.x,
            mosuePos.y
        );
        epos ? drawArrow(
            context,
            epos.x,
            epos.y,
            mosuePos.x,
            mosuePos.y,
            10
        ) : undefined;
    };
    Object.values(lines).forEach(
        /**
         * 
         * @param {Aline} ele 
         */
        ele => {
            ele.start.style.left = ele.pos[0] + "px";
            ele.start.style.top = ele.pos[1] + "px";
            if (!Object.keys(lines).includes(ele.to) && ele.type !== lineTypes.select) { return; };
            let e, targetpos;
            if (ele.type === lineTypes.select) {
                ele.options.forEach(o => {
                    /**
                     * @type {DOMRect}
                     */
                    e = o.start.getBoundingClientRect();
                    /**
                     * @type {DOMRect}
                     */
                    let target = lines[o.to];
                    if (!target) { return; };
                    target = target.start.getBoundingClientRect();
                    targetpos = findSegmentRectangleIntersection(
                        target.left + target.width / 2,
                        target.top + target.height / 2,
                        target.width + 20,
                        target.height + 20,
                        e.left + e.width / 2,
                        e.top + e.height / 2
                    );
                    let epos = findSegmentRectangleIntersection(
                        e.left + e.width / 2,
                        e.top + e.height / 2,
                        e.width + 20,
                        e.height + 20,
                        target.left + target.width / 2,
                        target.top + target.height / 2
                    );
                    if (targetpos) { drawArrow(context, epos.x, epos.y, targetpos.x, targetpos.y, 10); };
                });
            } else {
                e = ele.start.getBoundingClientRect();
                /**
                 * @type {DOMRect}
                 */
                let target = lines[ele.to].start.getBoundingClientRect();
                targetpos = findSegmentRectangleIntersection(
                    target.left + target.width / 2,
                    target.top + target.height / 2,
                    target.width + 20,
                    target.height + 20,
                    e.left + e.width + 10,
                    e.top + e.height / 2
                );
                let epos = findSegmentRectangleIntersection(
                    e.left + e.width / 2,
                    e.top + e.height / 2,
                    e.width + 20,
                    e.height + 20,
                    target.left + target.width / 2,
                    target.top + target.height / 2
                );
                if (targetpos && epos) { drawArrow(context, epos.x, epos.y, targetpos.x, targetpos.y, 10); };
            };
        }
    );
    requestAnimationFrame(updateLines);
};
requestAnimationFrame(updateLines);