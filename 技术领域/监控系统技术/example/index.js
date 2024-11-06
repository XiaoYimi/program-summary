/** ======== 上报数据前的数据获取类型 ======== */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/** ======== 监控数据上报 ======== */
var MonitorBeacon = /** @class */ (function () {
    function MonitorBeacon(url) {
        this.ReportAddress = url;
    }
    MonitorBeacon.prototype.send = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('上报监控数据', data);
                return [2 /*return*/, true];
            });
        });
    };
    return MonitorBeacon;
}());
/** ======== 埋点数据上报 ======== */
var BurialPointBeacon = /** @class */ (function () {
    function BurialPointBeacon(url) {
        this.ReportAddress = url;
    }
    BurialPointBeacon.prototype.send = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('上报埋点数据', data);
                return [2 /*return*/, true];
            });
        });
    };
    return BurialPointBeacon;
}());
/** ======== Beacon 上下文对象(对外引用对象) ======== */
var BeaconContxt = /** @class */ (function () {
    function BeaconContxt() {
        this.Beacon = null;
        this.BeaconType = 'MonitorBeacon';
        this.BeaconConfig = {
            MonitorURL: '',
            BurialPointURL: '',
        };
    }
    Object.defineProperty(BeaconContxt.prototype, "ReportAddress", {
        /** ======== 获取上报地址 ======== */
        get: function () {
            var _a = this.BeaconConfig, MonitorURL = _a.MonitorURL, BurialPointURL = _a.BurialPointURL;
            return this.BeaconType
                ? this.BeaconType === 'MonitorBeacon'
                    ? MonitorURL
                    : BurialPointURL
                : '';
        },
        enumerable: false,
        configurable: true
    });
    /** ======== 配置前端埋点与监控的上报地址 ======== */
    BeaconContxt.prototype.config = function (config) {
        var type = config.type, MonitorURL = config.MonitorURL, BurialPointURL = config.BurialPointURL;
        this.BeaconConfig.MonitorURL = MonitorURL;
        this.BeaconConfig.BurialPointURL = BurialPointURL;
        /** 在配置过程中初始化具体策略实例 */
        if (type) {
            this.use(type);
            this.BeaconType = type;
        }
    };
    /** ======== 切换使用具体策略对象 ======== */
    BeaconContxt.prototype.use = function (type) {
        if (type === void 0) { type = 'MonitorBeacon'; }
        this.init();
        this.BeaconType = type;
        if (type === 'MonitorBeacon') {
            this.Beacon = new MonitorBeacon(this.BeaconConfig.MonitorURL);
        }
        else if (type === 'BurialPointBeacon') {
            this.Beacon = new BurialPointBeacon(this.BeaconConfig.BurialPointURL);
        }
        return this.Beacon;
    };
    /** ======== 检测具体策略的上报地址是否存在 ======== */
    BeaconContxt.prototype.init = function () {
        var _a = this.BeaconConfig, MonitorURL = _a.MonitorURL, BurialPointURL = _a.BurialPointURL;
        var LossBeaconConfig = [MonitorURL, BurialPointURL].some(function (url) { return !url; });
        if (LossBeaconConfig)
            throw new Error('缺少前端埋点与监控的上报地址');
        console.info('配置初始化成功');
    };
    BeaconContxt.prototype.send = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var ReportResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.Beacon.send(data)];
                    case 1:
                        ReportResult = _a.sent();
                        return [2 /*return*/, ReportResult];
                }
            });
        });
    };
    return BeaconContxt;
}());
var beacon = new BeaconContxt();
beacon.config({
    MonitorURL: 'http://localhost:3000/monitor',
    BurialPointURL: 'http://localhost:3000/burialPoint',
    type: 'MonitorBeacon',
});
var p1 = beacon.send({
    name: 'monitor',
    age: 18,
});
beacon.use('BurialPointBeacon');
var p2 = beacon.send({
    name: 'burialPoint',
    age: 18,
});
console.log(p1, p2);
