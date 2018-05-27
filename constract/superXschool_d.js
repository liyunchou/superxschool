'use strict';


let Course = function (text) {
    if (text) {
        let o = JSON.parse(text);
        this.teacherName = o.teacherName;//user name
        this.price = new BigNumber(o.price); //price todo为什么一定是整数？
        this.courseId = new BigNumber(o.courseId);
        this.time = o.time // subscribe time
        this.uploaderAddress = o.address
    } else {
        this.price = new BigNumber(0);
        this.teacherName = "";
        this.courseId = new BigNumber(0);
        this.time = "";
        this.uploaderAddress = ""
    }
};

Course.prototype = {
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
    LocalContractStorage.defineMapProperty(this, "uploadCourses", {
        parse: function (text) {
            return new Course(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "uploadRecords", {
        parse: function (text) {
            return new UploadRecord(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "SubscribeRecords", {
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
        if (address !== undefined && address.length > 0) {
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
    subscribeCourse: function () {
        let username = "zhangsan";
        let courseId = "20001";
        let value = Blockchain.transaction.value;
        let from = Blockchain.transaction.from;
        let courseInfo = this.uploadCourses.get(courseId);
        if (!courseInfo) {
            throw new Error("课程不存在");
        }
        if (value < courseInfo.price) {
            throw new Error("付费不足，课程价格为：" + courseInfo.price);
        }
        let teacherMoney = new BigNumber(parseFloat(courseInfo.price) * 0.4);
        let teacherMoneyWei = teacherMoney.times(new BigNumber(1000000000000000000))
        // if (!courseInfo.uploaderAddress) {
        //     throw new Error(courseInfo.teacherName, courseInfo.price, courseInfo.courseId, courseInfo.time);
        // }
        // let pay_result = Blockchain.transfer(courseInfo.uploaderAddress, teacherMoney);
        let pay_result = Blockchain.transfer("n1HtMbVLEPqmk8Pd1f77gZJYJMJb2jH2T8v", teacherMoneyWei);

        if (!pay_result) {
            throw new Error("付费失败. ");
        }

        let subscribeRecord = this.SubscribeRecords.get(username);
        if (!subscribeRecord) {
            subscribeRecord = new SubscribeRecord()
        }
        subscribeRecord.courseIds.push(courseId)
        this.SubscribeRecords.put(username, subscribeRecord);
        return "success"

    },

    getSubsribeCourse: function () {
        let username = "zhangsan";
        return this.SubscribeRecords.get(username).courseIds;
    },

    uploadCourse: function () {
        let courseId = "20001";
        let price = "0";
        let teacherName = "liyongle";
        let time = "20160803";

        
        let from = Blockchain.transaction.from;
        let value = Blockchain.transaction.value;
        let course = this.uploadCourses.get(courseId);
 

        let poundage = new BigNumber(parseFloat(price) * 0.001);
        let poundageWei = poundage.times(new BigNumber(1000000000000000000));

        if (value < poundage) {
            throw new Error("你的转账额不足：" + value);
        }

        let uploadIds = this.uploadRecords.get(teacherName);
        if (!uploadIds) {
            uploadIds = new UploadRecord();
        }
        let uploadItem = new Course();
        uploadItem.price = new BigNumber(parseFloat(price));
        uploadItem.courseId = courseId;
        uploadItem.teacherName = teacherName;
        uploadItem.time = time;
        uploadItem.uploaderAddress = from;
        uploadIds.ids.push(courseId);
        this.uploadCourses.put(courseId, uploadItem);
        this.uploadRecords.put(teacherName, uploadIds);
    },

    /**
     *
     */
    getUploadIds: function () {
        let teacherName = "liyongle";
        return this.uploadRecords.get(teacherName).ids;
    },

    /**
     * Get upload course info
     * @param courseId  course id
     */
    getCourseInfo: function () {
        let courseId = "20001";
        let address = Blockchain.transaction.from;
        return this.uploadCourses.get(courseId);
    },

    getAddress: function () {
        return LocalContractStorage.get("address");
    }

};

module.exports = SuperXSchool;