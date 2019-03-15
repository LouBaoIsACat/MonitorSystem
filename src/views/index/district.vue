<template>
    <div class="district">
        <h1>区域名称: {{district_name}}</h1>
        <h3>区域编号: {{district_id}}</h3>
        <div id="districtPic"  @click="clickDistrictPic"  style="cursor:pointer;">
            <Modal v-model="district_modal" title="添加结点向导">
                <div v-show="picture_node_show==1">
                    <p>请选择要添加的监控设备</p>
                    <Button @click="select_camera=false;select_node=true">传感器结点</Button>
                    <Button @click="select_camera=true;select_node=false" style="margin-left:6px;">摄像头监控</Button>
                    <div v-show="select_camera">
                        <label>本机IP(配置监控摄像头要用到):</label>
                        <Input v-model="local_ip" placeholder="形如xx.xx.xx.xx"/> 
                    </div>
                </div>
                <div v-show="picture_node_show==2">
                    <label>结点编号:</label>
                    <Input v-model="node_id"/>
                    <label>结点名称:</label>
                    <Input v-model="node_name"/>
                    <label>结点数据更新频率:</label>
                    <Input v-model="node_update_frequence" />
                </div>
                <div v-show="picture_node_show==3">
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
                <div v-show="picture_node_show==4">
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
                <div v-show="picture_node_show==5"><p>摄像监控</p></div>
                    <div slot="footer" >
                    <Button v-show="picture_node_show!=1" @click="previous_step">上一步</Button>
                    <Button type="primary" @click="pic_modal_ok">{{oktext}}</Button>
                    <Button @click="pic_modal_cancel">取消</Button>
                </div>
            </Modal>
        </div>
    </div>
</template>

<script>
import {isnull} from "../../common/common.js";
import { CreateNode, CreateCamera, SeeNodeDetail} from "../../api/index/project.js";
import {GetDistrictDetail} from '../../api/index/district.js';
let location;
export default {
    name: "district",
    data () {
        return {
            district_id: 0, // 区域编号
            district_name: "", // 区域名称
            district_remark: "", // 区域备注
            district_modal: false, // 模态框的状态
            picture_node_show: 1, // 模态框展示页面标识
            select_camera:false,   //是否显示本机ip输入框
            select_node:false,     //是否选择节点
            local_ip:"",            //本地ip
            node_id:"",              //结点编号
            node_name:"",           //结点名字
            node_update_frequence:"",  //结点数据刷新频率
            add_sensor_input:false,     //是否要添加传感器
            add_sensor_name:"",         //要添加的传感器的名称
            selected_sensors:[],  //选中的传感器
            oktext:"下一步",
        }
    },
    computed: {
        total_sensor () {
            return this.$store.state.total_sensor
        }
    },
    mixins: [ isnull, GetDistrictDetail, CreateNode, CreateCamera, SeeNodeDetail ],
    watch: {
        picture_node_show: function(newvalue){
            if (newvalue == 5 || newvalue == 4) {
                this.oktext = "完成";
            } else {
                this.oktext = "下一步";
            }
        }
    },
    mounted () {
        let id = this.$route.params.id;
        this.district_id = id;
        this.GetDistrictDetail(id).then((rep) => {
            console.log("[district-detail]:", rep);
            this.district_name = rep.data.addDistrictName;
            this.district_remark = rep.data.addDistrictRemark;
            document.getElementById('districtPic').style.background='url("' +rep.data.addDistrictPicture + '")';
            document.getElementById("districtPic").style.backgroundSize = "cover";
            document.getElementById("districtPic").style.backgroundPosition = "center";
            document.getElementById("districtPic").style.backgroundRepeat = "no-repeat";
        })
    },
    methods:{
        clickDistrictPic: function(e) { // 点击图片添加结点
            console.log(e);
            location = {
                X: e.layerX,
                Y: e.layerY
            };
            if(e.target.nodeName === 'I'){ // 当点击的是结点图标时
                // console.log("[node-id]:", e.target.id);
                this.SeeNodeDetail(e.target.id).then((rep) => {
                    this.$Modal.info({
                        title: this.node_name,
                        content:`<p>结点ID: ${this.node_id} <br/></p>`,
                    })
                    console.log("[seeNodeDetail-rep]:", rep);
                })
            } else this.district_modal = true; // 弹出对话框
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
                    status: 0
                }
                this.$store.commit('ADD_SENSOR', temp);
                console.log("[checkbox]:", this.total_sensor.length)
                this.add_sensor_name = "";
            }
        },
        previous_step: function(){ // 创建结点的上一步
            if (this.picture_node_show != 5) {
                this.picture_node_show -= 1;
            }
            else{
                this.picture_node_show = 1;
            }
        },
        pic_modal_ok: function() { // 添加监控设备结点
            if (this.picture_node_show == 1) {
                if (this.select_camera) {
                    if (this.isnull(this.local_ip)) {
                        setTimeout(() => {
                            this.$Notice.error({
                                title:"信息未填完整"
                            })
                        }, 500);
                    } else {
                        this.picture_node_show = 5;
                    }
                } else if (this.select_node) {
                    this.picture_node_show = 2;
                } else {
                    setTimeout(() => {
                        this.$Notice.error({
                            title: "未选择监控设备"
                        })
                    }, 500);
                }
            } else if (this.picture_node_show == 2) {
                if (this.isnull(this.node_id) || this.isnull(this.node_name) || this.isnull(this.node_update_frequence)) {
                    setTimeout(() => {
                        this.$Notice.error({
                            title: "信息未填写完整"
                        })
                    }, 500);
                } else {
                    this.picture_node_show = 3;
                }
            } else if (this.picture_node_show == 3) {
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
                    this.picture_node_show = 4;
                }
                // console.log("[sensors-status]:", this.total_sensor);
                console.log("[选中的传感器]:", this.selected_sensors);
            } else if (this.picture_node_show == 4) {
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
                        this.CreateNode(body).then((rep) => { // 将创建的结点信息传给后台
                            console.log("[createNode_rep]:", rep);
                        })
                        document.getElementById("districtPic").innerHTML += `<i id="${this.node_id}" style="position:absolute;border-radius:50%;left:${location.X}px;top:${location.Y}px;height:20px;width:20px;background:#5cadff;cursor:pointer;">${this.node_id}</i>`
                        this.pic_modal_cancel();
                        this.district_modal = false;
                    }, 1000);
                }
            } else if (this.picture_node_show == 5) {
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
                        "districtPic"
                    ).innerHTML += `<i id="${this.node_id}" style="position:absolute;border-radius:50%;left:${location.X}px;top:${location.Y}px;height:20px;width:20px;background:#5cadff;cursor:pointer;">${this.node_id}</i>`
                    this.pic_modal_cancel();
                    this.district_modal = false;
                }, 1000);
            }
        },
        pic_modal_cancel: function(){ // 取消添加结点
            this.district_modal = false;
            this.picture_node_show = 1;
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
    }
}
</script>

<style lang="scss" scoped>
    #districtPic{
        width:800px;
        height:510px;
        margin-top:10px;
        margin-right:15px;
        border:1px solid #e8eaec;
        border-radius: 5px;
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
</style>
