export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 成功回调
export function success<T = unknown>(data: T | null = null, message: string = "成功"): ApiResponse<T | null> {
  return {
    code: 200,
    data,
    message,
  };
}

// 客户端错误响应
export function error<T = unknown>(message: string = "", data: T | null = null): ApiResponse<T | null> {
  return {
    code: 400,
    data,
    message,
  };
}
