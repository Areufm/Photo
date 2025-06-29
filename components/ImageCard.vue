<template>
	<view class="image-card" @click="handleClick">
		<!-- 图片容器 -->
		<view class="image-container">
			<image 
				:src="image.thumbnail" 
				mode="aspectFill" 
				class="image"
				:lazy-load="true"
				@load="onImageLoad"
				@error="onImageError"
			/>
			
			<!-- 加载状态 -->
			<view v-if="imageLoading" class="loading-mask">
				<uni-icons type="spinner-cycle" size="20" color="#ffffff" />
			</view>
			
			<!-- 收藏按钮 -->
			<view class="favorite-btn" @click.stop="handleFavorite">
				<uni-icons 
					:type="image.isFavorite ? 'heart-filled' : 'heart'" 
					size="20" 
					:color="image.isFavorite ? '#FF3B30' : '#ffffff'"
				/>
			</view>
			
			<!-- 图片信息遮罩 -->
			<view class="image-overlay">
				<view class="image-info">
					<text class="image-title">{{ image.title }}</text>
					<text class="image-meta">{{ formatImageMeta }}</text>
				</view>
			</view>
		</view>
		
		<!-- 图片标签 -->
		<view v-if="image.tags && image.tags.length > 0" class="tags">
			<view 
				v-for="tag in image.tags.slice(0, 2)" 
				:key="tag"
				class="tag"
			>
				{{ tag }}
			</view>
			<view v-if="image.tags.length > 2" class="tag more">
				+{{ image.tags.length - 2 }}
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
/**
 * 图片卡片组件 - TypeScript + Setup语法糖版本
 * 用于展示图片信息的卡片组件
 */
import { ref, computed } from 'vue'
import { getRelativeTime } from '@/utils/common'
import type { ImageItem } from '@/utils/api'

// 定义组件属性接口
interface Props {
	image: ImageItem
}

// 定义组件事件接口
interface Emits {
	(event: 'click', image: ImageItem): void
	(event: 'favorite', image: ImageItem): void
}

// 使用defineProps和defineEmits
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const imageLoading = ref<boolean>(true)

// 计算图片元信息显示
const formatImageMeta = computed<string>(() => {
	const parts: string[] = []
	
	// 添加相对时间
	if (props.image.createTime) {
		parts.push(getRelativeTime(props.image.createTime))
	}
	
	// 添加文件大小
	if (props.image.size) {
		parts.push(props.image.size)
	}
	
	// 添加分辨率
	if (props.image.width && props.image.height) {
		parts.push(`${props.image.width}×${props.image.height}`)
	}
	
	return parts.join(' • ')
})

/**
 * 图片加载完成
 */
const onImageLoad = (): void => {
	imageLoading.value = false
}

/**
 * 图片加载失败
 */
const onImageError = (): void => {
	imageLoading.value = false
	console.error('图片加载失败:', props.image.thumbnail)
}

/**
 * 处理卡片点击
 */
const handleClick = (): void => {
	emit('click', props.image)
}

/**
 * 处理收藏按钮点击
 */
const handleFavorite = (): void => {
	emit('favorite', props.image)
}
</script>

<style lang="scss" scoped>
	.image-card {
		border-radius: 16rpx;
		overflow: hidden;
		background-color: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.image-card:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
	}

	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 3/4;
		overflow: hidden;
	}

	.image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.image-card:hover .image {
		transform: scale(1.05);
	}

	.loading-mask {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.favorite-btn {
		position: absolute;
		top: 15rpx;
		right: 15rpx;
		width: 60rpx;
		height: 60rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
		transition: all 0.2s ease;
		z-index: 2;
	}

	.favorite-btn:active {
		transform: scale(0.9);
		background-color: rgba(0, 0, 0, 0.7);
	}

	.image-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		padding: 40rpx 20rpx 20rpx;
		transform: translateY(100%);
		transition: transform 0.3s ease;
	}

	.image-card:active .image-overlay {
		transform: translateY(0);
	}

	.image-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.image-title {
		color: #ffffff;
		font-size: 28rpx;
		font-weight: 500;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.image-meta {
		color: #ffffff;
		font-size: 22rpx;
		opacity: 0.8;
		line-height: 1.3;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8rpx;
		padding: 15rpx;
	}

	.tag {
		background-color: #f0f6ff;
		color: #007AFF;
		font-size: 22rpx;
		padding: 6rpx 12rpx;
		border-radius: 12rpx;
		line-height: 1;
	}

	.tag.more {
		background-color: #f5f5f5;
		color: #666666;
	}

	/* 响应式适配 */
	@media (max-width: 375px) {
		.image-title {
			font-size: 26rpx;
		}
		
		.image-meta {
			font-size: 20rpx;
		}
		
		.tag {
			font-size: 20rpx;
			padding: 4rpx 10rpx;
		}
	}
</style> 