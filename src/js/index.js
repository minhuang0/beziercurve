import {Beziercurve} from './beziercurve';

// 实例化构造函数
var beziercurve = new Beziercurve({
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
    title.innerText = "历史绘制记录"
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
