/**
 * TAB描述
 */
class TabDescription {
    constructor(tabId, title, showDivId) {
        this.tabId = tabId;
        this.title = title;
        this.showDivId = showDivId;
        this.showDivHtml = $('#' + showDivId).prop('outerHTML');
    }
}

/**
 * TAB数据处理器
 */
class ITabDataProcessor {
    constructor(tabDescription) {
        this.tabDescription = tabDescription;
    }
    afterTabInit() {}
    writePage() {}
    readPage() {}
}

class Tab {
    /**
     * 构造器
     *
     * @param cssConfig CSS配置
     * @param appendTargetId 追加到目标标签下
     * @param componentId 设置TAB组件的ID
     * @param tabDataProcessorList TAB组件数据列表
     * @param progressive 是否递进模式。true: 是；false: 不是
     */
    constructor(cssConfig, appendTargetId, componentId, tabDataProcessorList, progressive) {
        this.cssConfig = cssConfig;
        this.appendTargetId = appendTargetId;
        this.componentId = componentId;
        this.tabDataProcessorList = tabDataProcessorList;
        this.progressive = progressive;
        this.step = 0;
        this._init();
    }

    _init() {
        $("#" + this.appendTargetId).empty();
        let dataLength = this.tabDataProcessorList.length;
        this.tabHtml = "<div id='" + this.componentId + "' class='" + this._getRealClass("tab-contain") + "'>";
        this.tabHtml += "<ul class='" + this._getRealClass("tabs") + "'>";
        this.currentTabDataProcessor = this.tabDataProcessorList[0];
        for (let index = 0; index < dataLength; index++) {
            let tabDescription = this.tabDataProcessorList[index].tabDescription;
            $('#' + tabDescription.showDivId).remove();
            let htmlItem = "<li" + (0 === index ? " class='" + this._getRealClass("tab-current") + "'" : "") + " id='" + tabDescription.tabId +
            "' sort='" + index + "'><a href='#' class='" + this._getRealClass("tab-marker") + "'>" + tabDescription.title + "</a></li>";
            this.tabHtml += htmlItem;
        }
        this.tabHtml += "</ul>";
        this.tabHtml += "<div class='" + this._getRealClass("tab-content") + "'>";
        for (let index = 0; index < dataLength; index++) {
            let tabDescription = this.tabDataProcessorList[index].tabDescription;
            this.tabHtml += tabDescription.showDivHtml;
        }
        this.tabHtml += "</div>";
        this.tabHtml += "</dev>";
        this.$tab = $(this.tabHtml);
        $('#' + this.appendTargetId).append(this.$tab);
        $('#' + this.currentTabDataProcessor.tabDescription.showDivId).show();

        for (let index = 0; index < dataLength; index++) {
            let tabDescription = this.tabDataProcessorList[index].tabDescription;
            let $element = getElementByIdJQuery(tabDescription.tabId);
            $element[0].componentObject = this;
            $element.bind('click', function () {
                this.componentObject._switchTab(parseInt($(this).attr('sort')));
            });
        }

        if (this.progressive) {
            this._initProgressive();
        }

        // 调用处理器初始化后置函数
        for (let item of this.tabDataProcessorList) {
            item.afterTabInit();
        }
    }

    /**
     * 初始化递进
     * @private
     */
    _initProgressive() {
        this.progressiveHtml = "<div class='tab-progressive-flow-control'>" +
            "<button type=\"button\" class=\"button nav-flow-control\" flag='" + Tab.FLAG_PROGRESSIVE_BUTTON_PREVIOUS + "'>上一步</button>" +
            "<button type=\"button\" class=\"button nav-flow-control\" flag='" + Tab.FLAG_PROGRESSIVE_BUTTON_NEXT + "'>下一步</button></div>";
        this.$progressiveComponent = $(this.progressiveHtml);
        $('#' + this.appendTargetId).append(this.$progressiveComponent);
        this._setProgressiveButtonState(this.step);

        let buttonList = this.$progressiveComponent.children("button");
        for (let item of buttonList) {
            item.componentObject = this;
        }
        buttonList.bind('click', function () {
            this.componentObject._progressiveButtonProcess($(this));
        })
    }

    /**
     * 递进按钮处理
     * @param component 组件
     * @private
     */
    _progressiveButtonProcess(component) {
        let flag = component.attr('flag');
        let sort = -1;
        if (flag === Tab.FLAG_PROGRESSIVE_BUTTON_NEXT) {
            if ((this.step + 1) === this.tabDataProcessorList.length) {
                return;
            }
            sort = this.step + 1;
        } else if (flag === Tab.FLAG_PROGRESSIVE_BUTTON_PREVIOUS) {
            if (0 === this.step) {
                return;
            }
            sort = this.step - 1;
        }
        this._switchTab(sort);
    }

    /**
     * 设置递进按钮状态
     * @param step 当前tab的步骤
     * @private
     */
    _setProgressiveButtonState(step) {
        if (0 === step) {
            this._disableButton(Tab.FLAG_PROGRESSIVE_BUTTON_PREVIOUS, true);
            this._disableButton(Tab.FLAG_PROGRESSIVE_BUTTON_NEXT, false);
        } else if (this.tabDataProcessorList.length === (step + 1)) {
            this._disableButton(Tab.FLAG_PROGRESSIVE_BUTTON_PREVIOUS, false);
            this._disableButton(Tab.FLAG_PROGRESSIVE_BUTTON_NEXT, true);
        } else {
            this._disableButton(Tab.FLAG_PROGRESSIVE_BUTTON_PREVIOUS, false);
            this._disableButton(Tab.FLAG_PROGRESSIVE_BUTTON_NEXT, false);
        }
    }

    _disableButton(flag, isDisable) {
        let $component = this._getProgressiveComponents(flag);
        if (isDisable) {
            $component.attr('disabled', true);
            $component.addClass('disable_style');
        } else {
            $component.attr('disabled', false);
            $component.removeClass('disable_style');
        }
    }

    _getProgressiveComponents(flag) {
        return $(this.$progressiveComponent.children("*[flag*='" + flag + "']"));
    }

    _getRealClass(className) {
        return className + "-" + this.cssConfig;
    }

    _switchTab(sort) {
        getElementByIdJQuery(this.currentTabDataProcessor.tabDescription.showDivId).hide();
        getElementByIdJQuery(this.currentTabDataProcessor.tabDescription.tabId).removeClass(this._getRealClass("tab-current"));
        this.currentTabDataProcessor.readPage();

        this.currentTabDataProcessor = this.tabDataProcessorList[sort];
        getElementByIdJQuery(this.currentTabDataProcessor.tabDescription.tabId).addClass(this._getRealClass("tab-current"));
        getElementByIdJQuery(this.currentTabDataProcessor.tabDescription.showDivId).show();
        this.currentTabDataProcessor.writePage();
        if (this.progressive) {
            this._setProgressiveButtonState(sort)
        }
        this.step = sort;
    }
}

/**
 * 初始化
 * @type {number}
 */
Tab.STATE_INIT = 0;
/**
 * 激活
 * @type {number}
 */
Tab.STATE_ACTIVATE = 1;
/**
 * 被切换
 * @type {number}
 */
Tab.STATE_SWITCHED = 2;

/**
 * 按钮下一步标识
 * @type {string}
 */
Tab.FLAG_PROGRESSIVE_BUTTON_PREVIOUS = "previous";

/**
 * 按钮下一步标识
 * @type {string}
 */
Tab.FLAG_PROGRESSIVE_BUTTON_NEXT = "next";