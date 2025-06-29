<template>
	<view class="category-page">
		<!-- 顶部搜索 -->
		<view class="header">
			<view class="search-box">
				<uni-icons type="search" size="18" color="#999999" />
				<input 
					v-model="searchKeyword"
					placeholder="搜索分类..."
					placeholder-class="search-placeholder"
					@input="onSearchInput"
				/>
			</view>
			<view class="add-btn" @click="showCreateModal = true">
				<uni-icons type="plus" size="18" color="#007AFF" />
			</view>
		</view>
		
		<!-- 分类网格 -->
		<view class="category-grid">
			<view 
				v-for="category in filteredCategories"
				:key="category.id"
				class="category-card"
				@click="handleCategoryClick(category)"
			>
				<view class="card-image">
					<image 
						:src="category.cover"
						mode="aspectFill"
						class="cover-image"
						:lazy-load="true"
					/>
					<view class="image-overlay">
						<text class="count-text">{{ category.count }} 张</text>
					</view>
				</view>
				
				<view class="card-content">
					<text class="category-name">{{ category.name }}</text>
					<text class="category-desc">{{ category.description || '暂无描述' }}</text>
				</view>
				
				<view class="card-actions">
					<view class="action-btn" @click.stop="handleEdit(category)">
						<uni-icons type="compose" size="16" color="#666666" />
					</view>
					<view class="action-btn" @click.stop="handleDelete(category)">
						<uni-icons type="trash" size="16" color="#FF3B30" />
					</view>
				</view>
			</view>
		</view>
		
		<!-- 空状态 -->
		<view v-if="!loading && filteredCategories.length === 0" class="empty-state">
			<image src="/static/images/empty_category.png" mode="aspectFit" />
			<text class="empty-text">暂无分类</text>
			<button class="btn btn-primary" @click="showCreateModal = true">
				创建分类
			</button>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading">
			<uni-icons type="spinner-cycle" size="20" color="#999999" />
			<text>加载中...</text>
		</view>
		
		<!-- 创建/编辑分类弹窗 -->
		<uni-popup ref="createPopup" type="center">
			<view class="create-modal">
				<view class="modal-header">
					<text class="modal-title">{{ editingCategory ? '编辑分类' : '新建分类' }}</text>
					<view class="close-btn" @click="closeCreateModal">
						<uni-icons type="close" size="20" color="#999999" />
					</view>
				</view>
				
				<view class="modal-content">
					<view class="form-item">
						<text class="form-label">分类名称</text>
						<input 
							v-model="formData.name"
							placeholder="请输入分类名称"
							class="form-input"
							maxlength="20"
						/>
					</view>
					
					<view class="form-item">
						<text class="form-label">分类描述</text>
						<textarea 
							v-model="formData.description"
							placeholder="请输入分类描述（可选）"
							class="form-textarea"
							maxlength="100"
							:auto-height="true"
						/>
					</view>
					
					<view class="form-item">
						<text class="form-label">封面图片</text>
						<view class="cover-upload" @click="chooseCover">
							<image 
								v-if="formData.cover"
								:src="formData.cover"
								mode="aspectFill"
								class="cover-preview"
							/>
							<view v-else class="upload-placeholder">
								<uni-icons type="image" size="30" color="#cccccc" />
								<text>选择封面</text>
							</view>
						</view>
					</view>
				</view>
				
				<view class="modal-footer">
					<button class="btn btn-secondary" @click="closeCreateModal">
						取消
					</button>
					<button 
						class="btn btn-primary" 
						@click="handleSubmit"
						:disabled="!formData.name.trim()"
					>
						{{ editingCategory ? '保存' : '创建' }}
					</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup lang="ts">
/**
 * 分类页面 - TypeScript + Setup语法糖版本
 * 管理图片分类，支持创建、编辑、删除分类
 */
import { ref, computed, onMounted, reactive } from 'vue'
import { debounce, navigateTo, showToast, showConfirm, chooseImage } from '@/utils/common'
import { api } from '@/utils/api'
import type { CategoryItem } from '@/utils/api'

// 表单数据接口
interface FormData {
	name: string
	description: string
	cover: string
}

// 响应式数据
const categories = ref<CategoryItem[]>([])
const searchKeyword = ref<string>('')
const loading = ref<boolean>(false)
const showCreateModal = ref<boolean>(false)
const editingCategory = ref<CategoryItem | null>(null)

// 表单数据
const formData = reactive<FormData>({
	name: '',
	description: '',
	cover: ''
})

// 计算筛选后的分类列表
const filteredCategories = computed<CategoryItem[]>(() => {
	if (!searchKeyword.value.trim()) {
		return categories.value
	}
	
	const keyword = searchKeyword.value.toLowerCase()
	return categories.value.filter(category =>
		category.name.toLowerCase().includes(keyword) ||
		category.description.toLowerCase().includes(keyword)
	)
})

/**
 * 防抖搜索
 */
const onSearchInput = debounce(() => {
	console.log('搜索分类:', searchKeyword.value)
}, 300)

/**
 * 获取分类列表
 */
const getCategoryList = async (): Promise<void> => {
	try {
		loading.value = true
		const response = await api.getCategoryList()
		
		if (response.code === 200) {
			categories.value = response.data
		}
	} catch (error) {
		console.error('获取分类列表失败:', error)
		showToast('获取分类失败')
	} finally {
		loading.value = false
	}
}

/**
 * 处理分类点击
 */
const handleCategoryClick = (category: CategoryItem): void => {
	navigateTo('/pages/category/folder', { 
		id: category.id,
		name: category.name 
	})
}

/**
 * 处理编辑分类
 */
const handleEdit = (category: CategoryItem): void => {
	editingCategory.value = category
	formData.name = category.name
	formData.description = category.description
	formData.cover = category.cover
	showCreateModal.value = true
}

/**
 * 处理删除分类
 */
const handleDelete = async (category: CategoryItem): Promise<void> => {
	const confirmed = await showConfirm(
		`确定要删除分类"${category.name}"吗？此操作将同时删除该分类下的所有图片。`,
		'危险操作'
	)
	
	if (confirmed) {
		try {
			// 这里应该调用删除API
			showToast('删除功能开发中')
		} catch (error) {
			console.error('删除分类失败:', error)
			showToast('删除失败')
		}
	}
}

/**
 * 选择封面图片
 */
const chooseCover = async (): Promise<void> => {
	try {
		const result = await chooseImage(1)
		if (result.tempFilePaths.length > 0) {
			formData.cover = result.tempFilePaths[0]
		}
	} catch (error) {
		console.error('选择封面失败:', error)
		showToast('选择图片失败')
	}
}

/**
 * 关闭创建弹窗
 */
const closeCreateModal = (): void => {
	showCreateModal.value = false
	editingCategory.value = null
	
	// 重置表单
	formData.name = ''
	formData.description = ''
	formData.cover = ''
}

/**
 * 提交表单
 */
const handleSubmit = async (): Promise<void> => {
	if (!formData.name.trim()) {
		showToast('请输入分类名称')
		return
	}
	
	try {
		const categoryData = {
			name: formData.name.trim(),
			description: formData.description.trim(),
			cover: formData.cover,
			count: 0
		}
		
		if (editingCategory.value) {
			// 编辑分类
			showToast('编辑功能开发中')
		} else {
			// 创建分类
			const response = await api.createCategory(categoryData)
			if (response.code === 200) {
				showToast('创建成功')
				await getCategoryList() // 刷新列表
			} else {
				showToast('创建失败')
			}
		}
		
		closeCreateModal()
	} catch (error) {
		console.error('提交失败:', error)
		showToast('操作失败')
	}
}

// 页面挂载时加载数据
onMounted(() => {
	getCategoryList()
})
</script>

<style lang="scss" scoped>
	.category-page {
		background-color: #f8f8f8;
		min-height: 100vh;
	}

	.header {
		background-color: #ffffff;
		padding: 20rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	}

	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		padding: 0 30rpx;
		height: 70rpx;
	}

	.search-box input {
		flex: 1;
		margin-left: 20rpx;
		font-size: 28rpx;
	}

	.search-placeholder {
		color: #999999;
	}

	.add-btn {
		width: 70rpx;
		height: 70rpx;
		background-color: #f0f6ff;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.category-grid {
		padding: 20rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.category-card {
		width: calc((100% - 20rpx) / 2);
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		transition: transform 0.2s ease;
	}

	.category-card:active {
		transform: scale(0.98);
	}

	.card-image {
		position: relative;
		height: 200rpx;
		overflow: hidden;
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.image-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
		padding: 20rpx 15rpx 10rpx;
		display: flex;
		justify-content: flex-end;
	}

	.count-text {
		color: #ffffff;
		font-size: 22rpx;
		background: rgba(0, 0, 0, 0.5);
		padding: 4rpx 8rpx;
		border-radius: 10rpx;
	}

	.card-content {
		padding: 20rpx 15rpx 10rpx;
	}

	.category-name {
		font-size: 28rpx;
		font-weight: 500;
		color: #333333;
		line-height: 1.4;
		margin-bottom: 8rpx;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.category-desc {
		font-size: 24rpx;
		color: #999999;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-actions {
		display: flex;
		justify-content: flex-end;
		padding: 0 15rpx 15rpx;
		gap: 15rpx;
	}

	.action-btn {
		width: 50rpx;
		height: 50rpx;
		background-color: #f5f5f5;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.action-btn:active {
		transform: scale(0.9);
		background-color: #e5e5e5;
	}

	.empty-state {
		text-align: center;
		padding: 100rpx 40rpx;
	}

	.empty-state image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
		opacity: 0.5;
	}

	.empty-text {
		display: block;
		color: #999999;
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx;
		gap: 20rpx;
	}

	.loading text {
		color: #999999;
		font-size: 26rpx;
	}

	.create-modal {
		width: 600rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.modal-title {
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

	.modal-content {
		padding: 40rpx;
	}

	.form-item {
		margin-bottom: 40rpx;
	}

	.form-label {
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 15rpx;
		display: block;
	}

	.form-input,
	.form-textarea {
		width: 100%;
		background-color: #f5f5f5;
		border: none;
		border-radius: 12rpx;
		padding: 20rpx;
		font-size: 28rpx;
		color: #333333;
	}

	.form-input {
		height: 80rpx;
	}

	.form-textarea {
		min-height: 120rpx;
	}

	.cover-upload {
		width: 200rpx;
		height: 120rpx;
		border: 2rpx dashed #e5e5e5;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		cursor: pointer;
	}

	.cover-preview {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
	}

	.upload-placeholder text {
		font-size: 22rpx;
		color: #cccccc;
	}

	.modal-footer {
		display: flex;
		gap: 20rpx;
		padding: 0 40rpx 40rpx;
	}

	.modal-footer .btn {
		flex: 1;
		height: 80rpx;
		border-radius: 20rpx;
		font-size: 28rpx;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style> 