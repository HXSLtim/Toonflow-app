// 全局类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
