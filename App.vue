<template>
	<view id="app">
		<!-- 应用程序入口 -->
	</view>
</template>

<script setup lang="ts">
/**
 * 应用程序入口文件
 * 使用 Vue 3 setup 语法糖 + TypeScript
 */
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

// 用户信息类型定义
interface UserInfo {
	id: string
	nickname: string
	avatar: string
}

// 初始化应用数据
const initApp = (): void => {
	initStorage()
	initNetworkStatus()
}

/**
 * 初始化本地存储
 */
const initStorage = (): void => {
	// 如果没有用户信息，创建默认用户信息
	if (!uni.getStorageSync('userInfo')) {
		const defaultUserInfo: UserInfo = {
			id: '1',
			nickname: '图库用户',
			avatar: '/static/images/default_avatar.png'
		}
		uni.setStorageSync('userInfo', defaultUserInfo)
	}
	
	// 初始化收藏列表
	if (!uni.getStorageSync('favorites')) {
		uni.setStorageSync('favorites', [] as string[])
	}
	
	// 初始化分类数据
	if (!uni.getStorageSync('categories')) {
		uni.setStorageSync('categories', [] as any[])
	}
}

/**
 * 初始化网络状态监听
 */
const initNetworkStatus = (): void => {
	uni.onNetworkStatusChange((res) => {
		console.log('网络状态变化:', res)
		if (!res.isConnected) {
			uni.showToast({
				title: '网络连接已断开',
				icon: 'none'
			})
		}
	})
}

// 应用生命周期
onLaunch(() => {
	console.log('App Launch - 应用启动')
	initApp()
})

onShow(() => {
	console.log('App Show - 应用显示')
})

onHide(() => {
	console.log('App Hide - 应用隐藏')
})
</script>

<style lang="scss">
	/* 全局样式 */
	* {
		box-sizing: border-box;
	}
	
	#app {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	
	/* 通用样式 */
	.container {
		padding: 20rpx;
		background-color: #f8f8f8;
		min-height: 100vh;
	}
	
	.card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.flex-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	
	.flex-column {
		display: flex;
		flex-direction: column;
	}
	
	.flex-center {
		justify-content: center;
		align-items: center;
	}
	
	.flex-between {
		justify-content: space-between;
	}
	
	.text-primary {
		color: #007AFF;
	}
	
	.text-secondary {
		color: #999999;
	}
	
	.text-danger {
		color: #FF3B30;
	}
	
	.text-success {
		color: #34C759;
	}
	
	.btn {
		padding: 20rpx 40rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		text-align: center;
		border: none;
		display: inline-block;
		transition: all 0.3s ease;
	}
	
	.btn-primary {
		background-color: #007AFF;
		color: #ffffff;
	}
	
	.btn-primary:active {
		background-color: #0056CC;
	}
	
	.btn-secondary {
		background-color: #F2F2F7;
		color: #333333;
	}
	
	.btn-secondary:active {
		background-color: #E5E5EA;
	}
	
	/* 图片相关样式 */
	.image-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
		gap: 10rpx;
	}
	
	.image-item {
		width: 48%;
		margin-bottom: 10rpx;
	}
	
	.image-item image {
		width: 100%;
		border-radius: 12rpx;
	}
	
	/* 动画效果 */
	.fade-in {
		animation: fadeIn 0.3s ease-in-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	/* 加载状态 */
	.loading {
		text-align: center;
		padding: 40rpx;
		color: #999999;
		font-size: 28rpx;
	}
	
	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 100rpx 40rpx;
	}
	
	.empty-state image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}
	
	.empty-state text {
		color: #999999;
		font-size: 28rpx;
	}
</style> 