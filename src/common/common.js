

export const goback = { // 返回
    methods:{
        goback(){
            this.$router.go(-1)
        }
        
    }
}

export const isnull = { // 查看值是否为空，为空返回真值
    methods:{
        isnull:function(temp){
            if (temp == undefined || temp == "" || temp == null)return true;
            else return false;
        }
    }
}

export const stopBubble = { // 阻止事件冒泡
    methods: {
        stopBubble:function(e) {
            if (e && e.stopPropagation)
                e.stopPropagation()
            else
                window.event.cancelBubble = true;
        }
    }
}