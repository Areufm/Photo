<template>
	<view class="profile-page">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-avatar" @click="changeAvatar">
				<image 
					:src="userInfo.avatar" 
					mode="aspectFill"
					@error="onAvatarError"
				></image>
				<view class="avatar-edit">
					<uni-icons type="camera" size="16" color="#ffffff"></uni-icons>
				</view>
			</view>
			
			<view class="user-info">
				<view class="user-name">
					<text>{{ userInfo.nickname }}</text>
					<view class="edit-name-btn" @click="editNickname">
						<uni-icons type="compose" size="16" color="#666"></uni-icons>
					</view>
				</view>
				<text class="user-desc">加入于 {{ formatJoinTime }}</text>
			</view>
		</view>

		<!-- 统计数据 -->
		<view class="stats-card">
			<view class="stat-item" @click="navigateTo('/pages/favorites/favorites')">
				<text class="stat-number">{{ userInfo.favoriteCount }}</text>
				<text class="stat-label">收藏</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-number">{{ userInfo.categoryCount }}</text>
				<text class="stat-label">分类</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item">
				<text class="stat-number">{{ userInfo.uploadCount }}</text>
				<text class="stat-label">上传</text>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-group">
				<view class="menu-title">图库管理</view>
				
				<view class="menu-item" @click="navigateTo('/pages/favorites/favorites')">
					<view class="menu-icon">
						<uni-icons type="heart" size="20" color="#FF3B30"></uni-icons>
					</view>
					<view class="menu-content">
						<text class="menu-text">我的收藏</text>
						<text class="menu-desc">查看收藏的图片</text>
					</view>
					<view class="menu-arrow">
						<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
					</view>
				</view>
				
				<view class="menu-item" @click="navigateTo('/pages/category/category')">
					<view class="menu-icon">
						<uni-icons type="folder" size="20" color="#007AFF"></uni-icons>
					</view>
					<view class="menu-content">
						<text class="menu-text">我的分类</text>
						<text class="menu-desc">管理图片分类</text>
					</view>
					<view class="menu-arrow">
						<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
					</view>
				</view>
				
				<view class="menu-item" @click="showUploadDialog">
					<view class="menu-icon">
						<uni-icons type="cloud-upload" size="20" color="#34C759"></uni-icons>
					</view>
					<view class="menu-content">
						<text class="menu-text">批量上传</text>
						<text class="menu-desc">批量上传图片</text>
					</view>
					<view class="menu-arrow">
						<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
					</view>
				</view>
			</view>

			<view class="menu-group">
				<view class="menu-title">设置</view>
				
				<view class="menu-item" @click="showStorageInfo">
					<view class="menu-icon">
						<uni-icons type="gear" size="20" color="#666"></uni-icons>
					</view>
					<view class="menu-content">
						<text class="menu-text">存储管理</text>
						<text class="menu-desc">查看存储使用情况</text>
					</view>
					<view class="menu-arrow">
						<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
					</view>
				</view>
				
				<view class="menu-item" @click="clearCache">
					<view class="menu-icon">
						<uni-icons type="trash" size="20" color="#FF9500"></uni-icons>
					</view>
					<view class="menu-content">
						<text class="menu-text">清理缓存</text>
						<text class="menu-desc">清理应用缓存数据</text>
					</view>
					<view class="menu-arrow">
						<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
					</view>
				</view>
				
				<view class="menu-item" @click="showAbout">
					<view class="menu-icon">
						<uni-icons type="info" size="20" color="#5856D6"></uni-icons>
					</view>
					<view class="menu-content">
						<text class="menu-text">关于应用</text>
						<text class="menu-desc">版本信息与帮助</text>
					</view>
					<view class="menu-arrow">
						<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 编辑昵称弹窗 -->
		<uni-popup ref="nicknamePopup" type="center">
			<view class="nickname-dialog">
				<view class="dialog-header">
					<text class="dialog-title">修改昵称</text>
				</view>
				<view class="dialog-content">
					<input 
						class="nickname-input" 
						type="text" 
						placeholder="请输入新昵称" 
						v-model="newNickname"
						maxlength="20"
					/>
				</view>
				<view class="dialog-footer">
					<view class="btn btn-secondary" @click="closeNicknameDialog">取消</view>
					<view class="btn btn-primary" @click="saveNickname">保存</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import { ref, reactive, computed, onMounted } from 'vue'
	import { api } from '@/utils/api.js'
	import { 
		showLoading, 
		hideLoading, 
		showToast, 
		showConfirm,
		navigateTo,
		chooseImage,
		formatTime,
		storage
	} from '@/utils/common.js'

	export default {
		name: 'ProfilePage',
		setup() {
			// 响应式数据
			const userInfo = ref({
				id: '',
				nickname: '图库用户',
				avatar: '',
				email: '',
				phone: '',
				favoriteCount: 0,
				categoryCount: 0,
				uploadCount: 0,
				joinTime: ''
			})
			const newNickname = ref('')
			const showNicknameDialog = ref(false)

			// 计算属性：格式化加入时间
			const formatJoinTime = computed(() => {
				if (!userInfo.value.joinTime) return ''
				return formatTime(userInfo.value.joinTime, 'YYYY年MM月')
			})

			/**
			 * 加载用户信息
			 */
			async function loadUserInfo() {
				try {
					// 先从本地存储获取
					const localUserInfo = storage.get('userInfo')
					if (localUserInfo) {
						userInfo.value = { ...userInfo.value, ...localUserInfo }
					}

					// 再从接口获取最新数据
					const response = await api.getUserInfo()
					
					if (response.code === 200) {
						userInfo.value = { ...userInfo.value, ...response.data }
						// 更新本地存储
						storage.set('userInfo', userInfo.value)
					}
				} catch (error) {
					console.error('加载用户信息失败:', error)
				}
			}

			/**
			 * 更换头像
			 */
			async function changeAvatar() {
				try {
					const result = await chooseImage(1)
					
					if (result.tempFilePaths && result.tempFilePaths.length > 0) {
						showLoading('上传中...')
						
						// 模拟上传头像
						setTimeout(() => {
							userInfo.value.avatar = result.tempFilePaths[0]
							storage.set('userInfo', userInfo.value)
							hideLoading()
							showToast('头像更新成功', 'success')
						}, 1500)
					}
				} catch (error) {
					console.error('选择头像失败:', error)
					showToast('选择头像失败')
				}
			}

			/**
			 * 头像加载失败处理
			 */
			function onAvatarError() {
				userInfo.value.avatar = '/static/images/default_avatar.png'
			}

			/**
			 * 编辑昵称
			 */
			function editNickname() {
				newNickname.value = userInfo.value.nickname
				showNicknameDialog.value = true
			}

			/**
			 * 保存昵称
			 */
			async function saveNickname() {
				if (!newNickname.value.trim()) {
					showToast('请输入昵称')
					return
				}

				try {
					showLoading('保存中...')
					
					// 模拟保存昵称
					setTimeout(() => {
						userInfo.value.nickname = newNickname.value.trim()
						storage.set('userInfo', userInfo.value)
						closeNicknameDialog()
						hideLoading()
						showToast('昵称更新成功', 'success')
					}, 1000)
					
				} catch (error) {
					hideLoading()
					console.error('保存昵称失败:', error)
					showToast('保存失败，请重试')
				}
			}

			/**
			 * 关闭昵称编辑弹窗
			 */
			function closeNicknameDialog() {
				showNicknameDialog.value = false
				newNickname.value = ''
			}

			/**
			 * 显示上传对话框
			 */
			function showUploadDialog() {
				uni.showActionSheet({
					itemList: ['相册选择', '拍照上传'],
					success: async (res) => {
						try {
							let sourceType = []
							if (res.tapIndex === 0) {
								sourceType = ['album']
							} else {
								sourceType = ['camera']
							}
							
							const result = await chooseImage(9, sourceType)
							
							if (result.tempFilePaths && result.tempFilePaths.length > 0) {
								showLoading('上传中...')
								
								// 模拟批量上传
								setTimeout(() => {
									hideLoading()
									showToast(`成功上传${result.tempFilePaths.length}张图片`, 'success')
									// 更新上传数量
									userInfo.value.uploadCount += result.tempFilePaths.length
									storage.set('userInfo', userInfo.value)
								}, 2000)
							}
						} catch (error) {
							console.error('上传失败:', error)
							showToast('上传失败')
						}
					}
				})
			}

			/**
			 * 显示存储信息
			 */
			function showStorageInfo() {
				uni.showModal({
					title: '存储信息',
					content: '已使用: 156MB\n总容量: 1GB\n剩余空间: 868MB',
					showCancel: false,
					confirmText: '知道了'
				})
			}

			/**
			 * 清理缓存
			 */
			async function clearCache() {
				const confirmed = await showConfirm(
					'确定要清理缓存吗？这将删除临时文件和缓存数据。',
					'清理缓存'
				)
				
				if (confirmed) {
					showLoading('清理中...')
					
					// 模拟清理缓存
					setTimeout(() => {
						hideLoading()
						showToast('缓存清理完成', 'success')
					}, 1500)
				}
			}

			/**
			 * 显示关于信息
			 */
			function showAbout() {
				uni.showModal({
					title: '关于图库管理',
					content: '版本: 1.0.0\n开发者: 图库团队\n\n一个优雅的图库管理应用，支持图片分类、收藏和管理功能。',
					showCancel: false,
					confirmText: '知道了'
				})
			}

			// 页面加载时执行
			onMounted(() => {
				loadUserInfo()
			})

			return {
				userInfo,
				newNickname,
				showNicknameDialog,
				formatJoinTime,
				changeAvatar,
				onAvatarError,
				editNickname,
				saveNickname,
				closeNicknameDialog,
				showUploadDialog,
				showStorageInfo,
				clearCache,
				showAbout,
				navigateTo
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-page {
		min-height: 100vh;
		background-color: #f8f8f8;
		padding-bottom: 100rpx;
	}

	.user-card {
		background-color: #ffffff;
		padding: 40rpx;
		display: flex;
		align-items: center;
		gap: 30rpx;
		margin-bottom: 20rpx;
	}

	.user-avatar {
		position: relative;
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		overflow: hidden;
		background-color: #f5f5f5;
	}

	.user-avatar image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-edit {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background-color: #007AFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4rpx solid #ffffff;
	}

	.user-info {
		flex: 1;
	}

	.user-name {
		display: flex;
		align-items: center;
		gap: 15rpx;
		margin-bottom: 10rpx;
	}

	.user-name text {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	.edit-name-btn {
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;
		border-radius: 50%;
	}

	.user-desc {
		font-size: 26rpx;
		color: #999999;
	}

	.stats-card {
		background-color: #ffffff;
		padding: 30rpx;
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
	}

	.stat-number {
		font-size: 40rpx;
		font-weight: bold;
		color: #333333;
	}

	.stat-label {
		font-size: 24rpx;
		color: #666666;
	}

	.stat-divider {
		width: 2rpx;
		height: 60rpx;
		background-color: #f0f0f0;
	}

	.menu-section {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.menu-group {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.menu-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #333333;
		padding: 30rpx 40rpx 20rpx;
		border-bottom: 2rpx solid #f0f0f0;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx 40rpx;
		transition: background-color 0.2s ease;
		border-bottom: 2rpx solid #f0f0f0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-item:active {
		background-color: #f5f5f5;
	}

	.menu-icon {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f6ff;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.menu-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.menu-text {
		font-size: 32rpx;
		color: #333333;
		line-height: 1.4;
	}

	.menu-desc {
		font-size: 24rpx;
		color: #999999;
		line-height: 1.3;
	}

	.menu-arrow {
		margin-left: 20rpx;
	}

	.nickname-dialog {
		width: 600rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.dialog-header {
		padding: 30rpx 40rpx;
		border-bottom: 2rpx solid #f0f0f0;
	}

	.dialog-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		text-align: center;
	}

	.dialog-content {
		padding: 40rpx;
	}

	.nickname-input {
		width: 100%;
		padding: 20rpx;
		border: 2rpx solid #e5e5e5;
		border-radius: 12rpx;
		font-size: 32rpx;
		color: #333333;
		background-color: #fafafa;
	}

	.dialog-footer {
		display: flex;
		gap: 20rpx;
		padding: 30rpx 40rpx;
		border-top: 2rpx solid #f0f0f0;
	}

	.dialog-footer .btn {
		flex: 1;
		text-align: center;
		padding: 25rpx;
		border-radius: 12rpx;
		font-size: 32rpx;
	}
</style> 