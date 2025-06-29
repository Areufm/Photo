# 📸 图库管理应用 (Photo Gallery)

> 基于 **uniapp + Vue 3 + TypeScript** 的现代化跨平台图库管理应用

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.3+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue.svg)
![Platform](https://img.shields.io/badge/platform-H5%7C小程序%7CApp-lightgrey.svg)

## ✨ 特性

### 🔥 新版本亮点 (v2.0.0)
- 🚀 **Vue 3 Composition API** - 使用最新的 `<script setup>` 语法糖
- 📝 **完整 TypeScript 支持** - 享受类型安全和智能提示
- 🎯 **现代化架构** - 模块化设计，代码可维护性更强
- 🔧 **完善的工具链** - ESLint、TypeScript 编译检查
- 📚 **完整类型定义** - 包含 uni-app、API 接口的完整类型声明

### 📱 核心功能
- **图片浏览** - 瀑布流网格展示，支持缩略图预览
- **详情查看** - 高清大图预览，左右滑动浏览
- **智能搜索** - 支持标题、描述、标签的模糊搜索
- **分类管理** - 自定义分类，支持新建、编辑、删除
- **收藏功能** - 一键收藏，便捷管理喜爱的图片
- **信息展示** - 完整的图片元数据（尺寸、大小、时间等）
- **本地存储** - 离线缓存，提升用户体验
- **响应式设计** - 适配各种屏幕尺寸

## 🛠️ 技术栈

### 前端框架
- **[uni-app](https://uniapp.dcloud.net.cn/)** - 跨平台应用开发框架
- **[Vue 3](https://vuejs.org/)** - 渐进式 JavaScript 框架
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript 的超集，提供类型安全

### 开发工具
- **Vue 3 Composition API** - 响应式数据管理
- **`<script setup>`** - 最新的 Vue 3 语法糖
- **Pinia/Vuex** - 状态管理（可选）
- **SCSS** - CSS 预处理器

### 构建工具
- **HBuilderX** / **CLI** - uni-app 开发环境
- **Vue CLI** - Vue.js 官方脚手架
- **TypeScript Compiler** - 类型检查
- **ESLint** - 代码规范检查

## 📁 项目结构

```
Photo/
├── components/              # 可复用组件
│   └── ImageCard.vue       # 图片卡片组件 (TS + Setup)
├── pages/                  # 页面文件
│   ├── index/              # 首页
│   │   └── index.vue      # 图片网格展示 (TS + Setup)
│   ├── detail/             # 详情页
│   │   └── detail.vue     # 图片详情预览 (TS + Setup)
│   ├── category/           # 分类页面
│   │   ├── category.vue   # 分类管理 (TS + Setup)
│   │   └── folder.vue     # 分类详情
│   ├── favorites/          # 收藏页
│   │   └── favorites.vue  # 收藏列表
│   └── profile/            # 个人中心
│       └── profile.vue    # 用户信息
├── utils/                  # 工具函数
│   ├── api.ts             # API 接口 (完整 TS 类型)
│   └── common.ts          # 通用工具 (完整 TS 类型)
├── types/                  # 类型声明文件
│   └── uni-app.d.ts       # uni-app 类型声明
├── static/                 # 静态资源
├── App.vue                # 应用入口 (TS + Setup)
├── pages.json             # 页面配置
├── manifest.json          # 应用配置
├── tsconfig.json          # TypeScript 配置
├── package.json           # 依赖管理
└── README.md              # 项目说明
```

## 🚀 快速开始

### 环境要求
- **Node.js** >= 16.0.0
- **HBuilderX** 最新版本 (推荐)
- **Vue CLI** >= 5.0.0 (可选)

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 开发运行

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# App 开发
npm run dev:app

# TypeScript 类型检查
npm run type-check

# 代码格式检查
npm run lint
```

### 生产构建

```bash
# 构建 H5
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin

# 构建 App
npm run build:app
```

## 💻 开发指南

### TypeScript 使用

项目已完全支持 TypeScript，包含：

1. **完整的类型定义**
```typescript
// API 接口类型
interface ImageItem {
  id: string
  url: string
  title: string
  // ...更多属性
}

// 组件 Props 类型
interface Props {
  image: ImageItem
}
```

2. **Setup 语法糖**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ImageItem } from '@/utils/api'

const images = ref<ImageItem[]>([])
const filteredImages = computed<ImageItem[]>(() => {
  // 类型安全的计算逻辑
})
</script>
```

3. **工具函数类型**
```typescript
// 完整的函数签名
export const formatTime = (
  time: string | Date, 
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  // 实现逻辑
}
```

### 组件开发

所有组件都使用最新的 Vue 3 特性：

```vue
<script setup lang="ts">
// 定义属性类型
interface Props {
  data: SomeType
}

// 定义事件类型
interface Emits {
  (event: 'update', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
```

### API 接口

使用完整的 TypeScript 类型定义：

```typescript
class ApiService {
  async getImageList(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ImageItem>>> {
    return request<PaginatedResponse<ImageItem>>({
      url: '/api/images',
      method: 'GET',
      data: params
    })
  }
}
```

## 📦 功能模块

### 1. 首页 (index)
- ✅ 图片网格展示
- ✅ 搜索筛选功能
- ✅ 收藏操作
- ✅ 上传按钮
- ✅ TypeScript + Setup 语法糖

### 2. 图片详情 (detail)
- ✅ 高清图片预览
- ✅ 左右滑动浏览
- ✅ 工具栏操作
- ✅ 信息面板
- ✅ TypeScript + Setup 语法糖

### 3. 分类管理 (category)
- ✅ 分类网格展示
- ✅ 新建/编辑分类
- ✅ 删除确认
- ✅ 封面选择
- ✅ TypeScript + Setup 语法糖

### 4. 收藏列表 (favorites)
- ✅ 收藏图片展示
- ✅ 批量操作
- ✅ 搜索排序

### 5. 个人中心 (profile)
- ✅ 用户信息展示
- ✅ 统计数据
- ✅ 功能菜单

## 🎨 界面设计

- **现代化 UI** - 简洁美观的界面设计
- **响应式布局** - 适配不同设备屏幕
- **流畅动画** - 丰富的交互效果
- **暗色模式** - 支持深色主题（计划中）

## 📱 平台支持

- ✅ **H5** - 现代浏览器
- ✅ **微信小程序** - 微信生态
- ✅ **支付宝小程序** - 支付宝生态
- ✅ **App** - iOS / Android
- 🔄 **百度小程序** - 计划支持
- 🔄 **字节跳动小程序** - 计划支持

## 🔧 配置说明

### TypeScript 配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "jsx": "preserve",
    // ...更多配置
  }
}
```

### 路径别名
```typescript
// 配置在 tsconfig.json
"paths": {
  "@/*": ["./*"]
}
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建新的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

## 🔗 相关链接

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [HBuilderX 下载](https://www.dcloud.io/hbuilderx.html)

## 📞 联系我们

如果您有任何问题或建议，欢迎通过以下方式联系：

- 📧 Email: your-email@example.com
- 💬 QQ群: 123456789
- 📱 微信: your-wechat

---

⭐ 如果这个项目对您有帮助，请给一个 Star 支持一下！ 