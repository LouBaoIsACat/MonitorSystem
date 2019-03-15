import service from "../../request.js";

export const GetDistrictDetail = {
    methods: {
        GetDistrictDetail: (id) => {
            return new Promise((resolve, reject) => {
                service.get('/DistrictDetail', {
                    params: {
                        ID: id
                    }
                }).then((rep) => {
                    if (rep.code == 2000) {
                        resolve(rep)
                    }
                })
            })
        }
    }
}