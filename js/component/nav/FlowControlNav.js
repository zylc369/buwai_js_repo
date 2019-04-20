/**
 * 流程控制导航数据
 */
class FlowControlNavData {
    constructor(id, text, flag, clickCallback) {
        this.id = id;
        this.text = text;
        this.flag = flag;
        this.clickCallback = clickCallback;
    }
}

/**
 * 流程控制导航
 */
class FlowControlNav {
    /**
     * 构造器
     * @param appendTargetId 追加到目标标签下
     * @param flowControlNavDataList  流程控制导航数据列表
     */
    constructor(appendTargetId, flowControlNavDataList) {
        this.appendTargetId = appendTargetId;
        this.flowControlNavDataList = flowControlNavDataList;
        this._init();
    }

    _init() {
        $("#" + this.appendTargetId).empty();

        this.html = "<div id='nav-flow-controls'>";
        let length = this.flowControlNavDataList.length;
        for (let index = 0; index < length; index++) {
            let flowControlNavData = this.flowControlNavDataList[index];
            if (FlowControlNav._isButtonFlag(flowControlNavData.flag)) {
                this.html += "<button type='button' id='" + flowControlNavData.id + "' sort='" + index + "' class='button nav-flow-control' flag='" + flowControlNavData.flag + "'>" + flowControlNavData.text + "</button>";
            }
        }
        this.html += "<hr/></div>";
        $('#' + this.appendTargetId).append(this.html);

        let $navFlowControlList = $(".nav-flow-control");
        for (let $item of $navFlowControlList) {
            $item.componentObject = this;
        }
        $("." + FlowControlNav._getRealClass("nav-flow-control")).bind('click', function () {
            this.componentObject._click(parseInt($(this).attr('sort')));
        });
    }

    static _isButtonFlag(flag) {
        return ((FlowControlNav.FLAG_FINISH & flag) > 0) || ((FlowControlNav.FLAG_SKIP & flag) > 0) || ((FlowControlNav.FLAG_NO_NEED & flag) > 0);
    }

    static _getRealClass(className) {
        return className;
    }

    _click(sort) {
        let flowControlNavData = this.flowControlNavDataList[sort];
        flowControlNavData.clickCallback(flowControlNavData);
    }
}

FlowControlNav.FLAG_SKIP = 1;
FlowControlNav.FLAG_NO_NEED = 1 << 1;
FlowControlNav.FLAG_FINISH = 1 << 2;
