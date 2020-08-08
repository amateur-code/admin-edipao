layui.use(['table', 'layer','laytpl', 'form'], function(table, layer, laytpl, form) {
    var xadmin = layui.xadmin,
        edipao = layui.edipao,
        tableKey = 'DriverManager-DriverArchives-list'
    tableHeaderList = [
        { field: 'name', title: '司机姓名' },
        { field: 'phone', title: '司机手机' },
        { field: 'idNum', title: '身份证号' },
        { field: 'signStatus', title: '签到状态' },
        { field: 'address', title: '当前住址' },
        { field: 'driverType', title: '司机类型' },
        { field: 'driveLicenceType', title: '驾照类型' },
        { field: 'drivingAge', title: '驾龄' },
        { field: 'wishJourney', title: '意向线路' },
        { field: 'oftenJourney', title: '常跑线路' },
        { field: 'location', title: '位置' },
        { field: 'deposit', title: '押金' },
        { field: 'depositStatus', title: '押金状态' },
        { field: 'depositTradeNumber', title: '押金付流水' },
        { field: 'idLicenceValidity', title: '身份证有效期' },
        { field: 'driveLicenceValidity', title: '驾驶证有效期' },
        { field: 'qualificationsValidity', title: '从业资格证有效期' },
        { field: 'licenceWarn', title: '证件预警' },
        { field: 'emergencyPhone', title: '紧急联系人' },
        { field: 'accountName', title: '银行卡账户' },
        { field: 'accountNumber', title: '银行卡账号' },
        { field: 'accountBank', title: '开户银行' },
        { field: 'accountCity', title: '开户省市' },
        { field: 'accountBankAddress', title: '开户支行' },
        { field: 'status', title: '司机状态' },
        { field: 'signStatus', title: '签到状态' },
        // { field: 'approvalFlag', title: '审核状态' }
    ];
    laytpl(itemListTpl.innerHTML).render({list:tableHeaderList}, function(html){
        document.getElementById('itemList').innerHTML = html;
        form.render();
    });
    edipao.request({
        type: 'GET',
        url: '/admin/table/show-field/get',
        data: {
            tableName: tableKey
        }
    }).done(function(res) {
        if (res.code == 0) {
            if(!res.data){
                $('#itemList').find('input').prop("checked", true);
            }else{
                var showList = [];
                try{
                    showList = JSON.parse(res.data);
                }catch(e){}
                layui.each(showList, function(index, item){
                    $('input[name='+ item +']').prop("checked", true);
                })
            }
            form.render();
        }
    })

    form.on('checkbox(father)', function(data,e){
        if(data.elem.checked){
            $(data.elem).closest('.layui-form').find('input').prop("checked", true);
            form.render();
        }else{
            $(data.elem).closest('.layui-form').find('input').prop("checked", false);
            form.render();
        }
    });

    form.on('submit(update)', function(data) {
        let list = [];
        $('#itemList').find('input').each(function(index, el) {
            if($(this).prop('checked')) list.push($(this).val())

        });

        edipao.request({
            url: '/admin/table/show-field/save',
            data: {
                tableName: tableKey,
                showFieldJson: JSON.stringify(list)
            }
        }).then(function(res){
            if(res.code == 0){
                layer.alert("修改表格成功", { icon: 6 }, function() {
                    xadmin.close();
                    xadmin.father_reload();
                });
            }
        })
        return false
    });

})
