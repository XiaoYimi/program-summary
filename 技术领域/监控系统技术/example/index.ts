/** ======== 上报数据前的数据获取类型 ======== */

// 设备基本信息
interface WinScreen {
  // 分辨率(设备屏幕)
  width: number;
  height: number;
  // 可用分辨率(浏览器宽高)
  innerWidth: number;
  innerHeight: number;
  // 有效分辨率(浏览器宽高 - 任务栏)
  availWidth: number;
  availHeight: number;
}
interface WinEnviron {
  // 浏览器类型
  userAgent: string;
  // 浏览器语言
  language: string;
  // 浏览器版本
  appVersion: string;
  // 操作系统
  platform: string;
  // 系统语言
  systemLanguage: string;
  // 系统版本
  systemVersion: string;
}
interface WinInfo {}

type ReportAddress = string;
type BeaconType = 'MonitorBeacon' | 'BurialPointBeacon';

interface BeaconConfig {
  MonitorURL: ReportAddress;
  BurialPointURL: ReportAddress;
  type?: BeaconType;
}

/** ======== 抽象类对象(统一接口) ======== */
interface BaseBeacon {
  // 统一上报接口
  send<T extends object>(data: T): Promise<boolean>;
}

/** ======== 监控数据上报 ======== */
class MonitorBeacon implements BaseBeacon {
  private readonly ReportAddress: string;

  constructor(url: string) {
    this.ReportAddress = url;
  }
  public async send<T extends object>(data: T): Promise<boolean> {
    console.log('上报监控数据', data);
    return true;
  }
}

/** ======== 埋点数据上报 ======== */
class BurialPointBeacon implements BaseBeacon {
  private readonly ReportAddress: string;

  constructor(url: string) {
    this.ReportAddress = url;
  }

  public async send<T extends object>(data: T): Promise<boolean> {
    console.log('上报埋点数据', data);
    return true;
  }
}

/** ======== Beacon 上下文对象(对外引用对象) ======== */
class BeaconContxt {
  private Beacon: BaseBeacon | null = null;
  private BeaconType: BeaconType = 'MonitorBeacon';
  private readonly BeaconConfig: Omit<BeaconConfig, 'type'> = {
    MonitorURL: '',
    BurialPointURL: '',
  };

  /** ======== 获取上报地址 ======== */
  public get ReportAddress(): ReportAddress {
    const { MonitorURL, BurialPointURL } = this.BeaconConfig;
    return this.BeaconType
      ? this.BeaconType === 'MonitorBeacon'
        ? MonitorURL
        : BurialPointURL
      : '';
  }

  /** ======== 配置前端埋点与监控的上报地址 ======== */
  public config(config: BeaconConfig): void {
    const { type, MonitorURL, BurialPointURL } = config;

    this.BeaconConfig.MonitorURL = MonitorURL;
    this.BeaconConfig.BurialPointURL = BurialPointURL;

    /** 在配置过程中初始化具体策略实例 */
    if (type) {
      this.use(type);
      this.BeaconType = type;
    }
  }

  /** ======== 切换使用具体策略对象 ======== */
  public use(type: BeaconType = 'MonitorBeacon'): BaseBeacon {
    this.init();
    this.BeaconType = type;
    if (type === 'MonitorBeacon') {
      this.Beacon = new MonitorBeacon(this.BeaconConfig.MonitorURL);
    } else if (type === 'BurialPointBeacon') {
      this.Beacon = new BurialPointBeacon(this.BeaconConfig.BurialPointURL);
    }

    return this.Beacon!;
  }

  /** ======== 检测具体策略的上报地址是否存在 ======== */
  private init(): void {
    const { MonitorURL, BurialPointURL } = this.BeaconConfig;
    const LossBeaconConfig = [MonitorURL, BurialPointURL].some(url => !url);
    if (LossBeaconConfig) throw new Error('缺少前端埋点与监控的上报地址');
    console.info('配置初始化成功');
  }

  public async send<T extends object>(data: T): Promise<boolean> {
    /** data 对象内容定义
     * 通用内容有：用户id、角色、权限，设备信息，页面信息，事件信息等。
     * 业务内容有：根据场景需要传入对应内容数据。
     * */
    const ReportResult = await this.Beacon!.send(data);
    return ReportResult;
  }
}

const beacon = new BeaconContxt();

beacon.config({
  MonitorURL: 'http://localhost:3000/monitor',
  BurialPointURL: 'http://localhost:3000/burialPoint',
  type: 'MonitorBeacon',
});

const p1 = beacon.send({
  name: 'monitor',
  age: 18,
});

beacon.use('BurialPointBeacon');

const p2 = beacon.send({
  name: 'burialPoint',
  age: 18,
});

console.log(p1, p2);
