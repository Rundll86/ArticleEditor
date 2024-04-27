const addBoxBtn = document.getElementById("add-box");
const addSelectBoxBtn = document.getElementById("add-select-box");
const geneCodeBtn = document.getElementById("gene-code");
const lineTypes = {
    talk: "talk",
    select: "select",
    end: "end"
};
geneCodeBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(generateArticle());
    geneCodeBtn.innerText = "生成完成！已复制代码！";
    setTimeout(() => {
        geneCodeBtn.innerText = "生成文章代码";
    }, 2000);
});
const geneJsonBtn = document.getElementById("gene-json");
geneJsonBtn.addEventListener("click", () => {
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
                geneJsonBtn.innerText = "编译文章JSON";
            }, 2000);
        }
    });
});
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
                    let offsetx = 0;
                    let offsety = 0;
                    Object.keys(data).forEach(eid => {
                        let e = data[eid];
                        let id;
                        if (e.type === "talk") {
                            id = addBox(e.emoji, e.output, e.content, eid, e.jumpTo);
                        }
                        else if (e.type === "select") {
                            id = addSelectBox(e.emoji, e.output, e.content, eid, e.options);
                        } else {
                            id = addEnd(eid);
                        };
                        lines[id].pos[0] += offsetx;
                        lines[id].pos[1] += offsety;
                        offsetx += 100;
                        offsety += 150;
                    });
                }
            });
        });
    });
    selector.click();
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
    /**
     * @type {HTMLElement}
     */
    let res = document.createElement(tag);
    return {
        result: res,
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
        listener(n, h) {
            this.result.addEventListener(n, h);
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
addBoxBtn.addEventListener("click", () => addBox());
addSelectBoxBtn.addEventListener("click", () => addSelectBox());
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
    if (e.deltaY > 0 ? scaling > 20 : true) { scaling -= e.deltaY * 0.1; };
    msgboxCont.style.transform = `scale(${scaling}%)`;
    let bounding = msgboxCont.getBoundingClientRect();
    msgboxCont.style.transformOrigin = `${e.clientX - bounding.left}px ${e.clientY - bounding.top}px`;
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
            if (!Object.keys(lines).includes(ele.to) && ele.type === lineTypes.talk) { return; };
            let e, targetpos;
            if (ele.type === lineTypes.talk) {
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
            } else if (ele.type === lineTypes.select) {
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
            };
        }
    );
    requestAnimationFrame(updateLines);
};
requestAnimationFrame(updateLines);