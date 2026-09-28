<div align="center">

# Vibe Coding 模拟器

### 当 AI 取代一切，你还能活多久？

[🎮 开始游戏](https://thatbobo.com/vibe_coding_sim/)

[English](README.md) · [简体中文](README.zh-CN.md)

</div>

![Vibe Coding 模拟器游戏画面](https://github.com/user-attachments/assets/3ee9b981-42d5-4ed6-8d5c-97742d2a37ef)

Vibe Coding 模拟器是一款关于 **AI 编程时代生存** 的网页游戏。你以 **5,000 元** 起步，手里只有一台电脑和不断增加的生活压力：Token 价格持续波动，房租每七天到期，而你的每个决定都会影响还能坚持多久。

你可以购买 AI Token 接单赚钱，在不同市场之间低买高卖，也可以投资 GPU 算力、自己生产 Token。你需要同时管理现金流、精神状态和行业信誉，在 AI 浪潮中找到适合自己的生存策略，努力积累财富并最终退休。

## 游戏玩法

- **买 Token、接项目。** 选择合适的模型接单，在成本、质量和完成风险之间做取舍。
- **经营交易市场。** 官方 API 商城价格稳定但持续上涨；闲鱼二手区可能有折扣，也可能藏着风险和陷阱。
- **维持生活状态。** 房租、电费、咖啡、休息和信誉都会影响你能做出的选择。
- **建设算力生意。** 解锁 GPU 算力中心，选择生产模型，并权衡产出、电费和设备寿命。
- **关注市场消息。** 浏览 Twitter 资讯，及时了解 Token 行情和 AI 行业的突发事件。
- **选择退休时机。** 资产足够时可以清算退休，也可以继续挑战，看看自己能否撑过下一轮市场变化。

## 本地运行

需要 **Node.js 20 或更高版本**。

```bash
git clone https://github.com/Luciferbobo/vibe_coding_sim.git
cd vibe_coding_sim
npm ci
npm run dev
```

打开 Vite 输出的本地地址，通常是 `http://localhost:5173/`。

生成生产版本并在本地预览：

```bash
npm run build
npm run preview
```

## 技术栈

React · TypeScript · Vite · Zustand · Tailwind CSS

## License

本项目使用 [PolyForm Noncommercial License 1.0.0](LICENSE) 授权，禁止商业使用。

