function Beziercurve(args) {
        var self = this;
        // 创建canvas 
        var canvas = document.createElement('canvas');
        canvas.width = parseInt(args.width) || 800;
        canvas.height = parseInt(args.height) || 500;
        canvas.style.border = "1px solid #d3d3d3";
        args.parent.appendChild(canvas);

        var operation = document.createElement('div');
        var repeal = document.createElement('button');
        repeal.innerText = "撤销";
        var exportData = document.createElement('button');
        exportData.innerText = "导出";
        repeal.onclick = function(){
            self.deletePoint();
        };
        exportData.onclick = function(){
            console.log(points);
        };
        operation.appendChild(exportData);
        operation.appendChild(repeal);
        args.parent.appendChild(operation);
        // 初始化参数 
        var canvasLeft = canvas.offsetLeft,
            canvasTop = canvas.offsetTop,
            context = canvas.getContext('2d'),
            points = [],
            pointControl = [],
            currentPointIdx,
            pointR = 4,
            bezierDefaultLength = 100;

        // canvas mousedown event 用于检测用户时候点击拖拽点
        canvas.addEventListener('mousedown', function(e) {
            var x = e.pageX - canvasLeft,
                y = e.pageY - canvasTop,
                prePoint = points[points.length - 1],
                isTouchPoint = pointIsToExist({
                    points: points,
                    x: x,
                    y: y,
                    isToExistCallBack: movePoint
                }),
                isTouchControlPoint = pointIsToExist({
                    points: pointControl,
                    x: x,
                    y: y,
                    isToExistCallBack: roateLine
                });
            // 如果点击空白地方创建新的点 
            if (!isTouchPoint && !isTouchControlPoint) {
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
                //绘制所有的点
                draw();
            }

        });

        // 当触发点击到新的点的情况时,会自动添加onmousemove事件,所以在这添加清除事件 
        document.onmouseup = function() {
            document.onmousemove = null;
        }

        // 双击事件,当双击到指定元素时,如果存在普通点,则创建BezierControl(控制器)
        canvas.addEventListener('dblclick', function(e) {
            var x = e.pageX - canvasLeft,
                y = e.pageY - canvasTop,
                isTouchPoint = pointIsToExist({
                    points: points,
                    x: x,
                    y: y,
                    isToExistCallBack: showBezierControl
                });
            if (!isTouchPoint) {
                console.log("双击的是空白区域");
            }
        });

        function showBezierControl(points, idx) {
            // 确定当前的点的下标
            currentPointIdx = idx;
            // 将其他的BezierControl关闭 
            points.forEach(function(point, i) {
                if (i === idx) {
                    point.showBezierControl = !point.showBezierControl
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
        }

        // 循环所有的点,遍历点击位置是否存在
        function pointIsToExist(args) {
            var allPoints = args.points,
                x = args.x,
                y = args.y,
                isToExistCallBack = args.isToExistCallBack;
            pointIsExist = false;
            allPoints.forEach(function(point, idx) {
                if (y > point.top - point.r && y < point.top + point.r && x > point.left - point.r && x < point.left + point.r) {
                    pointIsExist = true;
                    isToExistCallBack(allPoints, idx);
                }
            });
            return pointIsExist;
        };

        //当点击的是控制BezierControl点时将其移动并改变bezier值 
        function roateLine(controlPoints, idx) {
            document.onmousemove = function(e) {
                var dx = e.layerX || e.offsetX,
                    dy = e.layerY || e.offsetY,
                    prePoint = points[currentPointIdx - 1],
                    nextPoint = points[currentPointIdx + 1],
                    currentPoint = points[currentPointIdx];
                controlPoints.forEach(function(point, i) {
                    if (i === idx) {
                        point.left = dx;
                        point.top = dy;
                    } else {
                        point.left = 2 * points[currentPointIdx].left - dx;
                        point.top = 2 * points[currentPointIdx].top - dy;
                    }
                });
                if (prePoint) {
                    points[currentPointIdx].bezierPoint.left = (prePoint.left + currentPoint.left) / 2 + (controlPoints[0].left - currentPoint.left + bezierDefaultLength);
                    currentPoint.bezierPoint.top = (prePoint.top + currentPoint.top) / 2 + (controlPoints[0].top - currentPoint.top);
                }
                if (nextPoint) {
                    nextPoint.bezierPoint.left = (nextPoint.left + currentPoint.left) / 2 + (controlPoints[1].left - currentPoint.left - bezierDefaultLength);
                    nextPoint.bezierPoint.top = (nextPoint.top + currentPoint.top) / 2 + (controlPoints[1].top - currentPoint.top);
                }

                draw();
            };
        };

        // 移动普通点的时候修改位置和bezier值
        function movePoint(points, idx) {
            pointControl = [];
            document.onmousemove = function(e) {
                var dx = e.layerX || e.offsetX, //鼠标当前坐标
                    dy = e.layerY || e.offsetY,
                    prePoint = points[idx - 1],
                    nextPoint = points[idx + 1],
                    currentPoint = points[idx];
                currentPoint.left = dx;
                currentPoint.top = dy;
                if (prePoint && currentPoint.bezierPoint) {
                    currentPoint.bezierPoint.left = (dx + prePoint.left) / 2;
                    currentPoint.bezierPoint.top = (dy + prePoint.top) / 2;
                }
                if (nextPoint && nextPoint.bezierPoint) {
                    nextPoint.bezierPoint.left = (dx + nextPoint.left) / 2;
                    nextPoint.bezierPoint.top = (dy + nextPoint.top) / 2;
                }
                draw();
            }
        };

        // 根据points ,pointControl来绘制点,线条,控制器
        function draw() {
            /*清除所有的内容 */
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            for (var idx = 0, pointsLength = points.length; idx < pointsLength; idx++) {
                var point = points[idx];
                /* 第1个的情况下面不绘制曲线 */
                if (idx === 0) {
                    context.moveTo(point.left, point.top);
                } else {
                    var prePoint = points[idx - 1];
                    context.bezierCurveTo(prePoint.left, prePoint.top, point.bezierPoint.left, point.bezierPoint.top, point.left, point.top);
                }
                /* 绘制BezierControl控制器 */
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
                /* 绘制圆点*/
                context.arc(point.left, point.top, point.r, 0, 2 * Math.PI);
                context.moveTo(point.left, point.top);
            }
            context.stroke();
        };

        this.deletePoint = function(){
            console.log("test");
            points.pop();
            draw();
        }
    }