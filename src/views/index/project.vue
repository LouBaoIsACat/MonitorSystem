<template>
    <div id="project">
        <Breadcrumb class="breadcrumb">
            <BreadcrumbItem><span @click="set_newProject">设置向导</span></BreadcrumbItem>
                <Modal v-model="snp_modal" @on-ok="ok" @on-cancel="cancel" :loading="loading" title="项目配置向导">
                    <label>项目名称:</label>
                    <Input type="text" v-model="project_name" style="width:425px;margin-left:5px;"/><br><br>
                    <label>项目文件保存路径:</label>
                    <Input type="text"  v-model="project_location" style="width:377px;margin-left:5px;"/><br><br>
                    <label>监测区域名称:</label>
                    <Input type="text" v-model="monitor_district_name" style="width:402px;margin-left:5px;"/><br><br>
                    <label>监测区域备注:</label>
                    <Input type="text" v-model="monitor_district_remark" style="width:402px;margin-left:5px;"/><br><br>
                    <Button type="primary" @click="import_project_pic" style="margin-bottom:5px;">导入工程图</Button>
                    <input type="file" id="selectProPic" @change="selectProPic" accept="image/*" style="display:none">
                    <Button @click="delete_project_pic" style="margin-left:10px;margin-bottom:5px;">清除工程图</Button>
                    <div id="show_project_pic" ></div>
                </Modal>
            <BreadcrumbItem><span @click="set_addDistrict">添加区域</span></BreadcrumbItem>
                <Modal v-model="addDistrict_modal" @on-ok="AddDistricts" @on-cancel="CancelAddDistrict" :loading="district_loading" title="添加区域向导">
                    <label>区域编号:</label>{{added_district_id}}<br><br>
                    <label>区域名称:</label>
                    <Input type="text" v-model="added_district_name" style="width:425px;margin-left:5px;" /><br><br>
                    <label>区域备注:</label>
                    <Input type="text" v-model="added_district_remark" style="width:425px;margin-left:5px;" /><br><br>
                    <Button type="primary" @click="import_district_picture" style="margin-bottom:5px;">导入区域图</Button>
                    <input type="file" id="selectDistrictPic" @change="selectDisPic" accept="image/png, image/jpeg, image/jpg" style="display:none">
                    <Button @click="delete_district_picture" style="margin-left:10px;margin-bottom:5px;">清除区域图</Button>
                    <div id="add_district_modal"></div>
                    <!-- <Card id="show_district_picture" style="height:400px;" ><img id="district_pic_img" /></Card> -->
                </Modal>
            <BreadcrumbItem>删除此区域</BreadcrumbItem>
            <BreadcrumbItem>导入项目文件</BreadcrumbItem>
            <BreadcrumbItem>保存项目文件</BreadcrumbItem>
            <BreadcrumbItem>显示节点-传感器联系表</BreadcrumbItem>
            <BreadcrumbItem>删除所有项目数据</BreadcrumbItem>
        </Breadcrumb>
        <h2 style="margin-top:5px;">项目名称：{{project_name_showing}}</h2>
        <div class="pic_collapse_layout">
            <div id="project_detail" v-show="project_added_flag == 1">
                <Collapse accordion>
                    <Panel name="1">
                        区域备注
                        <p slot="content">{{monitor_district_remark_showing}}</p>
                    </Panel>
                    <Panel name="2">
                        结点数
                        <p slot="content">此处为结点数</p>
                    </Panel>
                    <Panel name="3">
                        区域状态
                        <p slot="content">此处为区域状态</p>
                    </Panel>
                </Collapse>
            </div>
            <div id="indexProPic"  @click="clickPic" @ style="cursor:pointer;">
                <Modal v-model="pic_modal" title="添加结点向导">
                    <div v-show="pic_node_show==1">
                        <p>请选择要添加的监控设备</p>
                        <Button @click="select_camera=false;select_node=true">传感器结点</Button>
                        <Button @click="select_camera=true;select_node=false" style="margin-left:6px;">摄像头监控</Button>
                        <div v-show="select_camera">
                            <label>本机IP(配置监控摄像头要用到):</label>
                            <Input v-model="local_ip" placeholder="形如xx.xx.xx.xx"/> 
                        </div>
                    </div>
                    <div v-show="pic_node_show==2">
                        <label>结点编号:</label>
                        <Input v-model="node_id"/>
                        <label>结点名称:</label>
                        <Input v-model="node_name"/>
                        <label>结点数据更新频率:</label>
                        <Input v-model="node_update_frequence" />
                    </div>
                    <div v-show="pic_node_show==3">
                        <div id="select_sensor_district" style="width:497px;">
                            <span v-for="(item,index) in total_sensor" :key="index" style="display:inline-block;margin-left:20px;"><input type="checkbox"  v-model="item.selected" name="sensors" value="item.sensorName">{{item.sensorName}}</span>
                        </div>
                        <Icon type="md-add" @click="add_sensor_input=true" size="29"/><br>
                        <Input v-show="add_sensor_input" placeholder="输入要添加的传感器名称" style="width:87%;" v-model="add_sensor_name"/>
                        <span v-show="add_sensor_input" style="margin-right:5px;"><input type="checkbox" name="sensor_type">开关量传感器</span>
                        <span v-show="add_sensor_input" style="margin-right:5px;"><input type="checkbox" name="sensor_type">数字量传感器</span>
                        <span v-show="add_sensor_input" style="margin-right:5px;"><input type="checkbox" name="sensor_type">模拟量传感器</span>
                        <Button @click="add_sensor" v-show="add_sensor_input" style="position:absolute;right:17px;">添加</Button>
                    </div>
                    <div v-show="pic_node_show==4">
                        <table>
                            <tr>
                                <th>传感器名称</th>
                                <th>传感器编号</th>
                                <th>传感器监测阈值</th>
                            </tr>
                            <tr v-for="(item,index) in selected_sensors" :key="index">
                                <td>{{item.sensorName}}</td>
                                <td>{{item.id}}</td>
                                <td v-if='item.type=="digital"'>
                                    <label>最小值:</label>
                                    <Input v-model="item.status.min" style="width:70%;margin-left:4px;"/>
                                    <label>最大值:</label>
                                    <Input v-model="item.status.max" style="width:70%;margin:2px 0 0 4px;"/>
                                </td>
                                <td v-else>
                                    <input type="radio" :name="item.id" style="cursor:pointer;" v-model="item.status" value="1"/>ON
                                    <input type="radio" :name="item.id" style="cursor:pointer;margin-left:10px;" v-model="item.status" value="0"/>OFF
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div v-show="pic_node_show==5"><p>摄像监控</p></div>
                    <div slot="footer" >
                        <Button v-show="pic_node_show!=1" @click="previous_step">上一步</Button>
                        <Button type="primary" @click="pic_modal_ok">{{oktext}}</Button>
                        <Button @click="pic_modal_cancel">取消</Button>
                    </div>
                </Modal>
            </div>
        </div>
        <div class="district_area_style" >
            <Card v-for="(item, index) in district_list" :key="index" style="width:250px;height:340px;margin-top:15px;margin-riht:10px;">
                <label>区域编号:</label>{{item.addDistrictId}}<br>
                <label>区域名称:</label>{{item.addDistrictName}}<br>
                <label>区域备注:</label>{{item.addDistrictRemark}}<br>
                <router-link tag="a" :to='{name: "district", params: {id: item.addDistrictId}}' target="_blank">查看详情>>></router-link>
                <!-- <span style="color:blue;cursor:pointer;" @click="gotoDistrictDetail(item.addDistrictId)">详情>>></span> -->
                <div style="width:215px;height:215px;margin:0 auto;margin-top:10px;border:1px solid #d7dde4;"></div>
            </Card>
        </div> 
        <Button @click="change_sensor_value100">改变节点传感器的值</Button>
    </div>
</template>

<script>
import {isnull, stopBubble } from "../../common/common.js";
import { CreateProject, CreateNode, CreateCamera, SeeNodeDetail, AddDistrict, GetProjectDetailAfterUpdate, GetAddedNode } from "../../api/index/project.js";
// import func from './vue-temp/vue-editor-bridge.js';
let location;
export default {
    name:"project",
    data(){
        return {
            snp_modal:false,         //设置向导modal
            loading: true,
            project_name:"",        //项目名称
            project_location:"",    //项目路径
            monitor_district_name:"",    //检测区域名称
            monitor_district_remark:"",     //监测区域备注
            project_name_showing:"",       //页面显示的项目名称
            monitor_district_remark_showing:"",  //页面显示的区域备注
            flag:0,               //项目向导是否有选择图片的标志
            project_added_flag: 0, // 是否已设置了项导的标志
            pic_modal:false,        //结点向导模态框
            pic_node_show:1,       //结点向导模态框显示顺序
            select_camera:false,   //是否显示本机ip输入框
            select_node:false,     //是否选择节点
            local_ip:"",            //本地ip
            node_id:"",              //结点编号
            node_name:"",           //结点名字
            node_update_frequence:"",  //结点数据刷新频率
            add_sensor_input:false,     //是否要添加传感器
            add_sensor_name:"",         //要添加的传感器的名称
            selected_sensors:[],  //选中的传感器
            oktext:"下一步",         //确认键内容
            addDistrict_modal: false, // 添加区域的模态框
            district_loading: true,
            added_district_id: 2000, // 添加区域的编号
            added_district_name: "", // 添加区域的名称
            added_district_remark: "", // 添加区域的备注
            district_picture_selected_flag: 0, // 添加区域是否有选择图片的标志
            district_list: [], // 区域列表
            added_Node_List: [], // 已添加的结点
            added_Node_List_Copy: [], // 已添加节点的数组的副本，用于记录旧值
        }
    },
    computed: {
        total_sensor () {
            return this.$store.state.total_sensor
        }
    },
    mixins: [isnull, CreateProject, CreateNode, CreateCamera, SeeNodeDetail, stopBubble, AddDistrict, GetProjectDetailAfterUpdate, GetAddedNode],
    mounted () {
        if (localStorage.getItem("userName") && localStorage.getItem("addedProjectName")) { // 刷新后重新获取页面信息
            this.GetProjectDetailAfterUpdate(localStorage.getItem("addedProjectName")).then((rep) => {
                console.log("[get-project-detail]:", rep);
                if (rep.code == 2000) {
                    this.project_name_showing = rep.data.projectName;
                    this.monitor_district_remark_showing = rep.data.districtRemark;
                    document.getElementById("indexProPic").style.background = 'url("' + rep.data.projectPicture + '")';
                    document.getElementById("indexProPic").style.backgroundSize = "cover";
                    document.getElementById("indexProPic").style.backgroundPosition = "center";
                    document.getElementById("indexProPic").style.backgroundRepeat = "no-repeat";
                    this.project_added_flag = 1;
                }
            })
            this.GetAddedNode(localStorage.getItem("addedProjectName")).then((rep) => {
                console.log("[获取的已添加节点]:", rep);
                if (rep.code == 2000) {
                    for (let i = 0; i < rep.data.AddedNodeList.length; i++) {
                        document.getElementById("indexProPic").innerHTML += `<i id="${'node' + rep.data.AddedNodeList[i].nodeId}" style="position:absolute;border-radius:50%;left:${rep.data.AddedNodeList[i].X}px;top:${rep.data.AddedNodeList[i].Y}px;height:20px;width:20px;background:#5cadff;cursor:pointer;">${rep.data.AddedNodeList[i].nodeId}</i>`
                    }
                }
            })
            if (localStorage.getItem("addedDiatrictsArray")) {
                this.district_list = JSON.parse(localStorage.getItem("addedDiatrictsArray"));
                console.log("[local-district-list]:", this.district_list);
            }
        }
        
    },
    watch: {
        pic_node_show: function(newvalue){
            if (newvalue == 5 || newvalue == 4) {
                this.oktext = "完成";
            } else {
                this.oktext = "下一步";
            }
        },
        added_Node_List: { // 监听传感器数值是否需要报警
            handler(newValue, oldValue) {
                console.log("[进入到监视的函数]");
                for (let i = 0; i < newValue.length; i++) {
                    for (let j = 0; j < newValue[i].sensorDetail.length; j++) {
                        if (newValue[i].sensorDetail[j].value != this.added_Node_List_Copy[i].sensorDetail[j].value) {
                            console.log("[有传感器数值改变]:", newValue[i].sensorDetail[j].value);
                            console.log("[改变前]:", this.added_Node_List_Copy[i].sensorDetail[j].value);
                            if (newValue[i].sensorDetail[j].value > 99) {
                                let node = document.getElementById('node' + newValue[i].nodeId);
                                console.log("[报警节点信息]:", node);
                                node.style.backgroundColor = "red";
                            }
                        }
                    }
                }
            },
            deep: true
        }
    },
    methods: {
        set_newProject: function(){ // 点击“设置向导”
            if (localStorage.getItem('userName')) {
                if (this.project_added_flag) {
                    this.project_name_showing = '';
                    this.monitor_district_remark_showing = '';
                }
                this.snp_modal=true;
            } else {
                this.$Message.warning('请先登录账号!');
            }
        },
        set_addDistrict: function() { // 点击“添加区域”
            if (localStorage.getItem('userName')) {
                if (this.project_added_flag) {
                    this.addDistrict_modal=true;
                } else {
                    this.$Message.error('还未设置添加项目!');
                }
            } else {
                this.$Message.warning('请先登录账号!');
            }
           
        },
        ok(){ // 创建项目
            if (this.isnull(this.project_name) || this.isnull(this.project_location) || 
            this.isnull(this.monitor_district_name) || this.isnull(this.monitor_district_remark) || 
            this.flag == 0){ // 设置失败
               setTimeout(() => {
                   this.loading = false;
                    this.$Notice.error({
                        title:"信息未填完整"
                    })
                    this.$nextTick(() => {
                        this.loading = true;
                    });
                }, 1000);
            }
            else { // 设置成功
                setTimeout(() => {
                    const body = {
                        projectName:this.project_name,
                        projectLocation:this.project_location,
                        districtName:this.monitor_district_name,
                        districtRemark:this.monitor_district_remark,
                        monitorPicture:"picture"
                    }
                    this.CreateProject( body ).then((rep) => {
                        console.log("[createProject_rep]:", rep);
                        if (rep.code == 2000) {
                            this.project_name_showing = rep.data.projectName;
                            this.monitor_district_remark_showing = rep.data.districtRemark;
                            document.getElementById("indexProPic").style.background='url("' + rep.data.projectPicture + '")';
                            document.getElementById("indexProPic").style.backgroundSize = "cover";
                            document.getElementById("indexProPic").style.backgroundPosition = "center";
                            document.getElementById("indexProPic").style.backgroundRepeat = "no-repeat";
                            this.project_name = this.project_location = this.monitor_district_name = this.monitor_district_remark = "";
                            let project_modal = document.getElementById("show_project_picture");
                            project_modal.parentNode.removeChild(project_modal);
                            this.flag = 0; // 有没有选择项目图片的标志
                            this.project_added_flag = 1; // 已设置了项导
                            var msg = {"project_name": rep.data.projectName};
                            this.$store.commit('set_isAddedProject', msg);
                            console.log("[local-project-name]:", localStorage.getItem("addedProjectName"));
                            this.snp_modal = false;
                        }
                    })
                }, 1000);
            }
        },
        cancel(){ // 取消创建项目
            this.$Message.info('Clicked cancel');
            this.flag=0;
            this.project_name = this.project_location = this.monitor_district_name = this.monitor_district_remark = "";
        },
        import_project_pic: function(){ // 导入工程图
            document.getElementById("selectProPic").click();
        },
        selectProPic: function(e){ // 选择工程图
            let file = e.target.files[0];
            if (file != undefined) {
                console.log("[file]:", file);
                let type = file.type.split('/')[0];
                if (type !='image') {
                    alert('请上传图片');
                    return;
                }
                let size = Math.floor(file.size / 1024 / 1024);
                if (size > 3) {
                    alert('图片大小不得超过3M');
                    return;
                };
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    let project_modal = document.getElementById('show_project_pic');
                    let div = document.createElement('div');
                    div.style.setProperty("background-image", 'url('+reader.result+')');
                    div.style.setProperty('width', "481px");
                    div.style.setProperty('height', "400px");
                    div.id = "show_project_picture";
                    project_modal.appendChild(div);
                }
                this.flag = 1; // 已选择图片的标志
            }
        },
        delete_project_pic: function(){ // 清除工程图
            let projectPic = document.getElementById('show_project_pic');
            projectPic.removeChild(projectPic.childNodes[0]);
            this.flag = 0;
        },
        clickPic: function(e) { // 点击图片添加结点
            if (this.project_added_flag == 0) {
                this.$Message.error("还未添加项目!");
            } else {
                console.log(e);
                location = {
                    X: e.layerX,
                    Y: e.layerY
                };
                var pic = document.getElementById("indexProPic");
                if(e.target.nodeName === 'I'){ // 当点击的是结点图标时
                    // console.log("[node-id]:", e.target.id);
                    const body = {nodeId: e.target.id};
                    this.SeeNodeDetail(body).then((rep) => {
                        this.$Modal.info({
                            title: this.node_name,
                            content:`<p>结点ID: ${this.node_id} <br/></p>`,
                            //结点类型: ${rep.data.nodeType} <br/>设置的传感器: ${rep.data.sensors}
                        })
                        console.log("[seeNodeDetail-rep]:", rep);
                    })
                } else this.pic_modal = true; // 弹出对话框
                // pic.innerHTML+=`<span class="fas fa-user" style="position:absolute;left:${e.layerX}px;top:${e.layerY}px;"></span>`;
                // pic.innerHTML+=`<div style="position:absolute;border-radius:50%;left:${e.layerX}px;top:${e.layerY}px;height:10px;width:10px;background:#5cadff;"></div>`
            }
            
        },
        pic_modal_ok: function() { // 添加监控设备结点
            if (this.pic_node_show == 1) {
                if (this.select_camera) {
                    if (this.isnull(this.local_ip)) {
                        setTimeout(() => {
                            this.$Notice.error({
                                title:"信息未填完整"
                            })
                        }, 500);
                    } else {
                        this.pic_node_show = 5;
                    }
                } else if (this.select_node) {
                    this.pic_node_show = 2;
                } else {
                    setTimeout(() => {
                        this.$Notice.error({
                            title: "未选择监控设备"
                        })
                    }, 500);
                }
            } else if (this.pic_node_show == 2) {
                if (this.isnull(this.node_id) || this.isnull(this.node_name) || this.isnull(this.node_update_frequence)) {
                    setTimeout(() => {
                        this.$Notice.error({
                            title: "信息未填写完整"
                        })
                    }, 500);
                } else {
                    this.pic_node_show = 3;
                }
            } else if (this.pic_node_show == 3) {
                let sensor_flag = false;
                for (let i = 0;i < this.total_sensor.length;i++) {
                    if (this.total_sensor[i].selected) {
                        sensor_flag = true;
                    }
                }
                this.selected_sensors = this.total_sensor.filter(v => {
                    return (v.selected === true);
                })
                if (!sensor_flag) {
                    setTimeout(() => {
                        this.$Notice.error({
                            title:"请至少选择一个传感器"
                        })
                    }, 500);
                } else {
                    this.pic_node_show = 4;
                }
                // console.log("[sensors-status]:", this.total_sensor);
                console.log("[选中的传感器]:", this.selected_sensors);
            } else if (this.pic_node_show == 4) {
                var sensor_detail_flag = false;
                for (let i = 0;i < this.selected_sensors.length;i++) {
                    if (this.selected_sensors[i].type == "digital")
                        if (this.isnull(this.selected_sensors[i].status.max) || this.isnull(this.selected_sensors[i].status.min) || 
                        this.selected_sensors[i].status.min > this.selected_sensors[i].status.max) sensor_detail_flag = true;
                }
                if (sensor_detail_flag) {
                    setTimeout(() => {
                        this.$Notice.error({
                            title: "信息未填完整或填写不合理"
                        })
                    }, 500);
                } else {
                    this.$Notice.success({
                        title:"添加监控设备成功" // 添加传感器
                    })
                    setTimeout(() => {
                        const body = {
                            nodeId: this.node_id,
                            nodeName: this.node_name,
                            nodeUpdateFrequency: this.node_update_frequence,
                            sensorDetail: this.selected_sensors
                        };
                        let selected_sensors_copy = [];
                        let selected_sensor_temp = {
                            sensorName: "",
                            type: "",
                            selected: "",
                            id: "",
                            status: "",
                            value: ""
                        }
                        for (let i = 0; i < this.selected_sensors.length; i++) {
                            selected_sensor_temp.sensorName = this.selected_sensors[i].sensorName;
                            selected_sensor_temp.type = this.selected_sensors[i].type;
                            selected_sensor_temp.selected = this.selected_sensors[i].selected;
                            selected_sensor_temp.id = this.selected_sensors[i].id;
                            selected_sensor_temp.status = this.selected_sensors[i].status;
                            selected_sensor_temp.value = this.selected_sensors[i].value;
                            selected_sensors_copy.push(selected_sensor_temp);
                        }
                        let bodyCopy = {
                            nodeId: this.node_id,
                            nodeName: this.node_name,
                            nodeUpdateFrequency: this.node_update_frequence,
                            sensorDetail: selected_sensors_copy
                        }
                        this.added_Node_List.push(body);
                        this.added_Node_List_Copy.push(bodyCopy);
                        this.CreateNode(body).then((rep) => { // 将创建的结点信息传给后台
                            console.log("[createNode_rep]:", rep);
                        })
                        document.getElementById("indexProPic").innerHTML += `<i id="${'node' + this.node_id}" style="position:absolute;border-radius:50%;left:${location.X}px;top:${location.Y}px;height:20px;width:20px;background:#5cadff;cursor:pointer;">${this.node_id}</i>`
                        this.change_sensor_value();
                        this.pic_modal_cancel();
                        this.pic_modal = false;
                    }, 1000);
                }
            } else if (this.pic_node_show == 5) {
                this.$Notice.success({
                    title: "添加监控设备成功" // 添加摄像头监控设备
                });
                setTimeout(() => {
                    const body = {
                        nodeId: this.node_id,
                        localIP: this.local_ip
                    };
                    this.CreateCamera(body).then((rep) => { // 将创建的结点信息传给后台
                        console.log("[createCamera_rep]:", rep);
                    })
                    document.getElementById(
                        "indexProPic"
                    ).innerHTML += `<i id="${this.node_id}" style="position:absolute;border-radius:50%;left:${location.X}px;top:${location.Y}px;height:20px;width:20px;background:#5cadff;cursor:pointer;">${this.node_id}</i>`
                    this.pic_modal_cancel();
                    this.pic_modal = false;
                }, 1000);
            }
        },
        pic_modal_cancel: function(){ // 取消添加结点
            this.pic_modal = false;
            this.pic_node_show = 1;
            this.select_camera = false;
            this.select_node = false;
            this.local_ip = "";
            this.node_id = 0;
            this.node_name = "";
            this.node_update_frequence = "";
            this.add_sensor_input = false;
            this.add_sensor_name = "";
            this.selected_sensors = [];
            this.oktext = "下一步";
            for (let i = 0;i < this.total_sensor.length;i++) {
                this.total_sensor[i].selected = false;
                if (this.total_sensor[i].type == "switch") this.total_sensor[i].status = 0;
                else this.total_sensor[i].status = {min: 0, max: 1};
            }
        },
        previous_step: function(){ // 创建结点的上一步
            if (this.pic_node_show != 5) {
                this.pic_node_show -= 1;
            }
            else{
                this.pic_node_show = 1;
            }
        },
        add_sensor: function(){ // 新建传感器
            if (this.isnull(this.add_sensor_name)) {
                this.$Notice.error({
                    title: "请输入要添加的传感器的名称"
                })
            } else {
                let temp = {
                    sensorName: this.add_sensor_name,
                    type: "switch",
                    selected: false,
                    id: this.total_sensor.length + 1,
                    status: 0,
                    value: 0
                }
                this.$store.commit('ADD_SENSOR', temp);
                console.log("[checkbox]:", this.total_sensor.length)
                this.add_sensor_name = "";
            }
        },
        AddDistricts: function(){ // 添加区域确认键
            if (this.isnull(this.added_district_name) || this.isnull(this.added_district_remark) || this.district_picture_selected_flag == 0) {
                setTimeout(() => {
                    this.district_loading = false;
                    this.$Notice.error({
                        title: "信息未填完整"
                    })
                    this.$nextTick(() => {
                        this.district_loading = true;
                    })
                }, 1000);
            } else {
                setTimeout(() => {
                    const body = {
                        addDistrictId: this.added_district_id,
                        addDistrictName: this.added_district_name,
                        addDistrictRemark: this.added_district_remark,
                        addDistrictPicture: "picture"
                    }
                    this.AddDistrict(body).then((rep) => {
                        console.log("[adddistrict-rep]", rep);
                        if (rep.code == 2000) {
                            this.district_list.push({
                                addDistrictId: rep.data.addDistrictId,
                                addDistrictName: rep.data.addDistrictName,
                                addDistrictRemark: rep.data.addDistrictRemark
                            });
                            this.added_district_id += 1;
                            this.district_picture_selected_flag = 0;
                            this.addDistrict_modal = false;
                            // 输入字段初始化
                            this.added_district_name = "";
                            this.added_district_remark = "";
                            this.district_picture_selected_flag = 0;
                            let district_picture = document.getElementById('show_district_picture');
                            district_picture.parentNode.removeChild(district_picture);
                            // document.getElementById('show_district_picture').style.background = "none";
                        }
                    })
                }, 1000);
            }
            this.$store.commit("set_isAddedDistricts", JSON.stringify(this.district_list));
        },
        CancelAddDistrict: function(){ // 添加区域取消键

        },
        import_district_picture: function(){ // 导入区域图片
            document.getElementById('selectDistrictPic').click();
        },
        delete_district_picture: function(){ // 删除区域图片
            let districtPic = document.getElementById('add_district_modal');
            districtPic.removeChild(districtPic.childNodes[0]);
            this.district_picture_selected_flag = 0;
        },
        selectDisPic: function(e){ 
            console.log("[进来选择照片的函数]");
            let file = e.target.files[0];
            if (file != undefined) {
                console.log("[district-file]:", file);
                let type = file.type.split('/')[0];
                if (type !='image') {
                    alert('请上传图片');
                    return;
                }
                let size = Math.floor(file.size / 1024 / 1024);
                if (size > 3) {
                    alert('图片大小不得超过3M');
                    return;
                };
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    //document.getElementById("show_district_picture").style.background = 'url("' + reader.result + '")';
                    let district_modal = document.getElementById('add_district_modal');
                    let div = document.createElement('div');
                    div.style.setProperty("background-image", 'url('+reader.result+')');
                    div.style.setProperty('width', "481px");
                    div.style.setProperty('height', "400px");
                    div.id = "show_district_picture";
                    district_modal.appendChild(div);
                }
                this.district_picture_selected_flag = 1; // 已选择图片的标志
            }
        },
        gotoDistrictDetail: function(id){
            this.$router.push({
                path:`/districtDetail/${id}`
            })
            const { href } = this.$router.resolve({
                name: "district",
                params:{
                    id: id
                }
            });
            window.open(href, "_blank");
        },
        change_sensor_value: function() {
            console.log("[已添加的节点]:", this.added_Node_List);
            this.added_Node_List[0].sensorDetail[0].value = 10;
            console.log("[修改过后的传感器值]:", this.added_Node_List[0].sensorDetail[0].value);
            console.log("[修改前的传感器值]:", this.added_Node_List_Copy);
        },
        change_sensor_value100: function() {
            console.log("[改变为100]");
            this.added_Node_List[0].sensorDetail[0].value = 100;
        }
    }
}
</script>


<style lang="scss" scoped>
    .breadcrumb{
        span:hover{
            cursor: pointer;
        }
    }
    .pic_collapse_layout{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
    #project_detail{
        flex:1 1 250px;
        margin-top:10px;
    }
    #indexProPic{
        width:800px;
        height:510px;
        margin-top:10px;
        margin-right:15px;
        border:1px solid #e8eaec;
        border-radius: 5px;
        order:-1;
        background-position: center;
        background-size:cover; 
        background-repeat: no-repeat;
    }
    #select_sensor_district{
        width:497px;
        display:flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        span{
            flex:0 0 25%;
        }
    }
    table{
        border-collapse:collapse;
    }
    th,td{
        border:1px solid #dcdee2;
        padding:5px;
        width:33%;
        text-align: center;
    }
    .tipdiv{
        width:150px;
        height:100px;
        border:1px solid #d7dde4;
        background: #f5f7f9;
        border-radius: 10px;
        position:absolute;
    }
    .district_area_style{
        display: flex;
    }
</style>

