//计算年份
function getDateYearSub(startDateStr, endDateStr) {
    var day = 24 * 60 * 60 *1000;
    var sDate = new Date(Date.parse(startDateStr.replace(/-/g, "/")));
    var eDate = new Date(Date.parse(endDateStr.replace(/-/g, "/")));

    //得到前一天
    sDate = new Date(sDate.getTime() - day);

    //获得各自的年、月、日
    var sY  = sDate.getFullYear();
    var sM  = sDate.getMonth();
    var sD  = sDate.getDate();
    var eY  = eDate.getFullYear();
    var eM  = eDate.getMonth();
    var eD  = eDate.getDate();
    var year = eY - sY;
    var month = eM - sM;
    if (month < 0) {
        year--;
        month = eM + (12 - sM);
    }
    var data = (year + parseFloat(month/12)).toFixed(1)
    return data
}
//获取当前时间
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}
// 转化日期为xxxx-xx-xx
function getFormatDate(data) {
    var seperator1 = "-";
    var year = data.substring(0,4);
    var month = data.substring(4,6);
    var day = data.substring(6,8);
    return year+seperator1+month+seperator1+day;
}
