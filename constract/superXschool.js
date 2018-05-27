'use strict';


let UploadTx = function (text) {
    if (text) {
        let o = JSON.parse(text);
        this.from = o.from; //user address
        this.username = o.username;//user name
        this.price = new BigNumber(o.price); //price todo为什么一定是整数？
        this.courseId = new BigNumber(o.courseId);
        this.time = o.time // subscribe time
    } else {
        this.from = "";
        this.price = new BigNumber(0);
        this.username = "";
        this.courseId = new BigNumber(0);
        this.time = "";
    }
};

UploadTx.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

let SubscribeRecord = function (text) {
    if (text) {
        let o = JSON.parse(text);
        this.courseIds = [o.courseIds];
    } else {
        this.courseIds = [];
    }
}

SubscribeRecord.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

let UploadRecord = function (text) {
    if (text) {
        let o = JSON.parse(text);
        this.ids = [o.ids];
    } else {
        this.ids = [];
    }
};

UploadRecord.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

let SuperXSchool = function () {
    LocalContractStorage.defineMapProperty(this, "uploadTx", {
        parse: function (text) {
            return new UploadTx(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "uploadRecord", {
        parse: function (text) {
            return new UploadRecord(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "subscribeRecord", {
        parse: function (text) {
            return new SubscribeRecord(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

};

SuperXSchool.prototype = {
    init: function (address) {
        if (address!==undefined && address.length > 0) {
            LocalContractStorage.set("address", address);
        } else {
            LocalContractStorage.set("address", "n1HtMbVLEPqmk8Pd1f77gZJYJMJb2jH2T8v");
        }
    },

    /**
     * subscrible course
     * @param price
     * @param course_id course id
     * @param username user name
     * @param word
     * @param time
     */
    subscribeCourse: function (username, courseId, teacher_address) {
        let value = Blockchain.transaction.value;
        let from = Blockchain.transaction.from;
        let courseInfo = this.uploadTx.get(teacher_address + "_" + courseId);
        if(!courseInfo){
            throw Error("课程不存在");
        }
        if (value < courseInfo.price) {
            throw new Error("付费不足，课程价格为：" + price.toString());
        }
        let pay_result = Blockchain.transfer(teacher_address, new BigNumber(parseInt(price)));
        if (!pay_result) {
            throw new Error("付费失败. ");
        }

        let subscribeRecord = this.SubscribeRecord.get(username);
        if (!subscribeRecord) {
            subscribeRecord = new UploadRecord()
        }
        subscribeRecord.courseIds.push(courseId)
    },

    getSubsribeCourse: function (username) {
        return this.SubscribeRecord.get(username).courseIds;
    },

    uploadCourse: function (price, courseId, username, time) {
        let from = Blockchain.transaction.from;
        let value = Blockchain.transaction.value;
        let uploadId = this.uploadTx.get(from + "_" + courseId);
        if (uploadId) {
            throw new Error("uploadId: " + uploadId + "has been sent");
        }
        if (price < 0) { //
            throw new Error("value not less than zero");
        }
        let poundage = new BigNumber(parseInt(price) * 0.001);
        if (value < poundage) {
            throw new Error("请同时支付" + (price*0.001).toString() + "NAS的手续费,你的转账额只有：" + value)
        }

        let uploadIds = this.uploadRecord.get(from);
        if (!uploadIds) {
            uploadIds = new UploadRecord()
        }
        let uploadItem = new UploadTx();
        uploadItem.from = from;
        uploadItem.price = new BigNumber(price);
        uploadItem.courseId = courseId;
        uploadItem.username = username;
        uploadItem.time = time;
        uploadIds.ids.push(courseId);
        this.uploadTx.put(from + "_" + courseId, uploadItem);
        this.uploadRecord.put(from, uploadIds);
        console.log(from, uploadIds.ids)
    },

    /**
     *
     */
    getUploadIds: function () {
        let from = Blockchain.transaction.from;
        return this.uploadRecord.get(from).ids;
    },

    /**
     * Get upload course info
     * @param courseId  course id
     */
    getCourseInfo: function (courseId) {
        let address = Blockchain.transaction.from;
        return this.uploadTx.get(address + "_" + courseId);
    },

    getAddress: function () {
        return LocalContractStorage.get("address");
    }

};

module.exports = SuperXSchool;