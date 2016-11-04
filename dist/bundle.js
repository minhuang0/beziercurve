(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * 函数说明: 绘制一个canvas，能够在里面画点和修改点的bezier控制点值,能够导入导出数据
 * 参数说明: args {
 *                 parent: "canvas输入的父类dom节点(必需)",
 *                 width: "canvas的宽度",
 *                 height: "canvas的高度",
 *                 bezierDefaultLength: "bezier控制器默认的长度",
 *                 pointR: "圆点的半径"
 *            };
 * 使用例子: 
 *  var beziercurve = new Beziercurve({
 *      parent: document.getElementsByTagName('body')[0],
 *      width: 700,
 *      height: 400,
 *      bezierDefaultLength: 100,
 *      pointR: 4
 *  });
 *  对外接口: 
 *  exportData: 输出内部所有点的数据
 *  importData: 输入一组数据替换canvas的数据,参数: 接受一个组数组对象
 *  使用例子: 
 *      beziercurve.exportData();
 *      beziercurve.importData(myData);
 * create_by : huangmin0822@163.com
 */
Array.prototype.last = function () {
    return this[this.length - 1];
};

var createCanvas = function createCanvas(canvasWidth, canvasHeight) {
    var canvas = document.createElement('canvas');
    canvas.width = parseInt(canvasWidth);
    canvas.height = parseInt(canvasHeight);
    return canvas;
};

function Beziercurve(_ref) {
    var parent = _ref.parent,
        _ref$canvasWidth = _ref.canvasWidth,
        canvasWidth = _ref$canvasWidth === undefined ? 800 : _ref$canvasWidth,
        _ref$canvasHeight = _ref.canvasHeight,
        canvasHeight = _ref$canvasHeight === undefined ? 500 : _ref$canvasHeight,
        _ref$pointR = _ref.pointR,
        pointR = _ref$pointR === undefined ? 4 : _ref$pointR,
        _ref$bezierDefaultLen = _ref.bezierDefaultLength,
        bezierDefaultLength = _ref$bezierDefaultLen === undefined ? 100 : _ref$bezierDefaultLen;

    // 创建canvas 
    var canvas = createCanvas(canvasWidth, canvasHeight);
    parent.appendChild(canvas);

    // 初始化参数 
    var context = canvas.getContext('2d'),
        points = [],
        pointControl = [],


    // 当前点击的点的坐标
    currentPointIdx,


    // 记录document 点击的元素和 按住的按键值
    lastDownTarget,
        keyDownNum = 0,


    //鼠标的x轴和y轴的位置
    x,
        y,


    // 当前points的最后一个元素
    prePoint,


    //是否点击的普通点,是否点击的是控制器的点
    isTouchPoint,
        isTouchControlPoint;

    // canvas mousedown event 用于检测用户时候点击拖拽点
    canvas.addEventListener('mousedown', function (e) {
        setMousePositon(e);
        if (isTouchPoint.pointIsExist) {
            movePoint(points, isTouchPoint.currentPointIdx);
        } else if (isTouchControlPoint.pointIsExist) {
            roateLine(pointControl, isTouchControlPoint.currentPointIdx);
        }
    }, false);

    /* 修改全局的x,y轴的位置 */
    function setMousePositon(e) {
        x = e.pageX - canvas.offsetLeft;
        y = e.pageY - canvas.offsetTop;
        prePoint = points[points.length - 1];
        isTouchPoint = pointIsToExist({
            points: points,
            x: x,
            y: y
        });
        isTouchControlPoint = pointIsToExist({
            points: pointControl,
            x: x,
            y: y
        });
    }

    //单击事件,当单击到指定元素时,判断是否创建新的点或者判断键盘按下状态执行删除,创建
    canvas.addEventListener('click', function (e) {
        setMousePositon(e);
        // 当点击位置存在普通点
        if (isTouchPoint.pointIsExist) {
            if (keyDownNum === 67) {
                showBezierControl(points, isTouchPoint.currentPointIdx);
            } else if (keyDownNum === 68) {
                points.splice(isTouchPoint.currentPointIdx, 1);
            }
        } else if (!isTouchPoint.pointIsExist && !isTouchControlPoint.pointIsExist) {
            // 如果点击空白地方创建新的点 
            // 清空控制bezierControl 
            pointControl = [];
            // 创建普通点
            points.push({
                left: x,
                top: y,
                r: pointR,
                showBezierControl: false,
                bezierPoint: {
                    left: prePoint ? (x + prePoint.left) / 2 : 0,
                    top: prePoint ? (y + prePoint.top) / 2 : 0
                }
            });
            //如果同时当前按住了键盘n的情况下面
            if (keyDownNum === 78) {
                points.last().lineBegin = true;
            }
        }
        //绘制所有的点
        draw();
    });

    //双击事件
    canvas.addEventListener('dblclick', function (e) {
        setMousePositon(e);
        // 当点击位置存在普通点
        if (isTouchPoint.pointIsExist) {
            showBezierControl(points, isTouchPoint.currentPointIdx);
        }
    });

    function showBezierControl(points, idx) {
        // 确定当前的点的下标
        currentPointIdx = idx;
        // 将其他的BezierControl关闭 
        points.forEach(function (point, i) {
            if (i === idx) {
                point.showBezierControl = !point.showBezierControl;
            } else {
                point.showBezierControl = false;
            }
        });
        // 覆盖新的BezierControl位置
        pointControl = [{
            left: points[idx].left - bezierDefaultLength,
            top: points[idx].top,
            r: points[idx].r
        }, {
            left: points[idx].left + bezierDefaultLength,
            top: points[idx].top,
            r: points[idx].r
        }];
        // 重绘
        draw();
    };

    // 循环所有的点,遍历点击位置是否存在
    function pointIsToExist(args) {
        var allPoints = args.points,
            x = args.x,
            y = args.y,
            pointIsExist = false,
            currentPointIdx;
        allPoints.forEach(function (point, idx) {
            if (y > point.top - point.r && y < point.top + point.r && x > point.left - point.r && x < point.left + point.r) {
                pointIsExist = true;
                currentPointIdx = idx;
            }
        });
        return { pointIsExist: pointIsExist, currentPointIdx: currentPointIdx };
    };

    //当点击的是控制BezierControl点时将其移动并改变bezier值 
    function roateLine(controlPoints, idx) {
        document.onmousemove = function (e) {
            setMousePositon(e);
            var prePoint = points[currentPointIdx - 1],
                nextPoint = points[currentPointIdx + 1],
                currentPoint = points[currentPointIdx];
            controlPoints.forEach(function (point, i) {
                if (i === idx) {
                    point.left = x;
                    point.top = y;
                } else {
                    point.left = 2 * points[currentPointIdx].left - x;
                    point.top = 2 * points[currentPointIdx].top - y;
                }
            });
            if (keyDownNum === 17) {
                if (prePoint && idx === 0) {
                    points[currentPointIdx].bezierPoint.left = (prePoint.left + currentPoint.left) / 2 + (controlPoints[0].left - currentPoint.left + bezierDefaultLength);
                    currentPoint.bezierPoint.top = (prePoint.top + currentPoint.top) / 2 + (controlPoints[0].top - currentPoint.top);
                } else if (nextPoint && idx === 1) {
                    nextPoint.bezierPoint.left = (nextPoint.left + currentPoint.left) / 2 + (controlPoints[1].left - currentPoint.left - bezierDefaultLength);
                    nextPoint.bezierPoint.top = (nextPoint.top + currentPoint.top) / 2 + (controlPoints[1].top - currentPoint.top);
                }
            } else {
                if (prePoint) {
                    points[currentPointIdx].bezierPoint.left = (prePoint.left + currentPoint.left) / 2 + (controlPoints[0].left - currentPoint.left + bezierDefaultLength);
                    currentPoint.bezierPoint.top = (prePoint.top + currentPoint.top) / 2 + (controlPoints[0].top - currentPoint.top);
                }
                if (nextPoint) {
                    nextPoint.bezierPoint.left = (nextPoint.left + currentPoint.left) / 2 + (controlPoints[1].left - currentPoint.left - bezierDefaultLength);
                    nextPoint.bezierPoint.top = (nextPoint.top + currentPoint.top) / 2 + (controlPoints[1].top - currentPoint.top);
                }
            }

            draw();
        };
    };

    // 移动普通点的时候修改位置和bezier值
    function movePoint(points, idx) {
        pointControl = [];
        document.onmousemove = function (e) {
            setMousePositon(e);
            var prePoint = points[idx - 1],
                nextPoint = points[idx + 1],
                currentPoint = points[idx];
            currentPoint.left = x;
            currentPoint.top = y;
            if (prePoint && currentPoint.bezierPoint) {
                currentPoint.bezierPoint.left = (x + prePoint.left) / 2;
                currentPoint.bezierPoint.top = (y + prePoint.top) / 2;
            }
            if (nextPoint && nextPoint.bezierPoint) {
                nextPoint.bezierPoint.left = (x + nextPoint.left) / 2;
                nextPoint.bezierPoint.top = (y + nextPoint.top) / 2;
            }
            draw();
        };
    };

    // 根据points ,pointControl来绘制点,线条,控制器
    function draw() {
        // 清除所有的内容
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        for (var idx = 0, pointsLength = points.length; idx < pointsLength; idx++) {
            var point = points[idx];
            // 第1个的情况或者重新开始一条线的下面只移动位置不绘制曲线
            if (idx === 0 || point.lineBegin) {
                context.moveTo(point.left, point.top);
            } else {
                var prePoint = points[idx - 1];
                context.bezierCurveTo(prePoint.left, prePoint.top, point.bezierPoint.left, point.bezierPoint.top, point.left, point.top);
            }
            // 绘制BezierControl控制器 
            if (point.showBezierControl && pointControl.length > 0) {
                context.moveTo(point.left, point.top);
                context.lineTo(pointControl[0].left, pointControl[0].top);
                context.arc(pointControl[0].left, pointControl[0].top, point.r, 0, 2 * Math.PI);
                context.moveTo(pointControl[1].left, pointControl[1].top);
                context.arc(pointControl[1].left, pointControl[1].top, point.r, 0, 2 * Math.PI);
                context.moveTo(pointControl[1].left, pointControl[1].top);
                context.lineTo(point.left, point.top);
            }
            context.stroke();
            context.beginPath();
            // 绘制圆点
            context.arc(point.left, point.top, point.r, 0, 2 * Math.PI);
            context.moveTo(point.left, point.top);
        }
        context.stroke();
    };

    this.exportData = function () {
        return points;
    };
    this.importData = function (data) {
        points = [];
        for (var dataNum = 0; dataNum < data.length; dataNum++) {
            var prePoint = data[dataNum - 1],
                point = data[dataNum];
            points.push({
                left: point.left || 0,
                top: point.top || 0,
                r: point.r || pointR,
                showBezierControl: point.showBezierControl || false,
                bezierPoint: {
                    left: prePoint ? (point.left + prePoint.left) / 2 : 0,
                    top: prePoint ? (point.top + prePoint.top) / 2 : 0
                },
                lineBegin: point.lineBegin || false
            });
        }
        draw();
    };

    // 监听document下面按键的值并记录 
    document.onkeydown = function (e) {
        if (lastDownTarget != canvas) {
            return;
        }
        var keyCode;
        if (window.event) {
            keyCode = e.keyCode;
        } else if (e.which) {
            keyCode = e.which;
        }
        if (keyDownNum === 17 && keyCode === 90) {
            points.pop();
            draw();
        }
        keyDownNum = keyCode;
        console.log(keyDownNum);
    };
    // doucument按下时将全局的按键 keyDownNum清空
    document.onkeyup = function (e) {
        keyDownNum = 0;
    };
    document.onmousedown = function (e) {
        lastDownTarget = e.target;
    };
    // 当触发点击到新的点的情况时,会自动添加onmousemove事件,所以在这添加清除事件 
    document.onmouseup = function () {
        document.onmousemove = null;
    };
}

exports.Beziercurve = Beziercurve;

},{}],2:[function(require,module,exports){
'use strict';

var _beziercurve = require('./beziercurve');

// 实例化构造函数
var beziercurve = new _beziercurve.Beziercurve({
    parent: document.getElementsByClassName('my-canvas')[0]
});

// 导出数据,用到 beziercurve.exportData()方法,并将其存到localStorage 
function exportData() {
    var drawData = beziercurve.exportData();
    if (drawData.length < 1) {
        return;
    }
    var drawHistoryData = JSON.parse(localStorage.getItem('drawHistoryData')) || [];
    drawHistoryData.push(drawData);
    localStorage.setItem('drawHistoryData', JSON.stringify(drawHistoryData));
    getLocalStorageAndShow();
};

//导入数据 用到 beziercurve.importData()方法,参数为Array
function importData() {
    beziercurve.importData(JSON.parse(document.getElementsByName('importData')[0].value));
};

//清除本地localStorage数据
function claertData() {
    localStorage.setItem('drawHistoryData', "[]");
    getLocalStorageAndShow();
};

// 获取本地localStorage数据并创建DOM并渲染到HTML上
function getLocalStorageAndShow() {
    var drawHistoryData = JSON.parse(localStorage.getItem('drawHistoryData')) || [],
        exportDataHistory = document.querySelectorAll('.history')[0];
    exportDataHistory.innerHTML = "";
    var title = document.createElement('p');
    title.innerText = "历史绘制记录";
    var ul = document.createElement('ul');

    for (var dataNum = 0, dataLength = drawHistoryData.length; dataNum < dataLength; dataNum++) {

        var li = document.createElement('li');
        var input = document.createElement('input');
        input.value = JSON.stringify(drawHistoryData[dataNum]);
        li.appendChild(input);
        ul.appendChild(li);
    }
    exportDataHistory.appendChild(title);
    exportDataHistory.appendChild(ul);
};
// 页面进来的时候更新历史记录 
getLocalStorageAndShow();

},{"./beziercurve":1}]},{},[2]);
