<template>
	<view class="detail-page">
		<!-- 图片预览 -->
		<view class="image-container">
			<swiper 
				class="image-swiper" 
				:current="currentIndex"
				@change="onSwiperChange"
				:indicator-dots="imageList.length > 1"
				indicator-color="rgba(255,255,255,0.5)"
				indicator-active-color="#ffffff"
			>
				<swiper-item v-for="(image, index) in imageList" :key="image.id">
					<image 
						:src="image.url"
						mode="aspectFit"
						class="detail-image"
						@click="toggleToolbar"
						@error="onImageError"
					/>
				</swiper-item>
			</swiper>
			
			<!-- 工具栏 -->
			<view class="toolbar" :class="{ hidden: !showToolbar }">
				<view class="toolbar-left">
					<view class="back-btn" @click="handleBack">
						<uni-icons type="left" size="20" color="#ffffff" />
					</view>
				</view>
				
				<view class="toolbar-right">
					<view class="tool-btn" @click="handleFavorite">
						<uni-icons 
							:type="currentImage?.isFavorite ? 'heart-filled' : 'heart'"
							size="20" 
							:color="currentImage?.isFavorite ? '#FF3B30' : '#ffffff'"
						/>
					</view>
					<view class="tool-btn" @click="handleShare">
						<uni-icons type="redo" size="20" color="#ffffff" />
					</view>
					<view class="tool-btn" @click="handleDownload">
						<uni-icons type="download" size="20" color="#ffffff" />
					</view>
					<view class="tool-btn" @click="showInfo = !showInfo">
						<uni-icons type="info" size="20" color="#ffffff" />
					</view>
				</view>
			</view>
		</view>
		
		<!-- 图片信息面板 -->
		<view class="info-panel" :class="{ show: showInfo }">
			<view class="panel-header">
				<text class="panel-title">图片信息</text>
				<view class="close-btn" @click="showInfo = false">
					<uni-icons type="close" size="18" color="#999999" />
				</view>
			</view>
			
			<scroll-view class="panel-content" scroll-y>
				<view v-if="currentImage" class="info-content">
					<!-- 基本信息 -->
					<view class="info-section">
						<view class="info-item">
							<text class="label">标题</text>
							<text class="value">{{ currentImage.title }}</text>
						</view>
						<view class="info-item">
							<text class="label">描述</text>
							<text class="value">{{ currentImage.description || '暂无描述' }}</text>
						</view>
						<view class="info-item">
							<text class="label">作者</text>
							<text class="value">{{ currentImage.author }}</text>
						</view>
						<view class="info-item">
							<text class="label">上传时间</text>
							<text class="value">{{ formatTime(currentImage.createTime) }}</text>
						</view>
					</view>
					
					<!-- 技术信息 -->
					<view class="info-section">
						<text class="section-title">技术信息</text>
						<view class="info-item">
							<text class="label">尺寸</text>
							<text class="value">{{ currentImage.width }} × {{ currentImage.height }}</text>
						</view>
						<view class="info-item">
							<text class="label">文件大小</text>
							<text class="value">{{ currentImage.size }}</text>
						</view>
					</view>
					
					<!-- 标签 -->
					<view v-if="currentImage.tags?.length" class="info-section">
						<text class="section-title">标签</text>
						<view class="tags">
							<view v-for="tag in currentImage.tags" :key="tag" class="tag">
								{{ tag }}
							</view>
						</view>
					</view>
					
					<!-- 操作按钮 -->
					<view class="actions">
						<button class="action-btn secondary" @click="handleEdit">
							<uni-icons type="compose" size="16" color="#666666" />
							<text>编辑</text>
						</button>
						<button class="action-btn secondary" @click="handleMove">
							<uni-icons type="folder" size="16" color="#666666" />
							<text>移动</text>
						</button>
						<button class="action-btn danger" @click="handleDelete">
							<uni-icons type="trash" size="16" color="#FF3B30" />
							<text>删除</text>
						</button>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup lang="ts">
/**
 * 图片详情页 - TypeScript + Setup语法糖版本
 * 支持图片预览、信息查看、收藏、分享等功能
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { 
	formatTime, 
	navigateBack, 
	showToast, 
	showConfirm,
	saveImageToPhotosAlbum 
} from '@/utils/common'
import { api } from '@/utils/api'
import type { ImageItem } from '@/utils/api'

// 页面参数接口
interface PageParams {
	id: string
	index?: string
}

// 响应式数据
const imageList = ref<ImageItem[]>([])
const currentIndex = ref<number>(0)
const showToolbar = ref<boolean>(true)
const showInfo = ref<boolean>(false)
const loading = ref<boolean>(false)

// 计算当前图片
const currentImage = computed<ImageItem | null>(() => {
	return imageList.value[currentIndex.value] || null
})

/**
 * 页面加载时的参数处理
 */
onLoad((options: PageParams) => {
	if (options.id) {
		loadImageDetail(options.id)
		if (options.index) {
			currentIndex.value = parseInt(options.index)
		}
	}
})

/**
 * 加载图片详情
 */
const loadImageDetail = async (id: string): Promise<void> => {
	try {
		loading.value = true
		const response = await api.getImageDetail(id)
		
		if (response.code === 200 && response.data) {
			// 如果返回单张图片，创建数组
			imageList.value = [response.data]
			
			// 可以在这里加载相关图片或同分类图片
			await loadRelatedImages(response.data.categoryId, id)
		} else {
			showToast('图片不存在')
			navigateBack()
		}
	} catch (error) {
		console.error('加载图片详情失败:', error)
		showToast('加载失败')
		navigateBack()
	} finally {
		loading.value = false
	}
}

/**
 * 加载相关图片
 */
const loadRelatedImages = async (categoryId: string, excludeId: string): Promise<void> => {
	try {
		const response = await api.getCategoryImages(categoryId)
		if (response.code === 200) {
			const relatedImages = response.data.list.filter(img => img.id !== excludeId)
			// 将当前图片放在首位，其他相关图片放在后面
			imageList.value = [imageList.value[0], ...relatedImages.slice(0, 20)]
		}
	} catch (error) {
		console.error('加载相关图片失败:', error)
	}
}

/**
 * 轮播图切换
 */
const onSwiperChange = (e: any): void => {
	currentIndex.value = e.detail.current
}

/**
 * 图片加载错误
 */
const onImageError = (): void => {
	showToast('图片加载失败')
}

/**
 * 切换工具栏显示
 */
const toggleToolbar = (): void => {
	showToolbar.value = !showToolbar.value
}

/**
 * 返回上一页
 */
const handleBack = (): void => {
	navigateBack()
}

/**
 * 处理收藏
 */
const handleFavorite = async (): Promise<void> => {
	if (!currentImage.value) return
	
	try {
		const image = currentImage.value
		if (image.isFavorite) {
			await api.removeFavorite(image.id)
			showToast('已取消收藏')
		} else {
			await api.addFavorite(image.id)
			showToast('已添加收藏')
		}
		
		// 更新本地状态
		image.isFavorite = !image.isFavorite
	} catch (error) {
		console.error('收藏操作失败:', error)
		showToast('操作失败')
	}
}

/**
 * 处理分享
 */
const handleShare = (): void => {
	if (!currentImage.value) return
	
	// 这里可以实现分享功能
	showToast('分享功能开发中')
}

/**
 * 处理下载
 */
const handleDownload = async (): Promise<void> => {
	if (!currentImage.value) return
	
	try {
		showToast('正在保存到相册...')
		await saveImageToPhotosAlbum(currentImage.value.url)
		showToast('保存成功')
	} catch (error) {
		console.error('保存图片失败:', error)
		showToast('保存失败，请检查相册权限')
	}
}

/**
 * 处理编辑
 */
const handleEdit = (): void => {
	showToast('编辑功能开发中')
}

/**
 * 处理移动
 */
const handleMove = (): void => {
	showToast('移动功能开发中')
}

/**
 * 处理删除
 */
const handleDelete = async (): Promise<void> => {
	if (!currentImage.value) return
	
	const confirmed = await showConfirm('确定要删除这张图片吗？')
	if (confirmed) {
		showToast('删除功能开发中')
	}
}

// 监听系统导航栏
onMounted(() => {
	// 隐藏导航栏，实现沉浸式体验
	uni.hideNavigationBarLoading?.()
})

onUnmounted(() => {
	// 清理资源
})
</script>

<style lang="scss" scoped>
	.detail-page {
		width: 100vw;
		height: 100vh;
		background-color: #000000;
		position: relative;
		overflow: hidden;
	}

	.image-container {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.image-swiper {
		width: 100%;
		height: 100%;
	}

	.detail-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.toolbar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		transition: opacity 0.3s ease;
		z-index: 10;
	}

	.toolbar.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.toolbar-left,
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 30rpx;
	}

	.back-btn,
	.tool-btn {
		width: 70rpx;
		height: 70rpx;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
		transition: all 0.2s ease;
	}

	.back-btn:active,
	.tool-btn:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.7);
	}

	.info-panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		border-radius: 30rpx 30rpx 0 0;
		max-height: 70vh;
		transform: translateY(100%);
		transition: transform 0.3s ease;
		z-index: 20;
	}

	.info-panel.show {
		transform: translateY(0);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.panel-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
	}

	.close-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.panel-content {
		max-height: calc(70vh - 120rpx);
	}

	.info-content {
		padding: 40rpx;
	}

	.info-section {
		margin-bottom: 50rpx;
	}

	.section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 30rpx;
		display: block;
	}

	.info-item {
		display: flex;
		margin-bottom: 25rpx;
		align-items: flex-start;
	}

	.label {
		width: 140rpx;
		font-size: 26rpx;
		color: #999999;
		flex-shrink: 0;
	}

	.value {
		flex: 1;
		font-size: 26rpx;
		color: #333333;
		line-height: 1.5;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}

	.tag {
		background-color: #f0f6ff;
		color: #007AFF;
		font-size: 24rpx;
		padding: 8rpx 16rpx;
		border-radius: 15rpx;
		line-height: 1;
	}

	.actions {
		display: flex;
		gap: 20rpx;
		margin-top: 40rpx;
	}

	.action-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 20rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		font-size: 26rpx;
		transition: all 0.2s ease;
	}

	.action-btn.secondary {
		background-color: #f5f5f5;
		color: #666666;
	}

	.action-btn.danger {
		background-color: #fff2f2;
		color: #FF3B30;
	}

	.action-btn:active {
		transform: scale(0.98);
	}

	/* 状态栏适配 */
	.toolbar {
		padding-top: calc(env(safe-area-inset-top) + 20rpx);
		height: calc(100rpx + env(safe-area-inset-top));
	}
</style> 